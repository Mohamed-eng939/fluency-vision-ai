-- ============================================================================
-- DRAFT — NOT APPLIED. Do not run against production without explicit
-- developer/owner sign-off. Recommended: apply on a Supabase branch first,
-- re-run the security advisor, confirm the app still works end-to-end
-- (including the anonymous/guest test-taking path), then promote.
--
-- Source: Step 1 of the deployment runbook, re-verified live against
-- project rrslhxigqtfllunmowcy (pg_policies, pg_trigger, pg_proc, and a
-- full repo grep for call sites) before being transcribed here. Two of the
-- runbook's original items were found to be unsafe as written and are
-- deliberately left out — see the bottom section.
-- ============================================================================


-- ----------------------------------------------------------------------------
-- 1. api_keys / training_data: remove direct client access (runbook 1a)
--
-- Verified: no frontend code and no edge-function source in this repo
-- queries either table via the anon/authenticated client. Both are meant
-- for service-role-only access (api_keys gates paid SaaS access;
-- training_data is the ML flywheel sink). Safe.
-- ----------------------------------------------------------------------------
REVOKE SELECT, INSERT, UPDATE, DELETE ON public.api_keys      FROM anon, authenticated;
REVOKE SELECT, INSERT, UPDATE, DELETE ON public.training_data FROM anon, authenticated;


-- ----------------------------------------------------------------------------
-- 2. Lock down SECURITY DEFINER helper functions NOT used by any live RLS
--    policy and with no .rpc() call site anywhere in this repo (runbook 1d,
--    partial — see bottom section for the three left out).
--
-- Verified via:
--   SELECT * FROM pg_policies WHERE qual/with_check ILIKE '%<fn>%'  -> none
--   grep -r "\.rpc(" across fluency-vision-ai (frontend + edge functions)
--   and mfa_backend                                                 -> none
--   pg_trigger (all non-internal triggers)                          -> only
--     handle_new_user() and update_updated_at_column() fire as triggers
-- ----------------------------------------------------------------------------
REVOKE EXECUTE ON FUNCTION public.handle_new_user()                         FROM anon, authenticated; -- trigger-only, fires on auth.users insert
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column()                FROM anon, authenticated; -- trigger-only, fires on 6 updated_at triggers
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, text)                      FROM anon, authenticated; -- no policy or call site found
REVOKE EXECUTE ON FUNCTION public.same_organization(uuid)                   FROM anon, authenticated; -- no policy or call site found
REVOKE EXECUTE ON FUNCTION public.find_session_for_finalization(uuid, uuid) FROM anon, authenticated; -- no policy or call site found


-- ============================================================================
-- DELIBERATELY NOT INCLUDED — runbook 1d also listed these three:
--
--     is_admin_or_assessor()
--     get_current_user_role()
--     get_current_user_organization()
--
-- Do NOT revoke EXECUTE on these from anon/authenticated. Confirmed live
-- (pg_policies) that all three are called directly inside the USING /
-- WITH CHECK clauses of RLS policies on assessment_sessions,
-- assessment_responses, assessor_reviews, organizations, profiles, and
-- prompts — i.e. most of the schema.
--
-- Postgres checks EXECUTE permission against the CALLING role every time a
-- function runs, including when the call happens inside a policy
-- expression. SECURITY DEFINER only changes what the function does
-- internally once it's allowed to run — it does not let the calling role
-- skip that EXECUTE check. Revoking EXECUTE on these three would make
-- every policy that references them raise "permission denied for
-- function ..." for ordinary anon/authenticated queries, which would
-- break read/write access across nearly the entire app for every signed-in
-- user and every anonymous test-taker simultaneously.
--
-- If these still need locking down (so they can't be called directly via
-- supabase.rpc(), separate from their use inside policies), that requires
-- a different approach — e.g. moving them to a schema not exposed via
-- PostgREST — and must be tested on a Supabase branch first.
-- ============================================================================


-- ============================================================================
-- NOT IN THIS FILE — needs a product decision before any SQL is written:
--
-- assessment_responses has a live RLS hole, found during this review (not
-- in the original runbook). Its SELECT and INSERT policies both use:
--   ... OR assessment_sessions.user_id IS NULL
-- as an alternative to "assessment_sessions.user_id = auth.uid()", intended
-- to let anonymous/guest test-takers read and write their own session's
-- responses. But the clause has no way to tie the request back to "the
-- same anonymous browser that created the session" — so it actually grants
-- read AND write access to EVERY anonymous session's responses, to ANY
-- caller (anon or authenticated, related to that session or not). See the
-- chat summary for evidence and remediation options; this needs a decision
-- on how guest test-taking should be secured before it can be drafted as
-- SQL.
-- ============================================================================
