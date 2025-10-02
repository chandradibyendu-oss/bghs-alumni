-- =====================================================
-- BGHS Alumni Website - Create Test Users (Final)
-- =====================================================
-- This script creates test users with correct bcrypt password hashes
-- Password: TestPass123!
-- Hash: $2b$10$dmaS.CUtorSWh9dHq9YMdeb8sWLXH/RdyFdwiKs2tWY8rg/F6B0J6
-- =====================================================

-- =====================================================
-- 1. SUPER ADMINISTRATOR
-- =====================================================
-- Create auth user
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
    '11111111-1111-1111-1111-111111111111',
    '00000000-0000-0000-0000-000000000000',
    'superadmin@bghs-alumni.com',
    '$2b$10$dmaS.CUtorSWh9dHq9YMdeb8sWLXH/RdyFdwiKs2tWY8rg/F6B0J6',
    NOW(),
    NOW(),
    NOW(),
    '{"provider": "email", "providers": ["email"]}',
    '{}',
    false,
    'authenticated'
);

-- Create profile
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
);

-- =====================================================
-- 2. EVENT MANAGER
-- =====================================================
-- Create auth user
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
    '22222222-2222-2222-2222-222222222222',
    '00000000-0000-0000-0000-000000000000',
    'eventmanager@bghs-alumni.com',
    '$2b$10$dmaS.CUtorSWh9dHq9YMdeb8sWLXH/RdyFdwiKs2tWY8rg/F6B0J6',
    NOW(),
    NOW(),
    NOW(),
    '{"provider": "email", "providers": ["email"]}',
    '{}',
    false,
    'authenticated'
);

-- Create profile
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
);

-- =====================================================
-- 3. CONTENT CREATOR
-- =====================================================
-- Create auth user
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
    '33333333-3333-3333-3333-333333333333',
    '00000000-0000-0000-0000-000000000000',
    'contentcreator@bghs-alumni.com',
    '$2b$10$dmaS.CUtorSWh9dHq9YMdeb8sWLXH/RdyFdwiKs2tWY8rg/F6B0J6',
    NOW(),
    NOW(),
    NOW(),
    '{"provider": "email", "providers": ["email"]}',
    '{}',
    false,
    'authenticated'
);

-- Create profile
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
);

-- =====================================================
-- 4. CONTENT MODERATOR
-- =====================================================
-- Create auth user
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
    '$2b$10$dmaS.CUtorSWh9dHq9YMdeb8sWLXH/RdyFdwiKs2tWY8rg/F6B0J6',
    NOW(),
    NOW(),
    NOW(),
    '{"provider": "email", "providers": ["email"]}',
    '{}',
    false,
    'authenticated'
);

-- Create profile
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

-- =====================================================
-- 5. DONATION MANAGER
-- =====================================================
-- Create auth user
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
    '55555555-5555-5555-5555-555555555555',
    '00000000-0000-0000-0000-000000000000',
    'donationmanager@bghs-alumni.com',
    '$2b$10$dmaS.CUtorSWh9dHq9YMdeb8sWLXH/RdyFdwiKs2tWY8rg/F6B0J6',
    NOW(),
    NOW(),
    NOW(),
    '{"provider": "email", "providers": ["email"]}',
    '{}',
    false,
    'authenticated'
);

-- Create profile
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
);

-- =====================================================
-- 6. ALUMNI PREMIUM MEMBER
-- =====================================================
-- Create auth user
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
    '66666666-6666-6666-6666-666666666666',
    '00000000-0000-0000-0000-000000000000',
    'premiummember@bghs-alumni.com',
    '$2b$10$dmaS.CUtorSWh9dHq9YMdeb8sWLXH/RdyFdwiKs2tWY8rg/F6B0J6',
    NOW(),
    NOW(),
    NOW(),
    '{"provider": "email", "providers": ["email"]}',
    '{}',
    false,
    'authenticated'
);

-- Create profile
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
);

-- =====================================================
-- 7. ALUMNI MEMBER (STANDARD)
-- =====================================================
-- Create auth user
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
    '77777777-7777-7777-7777-777777777777',
    '00000000-0000-0000-0000-000000000000',
    'alumnimember@bghs-alumni.com',
    '$2b$10$dmaS.CUtorSWh9dHq9YMdeb8sWLXH/RdyFdwiKs2tWY8rg/F6B0J6',
    NOW(),
    NOW(),
    NOW(),
    '{"provider": "email", "providers": ["email"]}',
    '{}',
    false,
    'authenticated'
);

-- Create profile
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
);

-- =====================================================
-- 8. PENDING APPROVAL USER
-- =====================================================
-- Create auth user
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
    '88888888-8888-8888-8888-888888888888',
    '00000000-0000-0000-0000-000000000000',
    'pendinguser@bghs-alumni.com',
    '$2b$10$dmaS.CUtorSWh9dHq9YMdeb8sWLXH/RdyFdwiKs2tWY8rg/F6B0J6',
    NOW(),
    NOW(),
    NOW(),
    '{"provider": "email", "providers": ["email"]}',
    '{}',
    false,
    'authenticated'
);

-- Create profile
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
);

-- =====================================================
-- 9. PRIVATE PROFILE USER
-- =====================================================
-- Create auth user
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
    '99999999-9999-9999-9999-999999999999',
    '00000000-0000-0000-0000-000000000000',
    'privateuser@bghs-alumni.com',
    '$2b$10$dmaS.CUtorSWh9dHq9YMdeb8sWLXH/RdyFdwiKs2tWY8rg/F6B0J6',
    NOW(),
    NOW(),
    NOW(),
    '{"provider": "email", "providers": ["email"]}',
    '{}',
    false,
    'authenticated'
);

-- Create profile
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
);

-- =====================================================
-- VERIFICATION QUERY
-- =====================================================
-- Verify all users were created successfully
SELECT 
    p.email,
    p.first_name,
    p.last_name,
    p.role,
    p.is_approved,
    p.registration_id,
    a.email_confirmed_at,
    a.created_at as auth_created
FROM profiles p
LEFT JOIN auth.users a ON p.id = a.id
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
-- TEST CREDENTIALS
-- =====================================================
-- All users have the same password: TestPass123!
-- 
-- 1. Super Admin: superadmin@bghs-alumni.com
-- 2. Event Manager: eventmanager@bghs-alumni.com
-- 3. Content Creator: contentcreator@bghs-alumni.com
-- 4. Content Moderator: moderator@bghs-alumni.com
-- 5. Donation Manager: donationmanager@bghs-alumni.com
-- 6. Alumni Premium: premiummember@bghs-alumni.com
-- 7. Alumni Member: alumnimember@bghs-alumni.com
-- 8. Pending User: pendinguser@bghs-alumni.com
-- 9. Private User: privateuser@bghs-alumni.com
-- =====================================================
