-- Drop the existing policy
DROP POLICY IF EXISTS "Allow session updates for owners and assessors" ON public.assessment_sessions;

-- Create a simpler test mode policy that allows any update to completed/under_review sessions
CREATE POLICY "Allow session updates (TEST MODE)"
ON public.assessment_sessions
FOR UPDATE
USING (
  -- Allow if user is the owner OR if session is reviewable
  (((auth.uid() IS NOT NULL) AND (user_id = auth.uid())) OR 
   ((auth.uid() IS NULL) AND (user_id IS NULL)) OR
   (status IN ('completed', 'under_review')))
)
WITH CHECK (
  -- Allow if user is the owner OR if session was reviewable (checking original status)
  true  -- In TEST MODE, allow all updates
);