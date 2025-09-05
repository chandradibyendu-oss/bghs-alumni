-- BGHS Alumni Website - Create Sample Users for Testing (FIXED VERSION)
-- Run this in your Supabase SQL Editor AFTER running database-roles-setup.sql

-- IMPORTANT: This script assumes you have already created users in Supabase Auth
-- If you haven't, create them first through the admin panel or Supabase Dashboard

-- Step 1: First, let's check what users exist in auth.users
-- Run this query to see existing users:
SELECT id, email FROM auth.users LIMIT 10;

-- Step 2: Create sample user profiles using EXISTING user IDs
-- Replace the UUIDs below with actual user IDs from your auth.users table

-- Example: If you have a user with email 'admin@bghs.edu.in', get their ID first:
-- SELECT id FROM auth.users WHERE email = 'admin@bghs.edu.in';

-- Then use that ID in the INSERT statement below.

-- Step 3: Insert profiles for existing users (replace UUIDs with actual user IDs)
-- You'll need to run this for each user you want to create

-- Example for creating a profile for an existing user:
/*
INSERT INTO profiles (id, email, full_name, batch_year, profession, company, location, bio, role, permissions) 
SELECT 
  u.id,  -- Use the actual user ID from auth.users
  u.email,
  'Admin User',  -- full_name
  1990,          -- batch_year
  'System Administrator',  -- profession
  'BGHS Alumni Association',  -- company
  'Kolkata, West Bengal',  -- location
  'Super administrator with full system access',  -- bio
  'super_admin',  -- role
  (SELECT permissions FROM user_roles WHERE name = 'super_admin')  -- permissions
FROM auth.users u 
WHERE u.email = 'admin@bghs.edu.in'
ON CONFLICT (id) DO UPDATE SET
  role = EXCLUDED.role,
  permissions = EXCLUDED.permissions,
  updated_at = NOW();
*/

-- Step 4: Alternative approach - Create a function to add users with profiles
CREATE OR REPLACE FUNCTION create_user_with_profile(
  user_email TEXT,
  user_password TEXT,
  user_full_name TEXT,
  user_batch_year INTEGER,
  user_profession TEXT DEFAULT NULL,
  user_company TEXT DEFAULT NULL,
  user_location TEXT DEFAULT NULL,
  user_bio TEXT DEFAULT NULL,
  user_role TEXT DEFAULT 'alumni_member'
)
RETURNS TEXT AS $$
DECLARE
  new_user_id UUID;
  role_permissions JSONB;
BEGIN
  -- First, create the user in auth.users
  INSERT INTO auth.users (email, encrypted_password, email_confirmed_at, created_at, updated_at)
  VALUES (user_email, crypt(user_password, gen_salt('bf')), NOW(), NOW(), NOW())
  RETURNING id INTO new_user_id;
  
  -- Get permissions for the role
  SELECT permissions INTO role_permissions FROM user_roles WHERE name = user_role;
  
  -- Create the profile
  INSERT INTO profiles (id, email, full_name, batch_year, profession, company, location, bio, role, permissions)
  VALUES (new_user_id, user_email, user_full_name, user_batch_year, user_profession, user_company, user_location, user_bio, user_role, role_permissions);
  
  RETURN new_user_id::TEXT;
EXCEPTION
  WHEN OTHERS THEN
    RETURN 'Error: ' || SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 5: Use the function to create sample users
-- Note: This function approach may not work due to Supabase security restrictions
-- The admin panel approach is more reliable

-- Step 6: Manual verification query
-- After creating users, run this to verify:
SELECT 
  p.full_name,
  p.email,
  p.role,
  p.batch_year,
  p.profession,
  p.company,
  p.location
FROM profiles p
WHERE p.role IS NOT NULL 
ORDER BY 
  CASE p.role
    WHEN 'super_admin' THEN 1
    WHEN 'alumni_premium' THEN 2
    WHEN 'content_moderator' THEN 3
    WHEN 'event_manager' THEN 4
    WHEN 'content_creator' THEN 5
    WHEN 'donation_manager' THEN 6
    WHEN 'alumni_member' THEN 7
    ELSE 8
  END,
  p.full_name;

-- Step 7: Clean up (remove the function if not needed)
-- DROP FUNCTION IF EXISTS create_user_with_profile(TEXT, TEXT, TEXT, INTEGER, TEXT, TEXT, TEXT, TEXT, TEXT);

