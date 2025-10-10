-- Drop all existing UPDATE policies to start fresh
DROP POLICY IF EXISTS "Allow session updates (TEST MODE)" ON public.assessment_sessions;

-- Create a single, very permissive UPDATE policy for test mode
CREATE POLICY "Allow all session updates (TEST MODE)"
ON public.assessment_sessions
FOR UPDATE
TO public
USING (true)  -- Allow reading any row
WITH CHECK (true);  -- Allow any update