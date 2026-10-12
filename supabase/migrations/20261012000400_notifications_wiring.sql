-- Applied 2026-10-12 to rrslhxigqtfllunmowcy. Wire in-app notifications into the
-- existing assignment + lead-sync triggers. Every notification INSERT is wrapped
-- in its own exception-safe block so a notification can never roll back (and thus
-- block) a student's test submission or a tester's review.
--
--   test_assigned      → the tester, when a test is routed to them
--   backlog            → global admin(s), when all testers are at capacity
--   lead_test_submitted→ the lead's agent, when their student submits
--   lead_reviewed      → the lead's agent, when the report is ready
-- (account_created for the agent is emitted by the lead-link edge function.)

CREATE OR REPLACE FUNCTION public.auto_assign_tester()
  RETURNS trigger
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public'
AS $$
DECLARE
  v_today date := (now() AT TIME ZONE 'Africa/Cairo')::date;
  v_pick uuid;
  v_cap int := 15;
  v_name text := COALESCE(NEW.student_info->>'name', 'A student');
  v_admin uuid;
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
      BEGIN
        INSERT INTO public.notifications(user_id, type, title, body, data)
        VALUES (v_pick, 'test_assigned', 'New test to review',
                v_name || ' submitted a placement test for your review.',
                jsonb_build_object('session_id', NEW.id));
      EXCEPTION WHEN OTHERS THEN NULL;
      END;
    ELSE
      BEGIN
        FOR v_admin IN
          SELECT id FROM public.profiles WHERE role = 'admin' AND organization_id IS NULL
        LOOP
          INSERT INTO public.notifications(user_id, type, title, body, data)
          VALUES (v_admin, 'backlog', 'Test waiting for assignment',
                  v_name || ' submitted a test but all testers are at capacity today — assign it manually.',
                  jsonb_build_object('session_id', NEW.id));
        END LOOP;
      EXCEPTION WHEN OTHERS THEN NULL;
      END;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.lead_sync_on_session()
  RETURNS trigger
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public'
AS $$
DECLARE
  r_agent uuid;
  r_name text := COALESCE(NEW.student_info->>'name', 'A student');
BEGIN
  IF NEW.status = 'completed'
     AND NEW.user_id IS NOT NULL
     AND (TG_OP = 'INSERT' OR OLD.status IS DISTINCT FROM 'completed') THEN
    UPDATE public.leads
       SET session_id = NEW.id, status = 'test_submitted', updated_at = now()
     WHERE student_user_id = NEW.user_id
       AND status IN ('new', 'link_sent', 'account_created')
       AND (session_id IS NULL OR session_id = NEW.id)
    RETURNING agent_id INTO r_agent;
    IF r_agent IS NOT NULL THEN
      BEGIN
        INSERT INTO public.notifications(user_id, type, title, body, data)
        VALUES (r_agent, 'lead_test_submitted', 'Your lead submitted a test',
                r_name || ' completed their placement test.',
                jsonb_build_object('session_id', NEW.id));
      EXCEPTION WHEN OTHERS THEN NULL;
      END;
    END IF;
  END IF;

  IF NEW.status IN ('approved', 'rejected')
     AND (TG_OP = 'INSERT' OR OLD.status IS DISTINCT FROM NEW.status) THEN
    UPDATE public.leads
       SET status = 'reviewed', updated_at = now()
     WHERE session_id = NEW.id AND status <> 'reviewed'
    RETURNING agent_id INTO r_agent;
    IF r_agent IS NOT NULL THEN
      BEGIN
        INSERT INTO public.notifications(user_id, type, title, body, data)
        VALUES (r_agent, 'lead_reviewed', 'Report ready for your lead',
                'The performance report for ' || r_name || ' is ready to view and send.',
                jsonb_build_object('session_id', NEW.id));
      EXCEPTION WHEN OTHERS THEN NULL;
      END;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;
