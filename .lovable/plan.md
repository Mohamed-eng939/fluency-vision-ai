
Goal: Fix the “profile saves but assessment never starts” bug (both “Create Profile & Start Assessment” and “Skip Profile & Start Test”), where console shows auth SIGNED_IN + prompt init logs, but AssessmentFlow still renders `user: null`, `studentInfo: null`, `currentStep: entry`.

What the logs imply
- `initializeAssessment()` is being called (because `[PROMPT_INIT] ...` logs only happen when `initializePromptQueue()` runs inside `initializeAssessmentFlow`).
- Yet `currentStep` stays `entry` (it should switch to `welcome`), and `studentInfo` resets to `null`.
- This is classic behavior when the component/hook tree is effectively using different Supabase auth clients (or the auth session isn’t shared), causing state to appear “lost” across parts of the app.

Root cause (most likely, confirmed in code)
- The project currently uses TWO Supabase clients:
  - `src/integrations/supabase/client.ts` (used by AuthProvider, ProfileForm, some hooks)
  - `src/lib/supabase/client.ts` (used by sessionService and many other parts)
- Even though each file tries to be a singleton, they are separate singletons → two GoTrue clients sharing the same storage.
- This often causes “signed in” events to be observed in one place, while `getSession()`/`getUser()` elsewhere returns null or flips unexpectedly. It also causes re-renders that look like “state reset”.

Evidence in this project
- `ProfileForm.tsx` uses `@/integrations/supabase/client` (good).
- `AuthProvider` uses `@/integrations/supabase/client` (good).
- But `sessionService.ts` uses `@/lib/supabase/client` (bad) and `initializeSession()` relies on `supabase.auth.getSession()`. If that call returns “no session”, it falls back to anonymous flow.
- There are 10 files importing `@/lib/supabase/client` (43 matches), so the app is still mixed-mode.

Implementation plan (code changes)

Phase 1 — Fully consolidate Supabase client usage (highest priority)
1) Replace ALL imports of:
   - `import { supabase } from '@/lib/supabase/client'`
   with:
   - `import { supabase } from '@/integrations/supabase/client'`

   Files found (at minimum) that must be updated:
   - `src/services/sessionService.ts` (critical for this bug)
   - `src/services/profileService.ts`
   - `src/services/assessorService.ts`
   - `src/hooks/assessment/useSupabaseStorageResponse.ts`
   - `src/hooks/useAudioUpload.ts`
   - `src/pages/Dashboard.tsx`
   - `src/pages/AssessmentResults.tsx`
   - `src/pages/ReportPage.tsx`
   - `src/components/admin/AssessmentAssignmentDashboard.tsx`
   - `src/components/assessor/AssessmentReviewModal.tsx`

2) Remove the duplicate Supabase client implementation:
   - Delete `src/lib/supabase/client.ts`
   - Confirm no remaining imports reference it (project-wide search should return 0).

   Note: If `src/lib/supabase/database.types.ts` exists only to support that old client, it should be removed too (optional but recommended). The canonical generated types are in `src/integrations/supabase/types.ts`.

Why this should fix your exact symptom
- After consolidation, AuthProvider, ProfileForm, sessionService, and the assessment flow hooks will all read/write the same auth session, and step state won’t “appear to reset” due to conflicting auth refresh / storage events.

Phase 2 — Add hard “step transition” guarantees + better diagnostics
Even with a single client, we should make the assessment start flow resilient and easier to debug.

3) Strengthen `initializeAssessmentFlow()` to guarantee step transition:
   - In `useAssessmentFlowActions.ts`, wrap `initializeSession()` and `initializePromptQueue()` in try/catch.
   - Ensure `setCurrentStep(AssessmentStep.WELCOME)` always runs (even if session init fails), and log explicit markers:
     - “INIT: setCurrentStep(WELCOME)”
     - current sessionId after init
     - promptQueue length after init

4) Add a temporary in-UI debug strip (admin-only or behind a query param) on `/assessment`:
   Show:
   - `currentStep`
   - `showAssessmentOptions`
   - `studentInfo?.name`
   - `sessionId`
   - `auth.user?.id` from AuthContext
   This gives immediate visibility when it gets “stuck” again.

5) Verify the “Skip Profile & Start Test” path:
   - In `TestEntryStep`, clicking Skip triggers `onStudentInfoSubmit()` and `onStart(false)` which should call initializeAssessment.
   - After Phase 1, this should reliably transition to Welcome.
   - If it still doesn’t, the debug strip will tell us exactly which state is not changing.

Phase 3 — Retest end-to-end backend communication (system scan, functional)
Once the client is consolidated, we’ll re-validate that the front-end truly talks to the backend correctly:

6) Test cases (must pass)
A) Anonymous flow
- Go to `/assessment`
- Choose quick assessment
- Click “Skip Profile & Start Test”
- Expected:
  - step: entry → welcome
  - then Start → recording
  - session created (either edge function or anon DB insert fallback)

B) New user signup flow
- Open Sign Up
- Submit profile
- Expected:
  - AuthContext user becomes non-null
  - studentInfo becomes non-null
  - step: entry → welcome
  - Start → recording

C) Existing user login flow
- Login modal
- Expected:
  - user not null
  - studentInfo auto-populates only when appropriate
  - Start works

D) Data persistence checks
- Confirm `assessment_sessions` is created for the run
- Confirm `assessment_responses` entries appear after recordings (or after finalization, depending on your flow)

What I will look for during verification
- Console should show:
  - AuthProvider “Auth state changed … hasUser true”
  - “INIT: setCurrentStep(WELCOME)”
  - AssessmentFlow re-render with `user != null` (after profile fetch) and `studentInfo != null`
- No more “Multiple GoTrueClient instances” warnings.

If it still fails after Phase 1
Then the next most likely causes are:
- AssessmentFlow is being remounted (state reset) due to a parent key/route change or StrictMode double-invocation side effects.
- A second AuthContext exists elsewhere (less likely, but we’ll re-search if needed).
In that case, we’ll use the new debug strip + a session replay to pinpoint the exact remount trigger.

Deliverables
- Single Supabase client used everywhere (`@/integrations/supabase/client`)
- Deleted duplicate client file(s)
- Hardened assessment initialization so it can’t silently remain on ENTRY
- A quick “state inspector” UI to confirm everything is flowing correctly during your acceptance test
