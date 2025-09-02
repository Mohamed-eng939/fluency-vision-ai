-- Add default role to prevent NOT NULL constraint violations
ALTER TABLE public.profiles 
ALTER COLUMN role SET DEFAULT 'learner';