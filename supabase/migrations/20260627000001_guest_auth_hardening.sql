-- ============================================================================
-- DRAFT — NOT APPLIED. Same sign-off requirement as
-- 20260627000000_security_hardening_draft.sql: apply on a Supabase branch
-- first, re-run the security advisor, confirm the app works end-to-end
-- (especially the anonymous/guest test-taking path), then promote.
--
-- Remediates the live RLS hole flagged in
-- 20260627000000_security_hardening_draft.sql's "NOT IN THIS FILE" section:
-- assessment_responses' SELECT and INSERT policies use
--   ... OR assessment_sessions.user_id IS NULL
-- to let guest test-takers read/write their own session's responses, but
-- that clause has no way to tie the request back to "the same anonymous
-- browser that created the session" — it grants read AND write access to
-- EVERY anonymous session's responses, to ANY caller. Verified live via
-- pg_policies (see below) before writing this.
--
-- Product decision (via AskUserQuestion): keep the no-signup guest flow,
-- but secure it. Chosen mechanism: Supabase Anonymous Sign-ins
-- (auth.signInAnonymously()) instead of a hand-rolled token/column. Every
-- guest browser gets a real auth.uid(), so the existing
-- "user_id = auth.uid()" pattern already used everywhere else in this
-- schema covers guests for free — no new column, no new RPC function.
--
-- App-side changes already made (same commit as this migration):
--   - src/services/sessionService.ts: new ensureAuthSession() helper calls
--     signInAnonymously() when there's no session yet; wired into
--     initializeSession() and storeAssessmentData().
--   - src/hooks/assessment/useSupabaseStorageResponse.ts: storePromptResponse
--     now calls ensureAuthSession() before its Edge Function / direct-insert
--     fallback, instead of a raw supabase.auth.getSession() check.
-- ============================================================================


-- ----------------------------------------------------------------------------
-- 1. handle_new_user(): guard against anonymous sign-ins.
--
-- Verified live: public.profiles.email is NOT NULL. auth.users rows created
-- by signInAnonymously() have email = NULL. Without this guard, the very
-- first anonymous sign-in would fail closed: the trigger's profiles insert
-- raises a NOT NULL violation and rolls back the auth.users insert with it,
-- so anonymous sign-in could never succeed once enabled in project settings.
--
-- Verified live (pg_trigger) this function fires only via on_auth_user_created
-- (AFTER INSERT ON auth.users) — no other trigger references it, so this
-- change is scoped to exactly the new-user path.
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF NEW.is_anonymous THEN
    RETURN NEW;
  END IF;

  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    'learner'
  );
  RETURN NEW;
END;
$function$;


-- ----------------------------------------------------------------------------
-- 2. assessment_responses: close the cross-session read/write hole.
--
-- Drops the "OR assessment_sessions.user_id IS NULL" branch from both
-- policies so they match the user_id = auth.uid() pattern used everywhere
-- else. Re-creating (not ALTER) so each policy's full definition stays
-- readable in one place; text below is the verified live definition with
-- only that one branch removed.
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can insert assessment responses" ON public.assessment_responses;
CREATE POLICY "Users can insert assessment responses"
ON public.assessment_responses
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.assessment_sessions
    WHERE assessment_sessions.id = assessment_responses.session_id
      AND assessment_sessions.user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Users can select assessment responses" ON public.assessment_responses;
CREATE POLICY "Users can select assessment responses"
ON public.assessment_responses
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.assessment_sessions
    WHERE assessment_sessions.id = assessment_responses.session_id
      AND assessment_sessions.user_id = auth.uid()
  )
);

-- "Users can update their session responses" and "Assessors can view
-- organization responses" already have no IS NULL branch — verified live,
-- left unchanged.


-- ----------------------------------------------------------------------------
-- 3. assessment_sessions: remove the now-dead NULL-user_id INSERT branch.
--
-- Not a live exploit by itself: assessment_sessions.user_id is NOT NULL, so
-- "(auth.uid() IS NULL) AND (user_id IS NULL)" can never actually insert a
-- row, and no SELECT/UPDATE/DELETE policy on this table has a matching IS
-- NULL branch — even a hypothetical such row could never be read back by
-- anyone. Removed for clarity, not for safety: under the anonymous-sign-in
-- model every caller (guest or not) has a real auth.uid(), so this table's
-- INSERT check is simply "user_id = auth.uid()" like its other policies,
-- with no NULL special-casing left to misread as still-supported.
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Allow session creation for users and anonymous" ON public.assessment_sessions;
CREATE POLICY "Allow session creation for users and anonymous"
ON public.assessment_sessions
FOR INSERT
WITH CHECK (
  user_id = auth.uid()
);


-- ============================================================================
-- APP-SIDE / PROJECT-SETTINGS PREREQUISITE — must be done before this
-- migration is applied, or guest mode breaks instead of becoming secure:
--
-- Enable Anonymous Sign-ins for this project (Supabase dashboard:
-- Authentication > Settings > User Signups > Allow anonymous sign-ins).
-- Until that's on, signInAnonymously() returns an error and every session
-- falls back to createAnonymousSession() / finalizeAnonymousSession() in
-- sessionService.ts — which insert user_id: null and have always violated
-- assessment_sessions.user_id's NOT NULL constraint (verified live; this is
-- a pre-existing bug, not introduced here). Net effect if this migration
-- ships before the toggle is flipped: guest mode stops working rather than
-- failing open. Verify the toggle is on, on a branch, before promoting.
-- ============================================================================


-- ============================================================================
-- KNOWN FOLLOW-ON (not built here, flagging for a separate decision):
--
-- src/pages/AssessmentResults.tsx fetches results by ?sessionId= alone, with
-- no session/auth check. With the SELECT policy above now requiring
-- assessment_sessions.user_id = auth.uid(), a guest opening their results
-- link on a different browser/device (no localStorage session, no anonymous
-- JWT) will no longer be able to load it — the leak being closed here is
-- exactly what currently makes that link "work" cross-device. Needs a
-- product decision (e.g. a signed/short-lived results token separate from
-- auth) before that page can be fixed; out of scope here.
-- ============================================================================
