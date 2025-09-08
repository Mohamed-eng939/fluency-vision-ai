-- Fix RLS policies for assessment_sessions to be properly secured while allowing Edge Function operations

-- Drop the overly permissive policies
DROP POLICY IF EXISTS "Allow session creation" ON public.assessment_sessions;
DROP POLICY IF EXISTS "Allow session updates" ON public.assessment_sessions;

-- Create secure policies for session creation and updates
CREATE POLICY "Users can create their own sessions" 
ON public.assessment_sessions 
FOR INSERT 
WITH CHECK (
  (auth.uid() IS NOT NULL AND user_id = auth.uid()) OR  -- Authenticated users creating their own sessions
  (auth.uid() IS NULL AND user_id IS NULL)               -- Anonymous sessions for unauthenticated users
);

CREATE POLICY "Users can update their own sessions" 
ON public.assessment_sessions 
FOR UPDATE 
USING (
  (auth.uid() IS NOT NULL AND user_id = auth.uid()) OR  -- Users can update their own sessions
  (auth.uid() IS NULL AND user_id IS NULL)               -- Anonymous sessions can be updated
)
WITH CHECK (
  (auth.uid() IS NOT NULL AND user_id = auth.uid()) OR  -- Users can only update to their own user_id
  (auth.uid() IS NULL AND user_id IS NULL)               -- Anonymous sessions stay anonymous
);

-- Add policy for Edge Functions to create sessions on behalf of authenticated users
CREATE POLICY "Edge functions can create sessions for authenticated users"
ON public.assessment_sessions
FOR INSERT
WITH CHECK (
  auth.uid() IS NOT NULL AND user_id = auth.uid()  -- Only when authenticated user matches the user_id
);

-- Keep existing select and delete policies as they are properly restrictive
-- The existing policies already handle proper access control for viewing and deleting sessions