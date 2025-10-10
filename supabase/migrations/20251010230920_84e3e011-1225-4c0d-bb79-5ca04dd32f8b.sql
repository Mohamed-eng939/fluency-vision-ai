-- Drop the restrictive owner-only update policy
DROP POLICY IF EXISTS "Allow session updates for owners" ON public.assessment_sessions;

-- Create a new combined policy that allows both owner updates AND assessor review updates
CREATE POLICY "Allow session updates for owners and assessors"
ON public.assessment_sessions
FOR UPDATE
USING (
  -- Allow if user is the owner (authenticated or anonymous)
  (((auth.uid() IS NOT NULL) AND (user_id = auth.uid())) OR ((auth.uid() IS NULL) AND (user_id IS NULL)))
  OR
  -- OR allow if session is being reviewed (TEST MODE - allows any user to update review fields)
  (status IN ('completed', 'under_review'))
)
WITH CHECK (
  -- Allow if user is the owner (authenticated or anonymous)
  (((auth.uid() IS NOT NULL) AND (user_id = auth.uid())) OR ((auth.uid() IS NULL) AND (user_id IS NULL)))
  OR
  -- OR allow if updating to reviewed status (TEST MODE)
  (status IN ('approved', 'rejected', 'under_review'))
);

-- Remove the redundant test mode policy since we combined them
DROP POLICY IF EXISTS "Allow assessor review updates (TEST MODE)" ON public.assessment_sessions;