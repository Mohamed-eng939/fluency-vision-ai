-- Tests weren't showing in organization-scoped views because sessions were
-- created with organization_id = NULL (the student's org was never stamped on
-- the session, and in some lead flows not even on the profile).
--
-- This (1) backfills profiles/sessions from the lead/profile org, and (2) adds
-- a BEFORE INSERT trigger so every new session is auto-tagged with the student's
-- organization — from their profile, falling back to a lead that links to them.

-- 1a) Profiles with a lead org but no profile org (e.g. lead-link claims that
--     didn't copy the org onto the profile).
UPDATE public.profiles p
SET organization_id = l.organization_id, updated_at = now()
FROM public.leads l
WHERE l.student_user_id = p.id
  AND p.organization_id IS NULL
  AND l.organization_id IS NOT NULL;

-- 1b) Existing sessions: profile org, else the linked lead's org.
UPDATE public.assessment_sessions s
SET organization_id = COALESCE(
  (SELECT organization_id FROM public.profiles WHERE id = s.user_id),
  (SELECT organization_id FROM public.leads
     WHERE student_user_id = s.user_id AND organization_id IS NOT NULL
     ORDER BY updated_at DESC LIMIT 1)
)
WHERE s.organization_id IS NULL;

-- 2) Auto-tag future sessions. SECURITY DEFINER so it can read profiles/leads
--    regardless of the inserting role's RLS.
CREATE OR REPLACE FUNCTION public.set_session_org()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.organization_id IS NULL AND NEW.user_id IS NOT NULL THEN
    SELECT organization_id INTO NEW.organization_id FROM public.profiles WHERE id = NEW.user_id;
    IF NEW.organization_id IS NULL THEN
      SELECT organization_id INTO NEW.organization_id
      FROM public.leads
      WHERE student_user_id = NEW.user_id AND organization_id IS NOT NULL
      ORDER BY updated_at DESC
      LIMIT 1;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_set_session_org ON public.assessment_sessions;
CREATE TRIGGER trg_set_session_org
  BEFORE INSERT ON public.assessment_sessions
  FOR EACH ROW EXECUTE FUNCTION public.set_session_org();
