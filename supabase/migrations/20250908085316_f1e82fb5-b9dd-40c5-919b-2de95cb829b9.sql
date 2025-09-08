-- Fix RLS policies for assessment_sessions to allow proper session creation and updates

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Users can create sessions" ON public.assessment_sessions;
DROP POLICY IF EXISTS "Users can update their own sessions" ON public.assessment_sessions;
DROP POLICY IF EXISTS "System can update sessions" ON public.assessment_sessions;
DROP POLICY IF EXISTS "Authenticated users can create sessions" ON public.assessment_sessions;
DROP POLICY IF EXISTS "System can finalize sessions" ON public.assessment_sessions;

-- Create proper policies for session management
CREATE POLICY "Allow session creation" 
ON public.assessment_sessions 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Allow session updates" 
ON public.assessment_sessions 
FOR UPDATE 
USING (true)
WITH CHECK (true);

-- Keep existing select and delete policies as they are working
-- The select and delete policies from the schema are already correct