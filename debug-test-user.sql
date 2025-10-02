-- =====================================================
-- BGHS Alumni Website - Debug Test User
-- =====================================================
-- This script helps debug why test user login is failing
-- =====================================================

-- Check if the user exists in auth.users table
SELECT 
    id,
    email,
    email_confirmed_at,
    created_at,
    updated_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data
FROM auth.users 
WHERE email = 'moderator@bghs-alumni.com';

-- Check if the user exists in profiles table
SELECT 
    id,
    email,
    first_name,
    last_name,
    role,
    is_approved,
    created_at,
    updated_at
FROM profiles 
WHERE email = 'moderator@bghs-alumni.com';

-- Check all test users in auth.users
SELECT 
    email,
    email_confirmed_at,
    created_at,
    last_sign_in_at
FROM auth.users 
WHERE email LIKE '%@bghs-alumni.com'
ORDER BY email;

-- Check all test users in profiles
SELECT 
    email,
    first_name,
    last_name,
    role,
    is_approved,
    registration_id
FROM profiles 
WHERE email LIKE '%@bghs-alumni.com'
ORDER BY email;

-- =====================================================
-- TROUBLESHOOTING NOTES:
-- =====================================================
-- 1. User should exist in both auth.users and profiles tables
-- 2. email_confirmed_at should not be NULL
-- 3. Password should be properly encrypted
-- 4. User should be approved (is_approved = true)
-- =====================================================
