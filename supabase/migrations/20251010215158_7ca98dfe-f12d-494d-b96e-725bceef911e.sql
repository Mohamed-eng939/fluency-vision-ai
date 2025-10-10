-- Temporary policy for TEST MODE: Allow viewing completed/under_review assessments
-- This bypasses authentication requirements for testing purposes
-- TODO: Remove this policy once proper authentication is fully implemented

CREATE POLICY "Allow viewing completed assessments (TEST MODE)"
ON assessment_sessions
FOR SELECT
TO anon, authenticated
USING (status IN ('completed', 'under_review'));

-- Also add similar policy for assessment_responses to ensure assessors can view response details
CREATE POLICY "Allow viewing responses for completed sessions (TEST MODE)"
ON assessment_responses
FOR SELECT
TO anon, authenticated
USING (
  EXISTS (
    SELECT 1 FROM assessment_sessions
    WHERE assessment_sessions.id = assessment_responses.session_id
    AND assessment_sessions.status IN ('completed', 'under_review')
  )
);