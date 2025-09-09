-- Fix RLS policies for assessment_sessions to work properly with authenticated users
-- and allow both client-side and Edge Function operations

-- Drop all existing policies to start fresh
DROP POLICY IF EXISTS "Users can create their own sessions" ON public.assessment_sessions;
DROP POLICY IF EXISTS "Users can update their own sessions" ON public.assessment_sessions;
DROP POLICY IF EXISTS "Edge functions can create sessions for authenticated users" ON public.assessment_sessions;
DROP POLICY IF EXISTS "Users can create sessions they own or created" ON public.assessment_sessions;
DROP POLICY IF EXISTS "Users can update sessions they own or created" ON public.assessment_sessions;

-- Create comprehensive policies that handle both authenticated and anonymous users
CREATE POLICY "Allow session creation for users and anonymous"
ON public.assessment_sessions
FOR INSERT
WITH CHECK (
  -- Authenticated users can create sessions with their user_id
  (auth.uid() IS NOT NULL AND user_id = auth.uid()) OR
  -- Anonymous users can create sessions with null user_id
  (auth.uid() IS NULL AND user_id IS NULL)
);

CREATE POLICY "Allow session updates for owners"
ON public.assessment_sessions
FOR UPDATE
USING (
  -- Users can update their own sessions
  (auth.uid() IS NOT NULL AND user_id = auth.uid()) OR
  -- Anonymous sessions can be updated when no auth
  (auth.uid() IS NULL AND user_id IS NULL)
)
WITH CHECK (
  -- Maintain user ownership on updates
  (auth.uid() IS NOT NULL AND user_id = auth.uid()) OR
  -- Anonymous sessions stay anonymous
  (auth.uid() IS NULL AND user_id IS NULL)
);

-- Keep existing select and delete policies as they work properly