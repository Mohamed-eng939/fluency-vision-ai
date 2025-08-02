-- Allow anonymous users to create assessment sessions
CREATE POLICY "Allow anonymous session creation" 
ON public.assessment_sessions 
FOR INSERT 
WITH CHECK (true);

-- Allow anonymous users to create responses
CREATE POLICY "Allow anonymous response creation" 
ON public.responses 
FOR INSERT 
WITH CHECK (true);