-- =====================================================
-- BGHS Alumni Website - Delete Test Users
-- =====================================================
-- This script deletes all test users from both auth.users and profiles tables
-- =====================================================

-- Delete from profiles table first (due to foreign key constraint)
DELETE FROM profiles 
WHERE email LIKE '%@bghs-alumni.com';

-- Delete from auth.users table
DELETE FROM auth.users 
WHERE email LIKE '%@bghs-alumni.com';

-- Verify deletion
SELECT 'auth.users' as table_name, COUNT(*) as count
FROM auth.users 
WHERE email LIKE '%@bghs-alumni.com'
UNION ALL
SELECT 'profiles' as table_name, COUNT(*) as count
FROM profiles 
WHERE email LIKE '%@bghs-alumni.com';

-- =====================================================
-- NOTES:
-- =====================================================
-- 1. All test users with @bghs-alumni.com emails are deleted
-- 2. Both auth.users and profiles tables are cleaned
-- 3. You can now create fresh users with correct password hashes
-- =====================================================
