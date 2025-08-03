-- Create score overrides table for admin modifications
CREATE TABLE public.score_overrides (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL,
  response_id UUID,
  override_scores JSONB NOT NULL DEFAULT '{}',
  override_notes JSONB NOT NULL DEFAULT '{}',
  original_scores JSONB NOT NULL DEFAULT '{}',
  overridden_by UUID NOT NULL,
  overridden_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  override_reason TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.score_overrides ENABLE ROW LEVEL SECURITY;

-- Create policies for score overrides
CREATE POLICY "Admins can manage all score overrides" 
ON public.score_overrides 
FOR ALL 
USING (get_current_user_role() = 'admin');

CREATE POLICY "Org admins can manage org score overrides" 
ON public.score_overrides 
FOR ALL 
USING (
  is_admin_or_assessor() AND 
  session_id IN (
    SELECT id FROM assessment_sessions 
    WHERE organization_id = get_current_user_organization()
  )
);

-- Add override tracking to assessment_sessions
ALTER TABLE public.assessment_sessions 
ADD COLUMN IF NOT EXISTS has_score_override BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS override_summary JSONB DEFAULT '{}';

-- Create function to update session override status
CREATE OR REPLACE FUNCTION public.update_session_override_status()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the session to reflect override status
  UPDATE public.assessment_sessions 
  SET 
    has_score_override = true,
    override_summary = jsonb_build_object(
      'overridden_by', NEW.overridden_by,
      'overridden_at', NEW.overridden_at,
      'skills_modified', jsonb_object_keys(NEW.override_scores)
    ),
    updated_at = now()
  WHERE id = NEW.session_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for override status updates
CREATE TRIGGER update_session_override_trigger
  AFTER INSERT OR UPDATE ON public.score_overrides
  FOR EACH ROW
  EXECUTE FUNCTION public.update_session_override_status();

-- Add difficulty weights and CEFR mapping to prompts table
ALTER TABLE public.prompts 
ADD COLUMN IF NOT EXISTS difficulty_weight NUMERIC DEFAULT 1.0,
ADD COLUMN IF NOT EXISTS cefr_weight_mapping JSONB DEFAULT '{"A1": 0.8, "A2": 0.9, "B1": 1.0, "B2": 1.1, "C1": 1.2}';

-- Update existing prompts with difficulty weights based on CEFR level
UPDATE public.prompts 
SET difficulty_weight = CASE 
  WHEN cefr_level = 'A1' THEN 0.8
  WHEN cefr_level = 'A2' THEN 0.9
  WHEN cefr_level = 'B1' THEN 1.0
  WHEN cefr_level = 'B2' THEN 1.1
  WHEN cefr_level = 'C1' THEN 1.2
  ELSE 1.0
END
WHERE difficulty_weight IS NULL OR difficulty_weight = 1.0;