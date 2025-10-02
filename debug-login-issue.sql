-- =====================================================
-- BGHS Alumni Website - Debug Login Issue
-- =====================================================
-- This script helps debug why login is still failing
-- =====================================================

-- Check if users exist in both tables
SELECT 'auth.users' as table_name, email, encrypted_password, email_confirmed_at, created_at
FROM auth.users 
WHERE email = 'moderator@bghs-alumni.com'
UNION ALL
SELECT 'profiles' as table_name, email, 'N/A' as encrypted_password, NULL as email_confirmed_at, created_at
FROM profiles 
WHERE email = 'moderator@bghs-alumni.com';

-- Check all test users in auth.users
SELECT 
    email,
    LENGTH(encrypted_password) as password_length,
    LEFT(encrypted_password, 10) as password_start,
    email_confirmed_at,
    created_at
FROM auth.users 
WHERE email LIKE '%@bghs-alumni.com'
ORDER BY email;

-- Check if there are any duplicate users
SELECT email, COUNT(*) as count
FROM auth.users 
WHERE email LIKE '%@bghs-alumni.com'
GROUP BY email
HAVING COUNT(*) > 1;

-- Check if there are any duplicate profiles
SELECT email, COUNT(*) as count
FROM profiles 
WHERE email LIKE '%@bghs-alumni.com'
GROUP BY email
HAVING COUNT(*) > 1;

-- Test the password hash format
SELECT 
    email,
    encrypted_password,
    CASE 
        WHEN encrypted_password LIKE '$2a$%' THEN 'bcrypt $2a'
        WHEN encrypted_password LIKE '$2b$%' THEN 'bcrypt $2b'
        WHEN encrypted_password LIKE '$2y$%' THEN 'bcrypt $2y'
        ELSE 'Unknown format'
    END as hash_format,
    LENGTH(encrypted_password) as hash_length
FROM auth.users 
WHERE email = 'moderator@bghs-alumni.com';

-- =====================================================
-- TROUBLESHOOTING NOTES:
-- =====================================================
-- 1. Check if users exist in both tables
-- 2. Verify password hash format and length
-- 3. Check for duplicate entries
-- 4. Verify email confirmation status
-- =====================================================
