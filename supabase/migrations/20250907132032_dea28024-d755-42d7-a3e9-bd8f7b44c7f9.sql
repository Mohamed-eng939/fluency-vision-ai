-- Add prompt_identifier column to assessment_responses table
ALTER TABLE assessment_responses 
ADD COLUMN IF NOT EXISTS prompt_identifier TEXT;

-- Add index on prompt_identifier for better query performance
CREATE INDEX IF NOT EXISTS idx_assessment_responses_prompt_identifier 
ON assessment_responses(prompt_identifier);