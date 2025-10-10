-- TEMPORARY: Make assessor_id nullable for testing phase
-- TODO: Revert this after testing is complete
ALTER TABLE assessor_reviews 
ALTER COLUMN assessor_id DROP NOT NULL;

-- Add comment to track this temporary change
COMMENT ON COLUMN assessor_reviews.assessor_id IS 'TEMPORARY: Made nullable for testing. Should be NOT NULL in production.';