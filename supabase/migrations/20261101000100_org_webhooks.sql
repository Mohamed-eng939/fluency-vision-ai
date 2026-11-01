-- Outbound webhooks to partner organizations.
-- PREPARED — apply when the Supabase tooling is available. Nothing here fires
-- until (a) this migration is applied AND (b) an org has a webhook_url set.

-- 1) Per-org receiving endpoint + HMAC signing secret.
ALTER TABLE public.organizations
  ADD COLUMN IF NOT EXISTS webhook_url    text,
  ADD COLUMN IF NOT EXISTS webhook_secret text;

-- 2) Delivery outbox + log. The dispatcher (service role) drains this.
CREATE TABLE IF NOT EXISTS public.webhook_deliveries (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id),
  event           text NOT NULL,
  event_id        uuid NOT NULL DEFAULT gen_random_uuid(),
  payload         jsonb NOT NULL,
  target_url      text NOT NULL,
  status          text NOT NULL DEFAULT 'pending',   -- pending | delivered | failed
  attempts        int  NOT NULL DEFAULT 0,
  last_status     int,
  last_error      text,
  next_attempt_at timestamptz NOT NULL DEFAULT now(),
  created_at      timestamptz NOT NULL DEFAULT now(),
  delivered_at    timestamptz
);
CREATE INDEX IF NOT EXISTS idx_webhook_deliveries_due
  ON public.webhook_deliveries (next_attempt_at) WHERE status = 'pending';

ALTER TABLE public.webhook_deliveries ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "webhook_deliveries platform admin" ON public.webhook_deliveries;
CREATE POLICY "webhook_deliveries platform admin" ON public.webhook_deliveries
  FOR ALL USING (is_platform_admin()) WITH CHECK (is_platform_admin());

-- 3) Enqueue a delivery when a session is assigned for review or reviewed.
--    Builds the payload, queues it only if the org registered a webhook_url, and
--    never raises (a webhook must never block a review/assignment).
CREATE OR REPLACE FUNCTION public.enqueue_org_webhook() RETURNS trigger
  LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE
  v_org       record;
  v_event     text;
  v_invite    record;
  v_candidate jsonb;
  v_review    record;
  v_os        jsonb;
  v_payload   jsonb;
BEGIN
  IF NEW.organization_id IS NULL THEN RETURN NEW; END IF;

  IF NEW.status = 'completed' AND NEW.assigned_assessor IS NOT NULL
     AND (TG_OP = 'INSERT' OR OLD.status IS DISTINCT FROM 'completed') THEN
    v_event := 'assessment.assigned';
  ELSIF NEW.status IN ('approved','rejected')
     AND (TG_OP = 'INSERT' OR OLD.status IS DISTINCT FROM NEW.status) THEN
    v_event := 'assessment.reviewed';
  ELSE
    RETURN NEW;
  END IF;

  SELECT id, webhook_url, webhook_secret INTO v_org
  FROM public.organizations WHERE id = NEW.organization_id;
  IF v_org.webhook_url IS NULL OR length(trim(v_org.webhook_url)) = 0 THEN
    RETURN NEW;  -- org has not registered a webhook endpoint
  END IF;

  SELECT candidate_name, candidate_code, external_id, candidate_age INTO v_invite
  FROM public.assessment_invites WHERE session_id = NEW.id
  ORDER BY created_at DESC LIMIT 1;

  v_candidate := jsonb_build_object(
    'name',        COALESCE(v_invite.candidate_name, NEW.student_info->>'name'),
    'code',        COALESCE(v_invite.candidate_code, v_invite.external_id),
    'external_id', v_invite.external_id,
    'age',         COALESCE(v_invite.candidate_age, NULLIF(NEW.student_info->>'age','')::int)
  );

  IF v_event = 'assessment.assigned' THEN
    v_payload := jsonb_build_object(
      'event', v_event,
      'sent_at', to_char(now() AT TIME ZONE 'UTC','YYYY-MM-DD"T"HH24:MI:SS"Z"'),
      'candidate', v_candidate,
      'status', 'in_review');
  ELSE
    SELECT override_scores, review_status INTO v_review
    FROM public.assessor_reviews WHERE session_id = NEW.id
    ORDER BY created_at DESC LIMIT 1;
    v_os := COALESCE(v_review.override_scores, '{}'::jsonb);
    v_payload := jsonb_build_object(
      'event', v_event,
      'sent_at', to_char(now() AT TIME ZONE 'UTC','YYYY-MM-DD"T"HH24:MI:SS"Z"'),
      'candidate', v_candidate,
      'result', jsonb_build_object(
        'cefr', COALESCE(NEW.overall_cefr_level::text, v_os->>'final_cefr_level'),
        'overall_score', NEW.overall_score,
        'criteria', jsonb_build_object(
          'grammar',    v_os->>'grammar_cefr',
          'fluency',    v_os->>'fluency_cefr',
          'vocabulary', v_os->>'vocabulary_cefr'),
        'upedia', jsonb_build_object(
          'program',  NEW.program,
          'subtrack', NEW.program_subtrack,
          'level',    NEW.upedia_level),
        'decision', COALESCE(v_review.review_status, NEW.status::text)));
  END IF;

  BEGIN
    INSERT INTO public.webhook_deliveries(organization_id, event, payload, target_url)
    VALUES (NEW.organization_id, v_event, v_payload, v_org.webhook_url);
  EXCEPTION WHEN OTHERS THEN NULL;  -- never block the underlying write
  END;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_enqueue_org_webhook ON public.assessment_sessions;
CREATE TRIGGER trg_enqueue_org_webhook
  AFTER INSERT OR UPDATE OF status ON public.assessment_sessions
  FOR EACH ROW EXECUTE FUNCTION public.enqueue_org_webhook();

REVOKE EXECUTE ON FUNCTION public.enqueue_org_webhook() FROM anon, authenticated;

-- NOTE (apply-time): schedule the dispatcher to drain the outbox, e.g. a pg_cron
-- job calling the `org-webhook-dispatch` edge function every minute via pg_net,
-- and set the org's webhook_url + webhook_secret. Delivery is signed HMAC-SHA256
-- over `${timestamp}.${body}` (see docs/PARTNER-API.md / the webhook guide).
