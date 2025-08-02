-- Update RLS policy for anonymous session creation to be more permissive
DROP POLICY IF EXISTS "Users can insert own sessions" ON public.assessment_sessions;
DROP POLICY IF EXISTS "Allow anonymous session creation" ON public.assessment_sessions;

-- Create a single policy that handles both authenticated and anonymous users
CREATE POLICY "Allow session creation" 
ON public.assessment_sessions 
FOR INSERT 
WITH CHECK (
  CASE 
    WHEN auth.uid() IS NOT NULL THEN user_id = auth.uid()
    ELSE user_id IS NULL 
  END
);