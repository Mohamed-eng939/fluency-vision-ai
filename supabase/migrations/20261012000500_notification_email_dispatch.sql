-- Applied 2026-10-12 to rrslhxigqtfllunmowcy. Email fan-out for notifications.
-- Each email-worthy notification row (test_assigned / lead_* — NOT the
-- global-admin 'backlog' alerts, which stay in-app only) triggers a
-- fire-and-forget pg_net call to the notify-email edge function, which resolves
-- the recipient's email and sends via Resend. The dispatch is exception-safe so
-- it can never roll back (block) the notification insert, and notify-email is
-- inert until a Resend key is configured.

CREATE EXTENSION IF NOT EXISTS pg_net;

-- Private config holder for the dispatch shared secret. RLS on + no policies +
-- grants revoked ⇒ not reachable via the API; only SECURITY DEFINER code (owned
-- by postgres) and the service role read it. Provision the value out-of-band
-- (not stored in git):
--   INSERT INTO public.app_secrets(key,value) VALUES ('notify_secret','<secret>')
--   ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
-- and set the same value as the notify-email function's NOTIFY_SECRET (optional
-- hardening — the function enforces it only when that env var is present).
CREATE TABLE IF NOT EXISTS public.app_secrets (key text PRIMARY KEY, value text NOT NULL);
ALTER TABLE public.app_secrets ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.app_secrets FROM anon, authenticated;

CREATE OR REPLACE FUNCTION public.notifications_dispatch_email()
  RETURNS trigger
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public'
AS $$
DECLARE
  v_secret text;
BEGIN
  IF NEW.type IN ('test_assigned', 'lead_test_submitted', 'lead_reviewed', 'lead_account_created') THEN
    BEGIN
      SELECT value INTO v_secret FROM public.app_secrets WHERE key = 'notify_secret';
      PERFORM net.http_post(
        url := 'https://rrslhxigqtfllunmowcy.supabase.co/functions/v1/notify-email',
        body := jsonb_build_object('notification_id', NEW.id, 'secret', v_secret),
        headers := jsonb_build_object('Content-Type', 'application/json')
      );
    EXCEPTION WHEN OTHERS THEN NULL;
    END;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notifications_dispatch_email ON public.notifications;
CREATE TRIGGER trg_notifications_dispatch_email
  AFTER INSERT ON public.notifications
  FOR EACH ROW EXECUTE FUNCTION public.notifications_dispatch_email();
