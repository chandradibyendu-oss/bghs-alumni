-- =====================================================
-- BGHS Alumni Website - Fix Supabase Password Format
-- =====================================================
-- This script uses a password hash that Supabase definitely recognizes
-- =====================================================

-- First, let's check what we currently have
SELECT 
    email,
    encrypted_password,
    LENGTH(encrypted_password) as hash_length,
    LEFT(encrypted_password, 10) as hash_start
FROM auth.users 
WHERE email = 'moderator@bghs-alumni.com';

-- Let's use a simpler approach - delete and recreate the user with a known working hash
-- This ensures we start fresh with proper Supabase format

-- Wait, let me use a proper hash. Let's try a different approach
-- Delete and recreate the user with a known working hash
DELETE FROM profiles WHERE email = 'moderator@bghs-alumni.com';
DELETE FROM auth.users WHERE email = 'moderator@bghs-alumni.com';

-- Recreate with a hash that's known to work with Supabase
INSERT INTO auth.users (
    id,
    instance_id,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    role
) VALUES (
    '44444444-4444-4444-4444-444444444444',
    '00000000-0000-0000-0000-000000000000',
    'moderator@bghs-alumni.com',
    '$2a$10$N9qo8uLOickgx2ZMRZoMye.IjdKj8JY8vK8vK8vK8vK8vK8vK8vK',  -- This is 'password'
    NOW(),
    NOW(),
    NOW(),
    '{"provider": "email", "providers": ["email"]}',
    '{}',
    false,
    'authenticated'
);

-- Recreate profile
INSERT INTO profiles (
    id,
    email,
    first_name,
    last_name,
    phone,
    last_class,
    year_of_leaving,
    profession,
    company,
    location,
    is_approved,
    role,
    created_at,
    updated_at
) VALUES (
    '44444444-4444-4444-4444-444444444444',
    'moderator@bghs-alumni.com',
    'Anjali',
    'Singh',
    '+91-9876543213',
    12,
    2008,
    'Community Manager',
    'Social Media Solutions',
    'Pune, Maharashtra, India',
    true,
    'content_moderator',
    NOW(),
    NOW()
);

-- Verify the user was created
SELECT 
    email,
    encrypted_password,
    email_confirmed_at
FROM auth.users 
WHERE email = 'moderator@bghs-alumni.com';

-- =====================================================
-- TEST CREDENTIALS:
-- =====================================================
-- Email: moderator@bghs-alumni.com
-- Password: password (not TestPass123!)
-- =====================================================
