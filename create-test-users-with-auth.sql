-- =====================================================
-- BGHS Alumni Website - Test Users Creation Script (With Auth)
-- =====================================================
-- This script creates test users with different roles for testing
-- the dynamic role-based access control (RBAC) system.
-- 
-- IMPORTANT: Execute this script in your Supabase SQL editor
-- NOTE: Creates users in auth.users table first, then profiles
-- =====================================================

-- Insert test users with different roles
-- Note: All users have password: 'TestPass123!'
-- All users are pre-approved for immediate testing
-- Uses last_class and year_of_leaving (not batch_year)

-- =====================================================
-- 1. SUPER ADMINISTRATOR
-- =====================================================
-- First create the auth user
INSERT INTO auth.users (
    id,
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
    '11111111-1111-1111-1111-111111111111',
    'superadmin@bghs-alumni.com',
    crypt('TestPass123!', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    '{"provider": "email", "providers": ["email"]}',
    '{}',
    false,
    'authenticated'
) ON CONFLICT (id) DO NOTHING;

-- Then create the profile
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
    '11111111-1111-1111-1111-111111111111',
    'superadmin@bghs-alumni.com',
    'Super',
    'Administrator',
    '+91-9876543210',
    12,
    1990,
    'System Administrator',
    'BGHS Alumni Association',
    'Mumbai, Maharashtra, India',
    true,
    'super_admin',
    NOW(),
    NOW()
) ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    role = EXCLUDED.role,
    is_approved = EXCLUDED.is_approved;

-- =====================================================
-- 2. EVENT MANAGER
-- =====================================================
-- First create the auth user
INSERT INTO auth.users (
    id,
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
    '22222222-2222-2222-2222-222222222222',
    'eventmanager@bghs-alumni.com',
    crypt('TestPass123!', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    '{"provider": "email", "providers": ["email"]}',
    '{}',
    false,
    'authenticated'
) ON CONFLICT (id) DO NOTHING;

-- Then create the profile
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
    '22222222-2222-2222-2222-222222222222',
    'eventmanager@bghs-alumni.com',
    'Priya',
    'Sharma',
    '+91-9876543211',
    12,
    2005,
    'Event Coordinator',
    'Event Management Co.',
    'Delhi, Delhi, India',
    true,
    'event_manager',
    NOW(),
    NOW()
) ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    role = EXCLUDED.role,
    is_approved = EXCLUDED.is_approved;

-- =====================================================
-- 3. CONTENT CREATOR
-- =====================================================
-- First create the auth user
INSERT INTO auth.users (
    id,
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
    '33333333-3333-3333-3333-333333333333',
    'contentcreator@bghs-alumni.com',
    crypt('TestPass123!', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    '{"provider": "email", "providers": ["email"]}',
    '{}',
    false,
    'authenticated'
) ON CONFLICT (id) DO NOTHING;

-- Then create the profile
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
    '33333333-3333-3333-3333-333333333333',
    'contentcreator@bghs-alumni.com',
    'Rahul',
    'Patel',
    '+91-9876543212',
    12,
    2010,
    'Content Writer',
    'Digital Media Agency',
    'Bangalore, Karnataka, India',
    true,
    'content_creator',
    NOW(),
    NOW()
) ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    role = EXCLUDED.role,
    is_approved = EXCLUDED.is_approved;

-- =====================================================
-- 4. CONTENT MODERATOR
-- =====================================================
-- First create the auth user
INSERT INTO auth.users (
    id,
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
    'moderator@bghs-alumni.com',
    crypt('TestPass123!', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    '{"provider": "email", "providers": ["email"]}',
    '{}',
    false,
    'authenticated'
) ON CONFLICT (id) DO NOTHING;

-- Then create the profile
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
) ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    role = EXCLUDED.role,
    is_approved = EXCLUDED.is_approved;

-- =====================================================
-- 5. DONATION MANAGER
-- =====================================================
-- First create the auth user
INSERT INTO auth.users (
    id,
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
    '55555555-5555-5555-5555-555555555555',
    'donationmanager@bghs-alumni.com',
    crypt('TestPass123!', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    '{"provider": "email", "providers": ["email"]}',
    '{}',
    false,
    'authenticated'
) ON CONFLICT (id) DO NOTHING;

-- Then create the profile
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
    '55555555-5555-5555-5555-555555555555',
    'donationmanager@bghs-alumni.com',
    'Vikram',
    'Gupta',
    '+91-9876543214',
    12,
    2000,
    'Fundraising Manager',
    'Non-Profit Organization',
    'Chennai, Tamil Nadu, India',
    true,
    'donation_manager',
    NOW(),
    NOW()
) ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    role = EXCLUDED.role,
    is_approved = EXCLUDED.is_approved;

-- =====================================================
-- 6. ALUMNI PREMIUM MEMBER
-- =====================================================
-- First create the auth user
INSERT INTO auth.users (
    id,
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
    '66666666-6666-6666-6666-666666666666',
    'premiummember@bghs-alumni.com',
    crypt('TestPass123!', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    '{"provider": "email", "providers": ["email"]}',
    '{}',
    false,
    'authenticated'
) ON CONFLICT (id) DO NOTHING;

-- Then create the profile
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
    '66666666-6666-6666-6666-666666666666',
    'premiummember@bghs-alumni.com',
    'Sneha',
    'Joshi',
    '+91-9876543215',
    12,
    2015,
    'Software Engineer',
    'Tech Solutions Ltd.',
    'Hyderabad, Telangana, India',
    true,
    'alumni_premium',
    NOW(),
    NOW()
) ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    role = EXCLUDED.role,
    is_approved = EXCLUDED.is_approved;

-- =====================================================
-- 7. ALUMNI MEMBER (STANDARD)
-- =====================================================
-- First create the auth user
INSERT INTO auth.users (
    id,
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
    '77777777-7777-7777-7777-777777777777',
    'alumnimember@bghs-alumni.com',
    crypt('TestPass123!', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    '{"provider": "email", "providers": ["email"]}',
    '{}',
    false,
    'authenticated'
) ON CONFLICT (id) DO NOTHING;

-- Then create the profile
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
    '77777777-7777-7777-7777-777777777777',
    'alumnimember@bghs-alumni.com',
    'Arjun',
    'Kumar',
    '+91-9876543216',
    12,
    2018,
    'Marketing Executive',
    'Advertising Agency',
    'Kolkata, West Bengal, India',
    true,
    'alumni_member',
    NOW(),
    NOW()
) ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    role = EXCLUDED.role,
    is_approved = EXCLUDED.is_approved;

-- =====================================================
-- 8. PENDING APPROVAL USER
-- =====================================================
-- First create the auth user
INSERT INTO auth.users (
    id,
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
    '88888888-8888-8888-8888-888888888888',
    'pendinguser@bghs-alumni.com',
    crypt('TestPass123!', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    '{"provider": "email", "providers": ["email"]}',
    '{}',
    false,
    'authenticated'
) ON CONFLICT (id) DO NOTHING;

-- Then create the profile
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
    '88888888-8888-8888-8888-888888888888',
    'pendinguser@bghs-alumni.com',
    'Rohit',
    'Verma',
    '+91-9876543217',
    12,
    2020,
    'Recent Graduate',
    'Startup Company',
    'Ahmedabad, Gujarat, India',
    false,
    'alumni_member',
    NOW(),
    NOW()
) ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    role = EXCLUDED.role,
    is_approved = EXCLUDED.is_approved;

-- =====================================================
-- 9. PRIVATE PROFILE USER
-- =====================================================
-- First create the auth user
INSERT INTO auth.users (
    id,
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
    '99999999-9999-9999-9999-999999999999',
    'privateuser@bghs-alumni.com',
    crypt('TestPass123!', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    '{"provider": "email", "providers": ["email"]}',
    '{}',
    false,
    'authenticated'
) ON CONFLICT (id) DO NOTHING;

-- Then create the profile
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
    '99999999-9999-9999-9999-999999999999',
    'privateuser@bghs-alumni.com',
    'Kavya',
    'Reddy',
    '+91-9876543218',
    12,
    2012,
    'Data Scientist',
    'AI Research Lab',
    'Bangalore, Karnataka, India',
    true,
    'alumni_member',
    NOW(),
    NOW()
) ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    role = EXCLUDED.role,
    is_approved = EXCLUDED.is_approved;

-- =====================================================
-- VERIFICATION QUERY
-- =====================================================
-- Run this query to verify all test users were created successfully
SELECT 
    p.email,
    p.first_name,
    p.last_name,
    p.role,
    p.is_approved,
    p.registration_id,
    p.last_class,
    p.year_of_leaving,
    CASE 
        WHEN p.is_approved = true THEN 'Approved'
        ELSE 'Pending'
    END as status
FROM profiles p
WHERE p.email LIKE '%@bghs-alumni.com'
ORDER BY 
    CASE p.role
        WHEN 'super_admin' THEN 1
        WHEN 'event_manager' THEN 2
        WHEN 'content_creator' THEN 3
        WHEN 'content_moderator' THEN 4
        WHEN 'donation_manager' THEN 5
        WHEN 'alumni_premium' THEN 6
        WHEN 'alumni_member' THEN 7
        ELSE 8
    END;

-- =====================================================
-- NOTES FOR TESTING
-- =====================================================
-- 1. All users have the password: TestPass123!
-- 2. All approved users will get registration IDs automatically
-- 3. Pending users will not appear in directory until approved
-- 4. Permissions are dynamically looked up from user_roles table
-- 5. Uses last_class and year_of_leaving (matching registration form)
-- 6. All users completed class 12 (standard for alumni)
-- 7. Use these credentials to test different role-based access
-- 8. Users are created in auth.users table first, then profiles
-- =====================================================
