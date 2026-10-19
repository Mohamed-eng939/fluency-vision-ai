-- Applied 2026-10-19 to rrslhxigqtfllunmowcy.
-- TEMPORARY MANUAL OVERRIDE: route every placement test to tester Khaled
-- (1khaledmohamedmagdy@gmail.com, profile a9424e54-d47d-43c2-9753-5ca36f6efa1b),
-- regardless of whether the test was created by our own team or by a partner
-- organization through the API / embed flow. This replaces the round-robin
-- picker defined in 20261012000400_notifications_wiring.sql.
--
-- To restore automatic round-robin assignment later, re-apply the
-- auto_assign_tester() body from that earlier migration.

CREATE OR REPLACE FUNCTION public.auto_assign_tester()
  RETURNS trigger
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public'
AS $$
DECLARE
  -- The single tester every test is funnelled to for now.
  v_khaled constant uuid := 'a9424e54-d47d-43c2-9753-5ca36f6efa1b';
  v_pick uuid;
  v_name text := COALESCE(NEW.student_info->>'name', 'A student');
  v_admin uuid;
BEGIN
  IF NEW.status = 'completed'
     AND NEW.assigned_assessor IS NULL
     AND (TG_OP = 'INSERT' OR OLD.status IS DISTINCT FROM 'completed') THEN
    -- Assign to Khaled as long as that account is still an active assessor.
    SELECT p.id INTO v_pick
    FROM public.profiles p
    WHERE p.id = v_khaled
      AND p.role = 'assessor'
      AND COALESCE(p.is_active, true) = true;

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
      -- Fallback: if Khaled is deactivated/removed, leave the test unassigned
      -- and tell the admin(s), so a submission can never fail to save.
      BEGIN
        FOR v_admin IN
          SELECT id FROM public.profiles WHERE role = 'admin' AND organization_id IS NULL
        LOOP
          INSERT INTO public.notifications(user_id, type, title, body, data)
          VALUES (v_admin, 'backlog', 'Test waiting for assignment',
                  v_name || ' submitted a test but tester Khaled is unavailable — assign it manually.',
                  jsonb_build_object('session_id', NEW.id));
        END LOOP;
      EXCEPTION WHEN OTHERS THEN NULL;
      END;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

-- Backfill every test that still needs a review (leave already approved/rejected
-- ones untouched) onto Khaled, and send him one notification per test moved.
WITH moved AS (
  UPDATE public.assessment_sessions s
     SET assigned_assessor = 'a9424e54-d47d-43c2-9753-5ca36f6efa1b',
         assigned_at = COALESCE(s.assigned_at, now())
   WHERE s.status NOT IN ('approved', 'rejected')
     AND s.assigned_assessor IS DISTINCT FROM 'a9424e54-d47d-43c2-9753-5ca36f6efa1b'
  RETURNING s.id, COALESCE(s.student_info->>'name', 'A student') AS nm
)
INSERT INTO public.notifications(user_id, type, title, body, data)
SELECT 'a9424e54-d47d-43c2-9753-5ca36f6efa1b', 'test_assigned', 'New test to review',
       nm || ' submitted a placement test for your review.',
       jsonb_build_object('session_id', id)
FROM moved;
