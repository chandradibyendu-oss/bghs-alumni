-- Fix email field to be NOT NULL in profiles table
-- This migration ensures email is mandatory for all profiles

-- Step 1: Check current state
SELECT 
    column_name,
    is_nullable,
    data_type,
    column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND column_name = 'email';

-- Step 2: Check for any existing profiles with NULL emails
SELECT 
    COUNT(*) as total_profiles,
    COUNT(email) as profiles_with_email,
    COUNT(*) - COUNT(email) as profiles_with_null_email
FROM profiles;

-- Step 3: If there are profiles with NULL emails, we need to handle them first
-- Option A: Delete profiles with NULL emails (if they are test/invalid accounts)
-- DELETE FROM profiles WHERE email IS NULL;

-- Option B: Update NULL emails with placeholder emails (if you want to keep the accounts)
-- UPDATE profiles 
-- SET email = 'temp-' || id || '@placeholder.com'
-- WHERE email IS NULL;

-- Step 4: Make email field NOT NULL
ALTER TABLE profiles ALTER COLUMN email SET NOT NULL;

-- Step 5: Verify the change
SELECT 
    column_name,
    is_nullable,
    data_type,
    column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND column_name = 'email';

-- Step 6: Verify all profiles now have emails
SELECT 
    COUNT(*) as total_profiles,
    COUNT(email) as profiles_with_email,
    COUNT(*) - COUNT(email) as profiles_with_null_email
FROM profiles;









