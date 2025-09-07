-- Fix RLS policies for assessment tables to ensure proper data insertion

-- Drop and recreate RLS policies for assessment_responses
DROP POLICY IF EXISTS "Users can access assessment responses" ON public.assessment_responses;

-- Create more permissive policy for assessment_responses
CREATE POLICY "Users can insert assessment responses" 
ON public.assessment_responses 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.assessment_sessions 
    WHERE id = assessment_responses.session_id 
    AND (user_id = auth.uid() OR user_id IS NULL)
  )
);

CREATE POLICY "Users can select assessment responses" 
ON public.assessment_responses 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.assessment_sessions 
    WHERE id = assessment_responses.session_id 
    AND (user_id = auth.uid() OR user_id IS NULL)
  )
);

-- Ensure assessment_sessions allows anonymous and authenticated users
DROP POLICY IF EXISTS "Users can insert assessment sessions" ON public.assessment_sessions;

CREATE POLICY "Users can insert assessment sessions" 
ON public.assessment_sessions 
FOR INSERT 
WITH CHECK (user_id = auth.uid() OR user_id IS NOT NULL);

CREATE POLICY "Users can update assessment sessions" 
ON public.assessment_sessions 
FOR UPDATE 
USING (user_id = auth.uid() OR user_id IS NOT NULL);

-- Allow anonymous sessions to be created with generated UUIDs
CREATE POLICY "Anonymous users can create sessions" 
ON public.assessment_sessions 
FOR INSERT 
WITH CHECK (user_id IS NOT NULL);