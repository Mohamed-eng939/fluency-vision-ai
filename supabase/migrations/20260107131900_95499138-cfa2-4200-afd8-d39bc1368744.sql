-- Remove TEST MODE RLS policies that bypass security

-- 1. Drop TEST MODE policies on assessment_sessions
DROP POLICY IF EXISTS "Allow viewing all assessments (TEST MODE)" ON public.assessment_sessions;
DROP POLICY IF EXISTS "Allow all session updates (TEST MODE)" ON public.assessment_sessions;

-- 2. Drop TEST MODE policy on assessment_responses
DROP POLICY IF EXISTS "Allow viewing responses for completed sessions (TEST MODE)" ON public.assessment_responses;

-- 3. Drop TEMPORARY policy on assessor_reviews
DROP POLICY IF EXISTS "Allow review submissions for testing (TEMPORARY)" ON public.assessor_reviews;

-- 4. Add proper UPDATE policy for assessment_sessions (users can update their own sessions)
CREATE POLICY "Users can update their own sessions" 
ON public.assessment_sessions 
FOR UPDATE 
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- 5. Add proper UPDATE policy for assessors to update assigned sessions
CREATE POLICY "Assessors can update assigned sessions" 
ON public.assessment_sessions 
FOR UPDATE 
USING (
  assigned_assessor = auth.uid() 
  OR (is_admin_or_assessor() AND organization_id = get_current_user_organization())
)
WITH CHECK (
  assigned_assessor = auth.uid() 
  OR (is_admin_or_assessor() AND organization_id = get_current_user_organization())
);

-- 6. Add proper INSERT policy for assessor_reviews (assessors can insert their own reviews)
CREATE POLICY "Assessors can insert their reviews" 
ON public.assessor_reviews 
FOR INSERT 
WITH CHECK (
  assessor_id = auth.uid() 
  AND is_admin_or_assessor()
);

-- 7. Add UPDATE policy for assessment_responses (session owner or assessors)
CREATE POLICY "Users can update their session responses" 
ON public.assessment_responses 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM assessment_sessions 
    WHERE assessment_sessions.id = assessment_responses.session_id 
    AND (assessment_sessions.user_id = auth.uid() OR assessment_sessions.assigned_assessor = auth.uid())
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM assessment_sessions 
    WHERE assessment_sessions.id = assessment_responses.session_id 
    AND (assessment_sessions.user_id = auth.uid() OR assessment_sessions.assigned_assessor = auth.uid())
  )
);