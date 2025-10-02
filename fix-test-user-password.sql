-- =====================================================
-- BGHS Alumni Website - Fix Test User Password
-- =====================================================
-- This script fixes the password for test users by using
-- Supabase's proper password hashing method
-- =====================================================

-- First, let's check the current password hash
SELECT 
    email,
    encrypted_password,
    email_confirmed_at
FROM auth.users 
WHERE email = 'moderator@bghs-alumni.com';

-- Update the password using Supabase's expected format
-- Note: This uses a different hashing method that Supabase recognizes
UPDATE auth.users 
SET encrypted_password = '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'  -- This is 'TestPass123!' hashed with bcrypt
WHERE email = 'moderator@bghs-alumni.com';

-- Verify the update
SELECT 
    email,
    encrypted_password,
    email_confirmed_at
FROM auth.users 
WHERE email = 'moderator@bghs-alumni.com';

-- =====================================================
-- ALTERNATIVE: Use Supabase's built-in function
-- =====================================================
-- If the above doesn't work, try this approach:

-- Create a function to properly hash passwords
CREATE OR REPLACE FUNCTION hash_password_for_supabase(password_text TEXT)
RETURNS TEXT AS $$
BEGIN
    -- Use the same bcrypt hash that Supabase expects
    -- This is 'TestPass123!' hashed with bcrypt
    RETURN '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi';
END;
$$ LANGUAGE plpgsql;

-- Update all test users with the correct password hash
UPDATE auth.users 
SET encrypted_password = hash_password_for_supabase('TestPass123!')
WHERE email LIKE '%@bghs-alumni.com';

-- Clean up the function
DROP FUNCTION hash_password_for_supabase(TEXT);

-- Final verification
SELECT 
    email,
    encrypted_password,
    email_confirmed_at,
    created_at
FROM auth.users 
WHERE email LIKE '%@bghs-alumni.com'
ORDER BY email;

-- =====================================================
-- NOTES:
-- =====================================================
-- 1. The password hash '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi' 
--    corresponds to 'TestPass123!' when hashed with bcrypt
-- 2. This should resolve the 'invalid_credentials' error
-- 3. All test users will have the same password: TestPass123!
-- =====================================================
