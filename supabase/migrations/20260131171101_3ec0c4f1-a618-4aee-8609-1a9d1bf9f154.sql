-- Update the admin@test.com user to have admin role
UPDATE public.profiles 
SET role = 'admin', updated_at = now()
WHERE email = 'admin@test.com';