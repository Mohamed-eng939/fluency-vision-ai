-- Add missing estimated_level column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN estimated_level text;

-- Also add other_reason column that might be needed
ALTER TABLE public.profiles 
ADD COLUMN other_reason text;