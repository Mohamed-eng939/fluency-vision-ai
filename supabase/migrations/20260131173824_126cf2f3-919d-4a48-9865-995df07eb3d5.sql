-- Update the assessor@test.com account to have the assessor role
UPDATE public.profiles 
SET role = 'assessor', updated_at = now() 
WHERE email = 'assessor@test.com';