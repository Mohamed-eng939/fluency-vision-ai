-- Fix RLS policies for profiles table to allow proper profile creation

-- Drop the existing broad policy that covers all operations
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;

-- Create separate, specific policies for each operation
CREATE POLICY "Users can select their own profile" ON profiles
FOR SELECT TO authenticated
USING (id = auth.uid());

CREATE POLICY "Users can insert their own profile" ON profiles  
FOR INSERT TO authenticated
WITH CHECK (id = auth.uid());

CREATE POLICY "Users can update their own profile" ON profiles
FOR UPDATE TO authenticated  
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

CREATE POLICY "Users can delete their own profile" ON profiles
FOR DELETE TO authenticated
USING (id = auth.uid());