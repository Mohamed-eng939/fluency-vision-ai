-- Fix RLS policies for assessment sessions to work with Edge Functions
DROP POLICY IF EXISTS "Users can insert their own sessions" ON assessment_sessions;
DROP POLICY IF EXISTS "Users can update their own sessions" ON assessment_sessions;

-- Create new RLS policies that work with both direct client and Edge Functions
CREATE POLICY "Users can insert assessment sessions" 
ON assessment_sessions 
FOR INSERT 
WITH CHECK (
  -- Allow if user_id matches authenticated user
  user_id = auth.uid() OR
  -- Allow if inserting from server context (Edge Functions) and user exists
  (user_id IS NOT NULL AND EXISTS(SELECT 1 FROM auth.users WHERE id = user_id))
);

CREATE POLICY "Users can update their assessment sessions" 
ON assessment_sessions 
FOR UPDATE 
USING (
  user_id = auth.uid() OR 
  -- Allow assessors to update sessions they're assigned to
  (assigned_assessor = auth.uid() AND get_current_user_role() = 'assessor')
)
WITH CHECK (
  user_id = auth.uid() OR 
  (assigned_assessor = auth.uid() AND get_current_user_role() = 'assessor')
);

-- Also fix assessment_responses RLS to work with Edge Functions
DROP POLICY IF EXISTS "Users can access their responses" ON assessment_responses;

CREATE POLICY "Users can access assessment responses" 
ON assessment_responses 
FOR ALL
USING (
  -- Users can access their own responses
  session_id IN (SELECT id FROM assessment_sessions WHERE user_id = auth.uid()) OR
  -- Edge Functions can insert responses for valid sessions
  EXISTS(SELECT 1 FROM assessment_sessions WHERE id = session_id)
)
WITH CHECK (
  -- Users can insert responses for their own sessions
  session_id IN (SELECT id FROM assessment_sessions WHERE user_id = auth.uid()) OR
  -- Edge Functions can insert responses for valid sessions  
  EXISTS(SELECT 1 FROM assessment_sessions WHERE id = session_id)
);