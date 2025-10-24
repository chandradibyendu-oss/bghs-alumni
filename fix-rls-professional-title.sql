-- Fix RLS policies to allow professional_title_id field access
-- Run this in your Supabase SQL Editor

-- 1. Drop existing conflicting policies (with IF EXISTS to avoid errors)
DROP POLICY IF EXISTS "Users can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Public can view basic profiles" ON profiles;
DROP POLICY IF EXISTS "Allow profile access with professional titles" ON profiles;

-- 2. Create a single comprehensive policy that allows access to all fields including professional_title_id
CREATE POLICY "Allow profile access with professional titles" ON profiles
  FOR SELECT USING (true);

-- 3. Drop and recreate update policy (with IF EXISTS to avoid errors)
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- 4. Drop and recreate insert policy (with IF EXISTS to avoid errors)
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- 5. Verify the policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'profiles';
