-- Add temporary policy to allow session updates for assessor reviews (TEST MODE)
-- This allows updating reviewed_at and status fields during assessment review
CREATE POLICY "Allow assessor review updates (TEST MODE)"
ON public.assessment_sessions
FOR UPDATE
USING (
  -- Allow updates to completed or under_review sessions for review process
  status IN ('completed', 'under_review')
)
WITH CHECK (
  -- Allow updating to approved or rejected status
  status IN ('approved', 'rejected', 'under_review')
);