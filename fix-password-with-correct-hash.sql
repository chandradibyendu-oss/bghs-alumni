-- =====================================================
-- BGHS Alumni Website - Fix Password with Correct Hash
-- =====================================================
-- This script uses the correct bcrypt hash for TestPass123!
-- Generated hash: $2b$10$dmaS.CUtorSWh9dHq9YMdeb8sWLXH/RdyFdwiKs2tWY8rg/F6B0J6
-- =====================================================

-- Update the password for moderator user with correct hash
UPDATE auth.users 
SET encrypted_password = '$2b$10$dmaS.CUtorSWh9dHq9YMdeb8sWLXH/RdyFdwiKs2tWY8rg/F6B0J6'
WHERE email = 'moderator@bghs-alumni.com';

-- Update all test users with the correct password hash
UPDATE auth.users 
SET encrypted_password = '$2b$10$dmaS.CUtorSWh9dHq9YMdeb8sWLXH/RdyFdwiKs2tWY8rg/F6B0J6'
WHERE email LIKE '%@bghs-alumni.com';

-- Verify the update
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
-- 1. This hash was generated using Node.js bcrypt library
-- 2. Password: TestPass123!
-- 3. Hash: $2b$10$dmaS.CUtorSWh9dHq9YMdeb8sWLXH/RdyFdwiKs2tWY8rg/F6B0J6
-- 4. This should resolve the 'invalid_credentials' error
-- =====================================================
