-- ============================================================================
-- Upedia placement test — Step 1 security hardening  ***DRAFT — DO NOT AUTO-APPLY***
-- ============================================================================
-- Prepared from the live Supabase security advisor for project rrslhxigqtfllunmowcy.
-- This is NOT applied. Review each statement, then run on a Supabase BRANCH or
-- staging first, verify the app still works, and only then apply to production.
-- Re-run the security advisor afterwards and aim for a clean report.
--
-- Scope of this file: the SQL-applicable items (1a + 1d). The remaining Step‑1
-- items are configuration, handled outside SQL — see the notes at the bottom.
-- ----------------------------------------------------------------------------

-- 1a. Lock down the sensitive tables so API clients can't read them.
--     RLS still protects the row-scoped tables; these two should not be
--     client-reachable at all (service-role edge functions touch them).
REVOKE SELECT, INSERT, UPDATE, DELETE ON public.api_keys      FROM anon, authenticated;
REVOKE SELECT, INSERT, UPDATE, DELETE ON public.training_data FROM anon, authenticated;

-- 1d. Restrict the SECURITY DEFINER helper functions so they can't be invoked
--     directly via /rest/v1/rpc/. They keep working INSIDE RLS policies and
--     triggers after this (that path does not use the caller's EXECUTE grant).
--
--     Revoking from `anon` is safe for all of these. Before revoking from
--     `authenticated`, confirm the front-end never calls one via supabase.rpc()
--     — a repo search for each name returns no client call sites today, but
--     re-check before applying.
REVOKE EXECUTE ON FUNCTION public.handle_new_user()                          FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column()                 FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.has_role(_user_id uuid, _role text)        FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.is_admin_or_assessor()                     FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.get_current_user_role()                    FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.get_current_user_organization()            FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.same_organization(_user_id uuid)           FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.is_platform_admin()                        FROM anon, authenticated;
-- find_session_for_finalization IS called by the app during finalization — verify
-- the current flow before revoking from `authenticated`; revoking from anon is safe.
REVOKE EXECUTE ON FUNCTION public.find_session_for_finalization(session_uuid uuid, user_uuid uuid) FROM anon;

-- (The three trigger functions added in this build — auto_assign_tester,
--  lead_sync_on_session, notifications_dispatch_email — were already locked down
--  in migration 20261012000600_harden_trigger_functions.sql.)

-- ----------------------------------------------------------------------------
-- NOT SQL — do these in the dashboard / repo (Step‑1 items 1b, 1c, 1e):
--
-- 1b. Require auth on the data-handling edge functions. The intended settings
--     are already staged in supabase/config.toml (verify_jwt = true for
--     audio-processor, file-manager, session-manager, response-handler,
--     profile-manager, get-session-audio-files, grammar/fluency proxies, etc.).
--     Apply by deploying each with verify_jwt=true. NOTE: the guest/anonymous
--     test flow must be signing in anonymously first (see the config.toml
--     comments) before flipping audio-processor, or guest uploads will 401.
--
-- 1c. Delete the duplicate `assessor_manager` (underscore) edge function — it is
--     an unauthenticated copy of `assessor-manager` (hyphen). No call sites use
--     the underscore version. Remove it in the dashboard and from the repo.
--
-- 1e. Auth settings (Supabase → Authentication → settings):
--       * Email OTP expiry → under 1 hour.
--       * Enable leaked-password protection (HaveIBeenPwned).
--       * Upgrade Postgres to apply the outstanding security patches
--         (Settings → Infrastructure).
-- ============================================================================
