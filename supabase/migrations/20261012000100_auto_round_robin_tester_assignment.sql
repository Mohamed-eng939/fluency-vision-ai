-- Applied 2026-10-12 to rrslhxigqtfllunmowcy. Replaces the manual "Assign
-- Logic" with automatic, fair assignment: every session that reaches
-- status='completed' is routed to a tester (assessor) by round-robin.
--
-- Fairness rules (per the Upedia build):
--   * One test at a time, in turn -- never pile a batch onto one tester.
--     Order picks the tester with the fewest tests assigned TODAY, breaking
--     ties by who was assigned least recently, then by seniority (created_at).
--   * 15 tests/day hard cap per tester, counted on assigned_at in the
--     Africa/Cairo day (midnight Cairo reset). A capped tester is skipped.
--   * If every eligible tester is capped, the session is left UNASSIGNED
--     (assigned_assessor stays NULL) and waits for a Global Admin to assign it.
--   * Org scoping: a session is only routed to a tester in the same
--     organization (or a global/unscoped tester).
CREATE OR REPLACE FUNCTION public.auto_assign_tester()
  RETURNS trigger
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public'
AS $function$
DECLARE
  v_today date := (now() AT TIME ZONE 'Africa/Cairo')::date;
  v_pick uuid;
  v_cap int := 15;
BEGIN
  IF NEW.status = 'completed'
     AND NEW.assigned_assessor IS NULL
     AND (TG_OP = 'INSERT' OR OLD.status IS DISTINCT FROM 'completed') THEN
    SELECT p.id INTO v_pick
    FROM public.profiles p
    WHERE p.role = 'assessor'
      AND COALESCE(p.is_active, true) = true
      AND (NEW.organization_id IS NULL
           OR p.organization_id = NEW.organization_id
           OR p.organization_id IS NULL)
      AND (
        SELECT count(*) FROM public.assessment_sessions s
        WHERE s.assigned_assessor = p.id
          AND s.assigned_at IS NOT NULL
          AND (s.assigned_at AT TIME ZONE 'Africa/Cairo')::date = v_today
      ) < v_cap
    ORDER BY
      (SELECT count(*) FROM public.assessment_sessions s2
         WHERE s2.assigned_assessor = p.id
           AND s2.assigned_at IS NOT NULL
           AND (s2.assigned_at AT TIME ZONE 'Africa/Cairo')::date = v_today) ASC,
      (SELECT max(s3.assigned_at) FROM public.assessment_sessions s3
         WHERE s3.assigned_assessor = p.id) ASC NULLS FIRST,
      p.created_at ASC
    LIMIT 1;
    IF v_pick IS NOT NULL THEN
      NEW.assigned_assessor := v_pick;
      NEW.assigned_at := now();
    END IF;
  END IF;
  RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS trg_auto_assign_tester ON public.assessment_sessions;
CREATE TRIGGER trg_auto_assign_tester
  BEFORE INSERT OR UPDATE OF status ON public.assessment_sessions
  FOR EACH ROW EXECUTE FUNCTION public.auto_assign_tester();

CREATE INDEX IF NOT EXISTS sessions_assignee_assigned_at_idx
  ON public.assessment_sessions(assigned_assessor, assigned_at);
