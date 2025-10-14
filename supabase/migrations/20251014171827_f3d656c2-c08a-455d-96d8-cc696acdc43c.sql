-- Drop the restrictive test mode SELECT policy
DROP POLICY IF EXISTS "Allow viewing completed assessments (TEST MODE)" ON public.assessment_sessions;

-- Create a more permissive SELECT policy for test mode
-- This allows selecting rows in ANY status, which is needed for UPDATE operations to succeed
CREATE POLICY "Allow viewing all assessments (TEST MODE)"
ON public.assessment_sessions
FOR SELECT
TO anon, authenticated
USING (true);