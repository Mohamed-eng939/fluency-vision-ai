-- Fix RLS policies for assessment_sessions to allow proper session creation and updates

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Users can create sessions" ON public.assessment_sessions;
DROP POLICY IF EXISTS "Users can update their own sessions" ON public.assessment_sessions;
DROP POLICY IF EXISTS "System can update sessions" ON public.assessment_sessions;

-- Create more permissive policies for session management
CREATE POLICY "Authenticated users can create sessions" 
ON public.assessment_sessions 
FOR INSERT 
TO authenticated
WITH CHECK (true);

CREATE POLICY "Users can update sessions they own or created" 
ON public.assessment_sessions 
FOR UPDATE 
TO authenticated
USING (user_id = auth.uid() OR user_id IS NULL)
WITH CHECK (user_id = auth.uid() OR user_id IS NULL);

-- Allow system to update sessions for finalization
CREATE POLICY "System can finalize sessions" 
ON public.assessment_sessions 
FOR UPDATE 
TO authenticated
USING (true)
WITH CHECK (true);