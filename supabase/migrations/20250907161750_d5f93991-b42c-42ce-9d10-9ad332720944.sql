-- Fix RLS policies for assessment_sessions to allow proper session creation

-- Drop conflicting policies
DROP POLICY IF EXISTS "Allow session creation" ON assessment_sessions;
DROP POLICY IF EXISTS "Allow session updates by owner or system" ON assessment_sessions;
DROP POLICY IF EXISTS "Users can update their assessment sessions" ON assessment_sessions;

-- Create simple, clear policies for session management
CREATE POLICY "Users can create sessions" ON assessment_sessions
FOR INSERT TO authenticated
WITH CHECK (true);

CREATE POLICY "Users can update their own sessions" ON assessment_sessions
FOR UPDATE TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Allow system/admin to update any session
CREATE POLICY "System can update sessions" ON assessment_sessions
FOR UPDATE TO authenticated
USING (user_id IS NOT NULL)
WITH CHECK (user_id IS NOT NULL);