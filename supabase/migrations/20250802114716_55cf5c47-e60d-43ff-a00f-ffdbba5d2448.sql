-- Allow users to insert their own profile
CREATE POLICY "Users can insert own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = id);

-- Allow anonymous profile creation (for unauthenticated users)
CREATE POLICY "Allow anonymous profile creation" 
ON public.profiles 
FOR INSERT 
WITH CHECK (true);