-- Add temporary policy to allow review submissions during testing
CREATE POLICY "Allow review submissions for testing (TEMPORARY)"
ON assessor_reviews
FOR INSERT
WITH CHECK (true);

-- Add comment to remind this should be removed after testing
COMMENT ON POLICY "Allow review submissions for testing (TEMPORARY)" ON assessor_reviews IS 'TEMPORARY POLICY: Remove after testing phase is complete';