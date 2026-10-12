-- Applied 2026-10-12 to rrslhxigqtfllunmowcy. Keeps a sales-agent lead's status
-- in step with its student's assessment automatically:
--   test_submitted  when the student's session reaches 'completed'
--   reviewed        when that session is approved/rejected by a tester
-- The 'link_sent' step is set by the agent when they send the WhatsApp link,
-- and 'account_created' when the student claims the lead's link (lead-link fn).
CREATE OR REPLACE FUNCTION public.lead_sync_on_session()
  RETURNS trigger
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public'
AS $$
BEGIN
  -- Student submitted their test → attach the session + advance the lead.
  IF NEW.status = 'completed'
     AND NEW.user_id IS NOT NULL
     AND (TG_OP = 'INSERT' OR OLD.status IS DISTINCT FROM 'completed') THEN
    UPDATE public.leads
       SET session_id = NEW.id, status = 'test_submitted', updated_at = now()
     WHERE student_user_id = NEW.user_id
       AND status IN ('new', 'link_sent', 'account_created')
       AND (session_id IS NULL OR session_id = NEW.id);
  END IF;

  -- Tester finished the review → mark the lead reviewed.
  IF NEW.status IN ('approved', 'rejected')
     AND (TG_OP = 'INSERT' OR OLD.status IS DISTINCT FROM NEW.status) THEN
    UPDATE public.leads
       SET status = 'reviewed', updated_at = now()
     WHERE session_id = NEW.id AND status <> 'reviewed';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_lead_sync_on_session ON public.assessment_sessions;
CREATE TRIGGER trg_lead_sync_on_session
  AFTER INSERT OR UPDATE OF status ON public.assessment_sessions
  FOR EACH ROW EXECUTE FUNCTION public.lead_sync_on_session();
