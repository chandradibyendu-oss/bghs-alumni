-- Check for any existing users without email addresses
-- This script verifies that all existing profiles have email addresses

-- Check profiles table for any NULL emails
SELECT 
    id,
    email,
    phone,
    full_name,
    created_at
FROM profiles 
WHERE email IS NULL OR email = '';

-- Count total profiles vs profiles with valid emails
SELECT 
    COUNT(*) as total_profiles,
    COUNT(email) as profiles_with_email,
    COUNT(*) - COUNT(email) as profiles_without_email
FROM profiles;

-- Check if there are any duplicate emails (should be 0 due to UNIQUE constraint)
SELECT 
    email,
    COUNT(*) as duplicate_count
FROM profiles 
GROUP BY email 
HAVING COUNT(*) > 1;

