-- Fix RLS policies for assessment_sessions table
-- Drop existing policies and recreate them with proper INSERT/UPDATE checks

DROP POLICY IF EXISTS "Users can view their own sessions" ON public.assessment_sessions;

-- Create separate policies for different operations
CREATE POLICY "Users can select their own sessions" 
ON public.assessment_sessions 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own sessions" 
ON public.assessment_sessions 
FOR INSERT 
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own sessions" 
ON public.assessment_sessions 
FOR UPDATE 
USING (user_id = auth.uid()) 
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own sessions" 
ON public.assessment_sessions 
FOR DELETE 
USING (user_id = auth.uid());