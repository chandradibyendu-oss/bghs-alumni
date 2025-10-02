-- =====================================================
-- BGHS Alumni Website - Simple Test User Creation
-- =====================================================
-- This script creates test users using a simpler approach
-- that should work with Supabase authentication
-- =====================================================

-- First, let's create a function to create users properly
CREATE OR REPLACE FUNCTION create_test_user(
    user_email TEXT,
    user_password TEXT,
    user_first_name TEXT,
    user_last_name TEXT,
    user_phone TEXT,
    user_last_class INTEGER,
    user_year_of_leaving INTEGER,
    user_profession TEXT,
    user_company TEXT,
    user_location TEXT,
    user_role TEXT,
    user_approved BOOLEAN DEFAULT true
)
RETURNS TEXT AS $$
DECLARE
    new_user_id UUID;
BEGIN
    -- Generate a new UUID for the user
    new_user_id := gen_random_uuid();
    
    -- Insert into auth.users table
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
        new_user_id,
        '00000000-0000-0000-0000-000000000000',
        user_email,
        crypt(user_password, gen_salt('bf')),
        NOW(),
        NOW(),
        NOW(),
        '{"provider": "email", "providers": ["email"]}',
        '{}',
        false,
        'authenticated'
    ) ON CONFLICT (id) DO NOTHING;
    
    -- Insert into profiles table
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
        new_user_id,
        user_email,
        user_first_name,
        user_last_name,
        user_phone,
        user_last_class,
        user_year_of_leaving,
        user_profession,
        user_company,
        user_location,
        user_approved,
        user_role,
        NOW(),
        NOW()
    ) ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        first_name = EXCLUDED.first_name,
        last_name = EXCLUDED.last_name,
        role = EXCLUDED.role,
        is_approved = EXCLUDED.is_approved;
    
    RETURN new_user_id::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Now create the test users using the function
SELECT create_test_user(
    'superadmin@bghs-alumni.com',
    'TestPass123!',
    'Super',
    'Administrator',
    '+91-9876543210',
    12,
    1990,
    'System Administrator',
    'BGHS Alumni Association',
    'Mumbai, Maharashtra, India',
    'super_admin',
    true
);

SELECT create_test_user(
    'eventmanager@bghs-alumni.com',
    'TestPass123!',
    'Priya',
    'Sharma',
    '+91-9876543211',
    12,
    2005,
    'Event Coordinator',
    'Event Management Co.',
    'Delhi, Delhi, India',
    'event_manager',
    true
);

SELECT create_test_user(
    'contentcreator@bghs-alumni.com',
    'TestPass123!',
    'Rahul',
    'Patel',
    '+91-9876543212',
    12,
    2010,
    'Content Writer',
    'Digital Media Agency',
    'Bangalore, Karnataka, India',
    'content_creator',
    true
);

SELECT create_test_user(
    'moderator@bghs-alumni.com',
    'TestPass123!',
    'Anjali',
    'Singh',
    '+91-9876543213',
    12,
    2008,
    'Community Manager',
    'Social Media Solutions',
    'Pune, Maharashtra, India',
    'content_moderator',
    true
);

SELECT create_test_user(
    'donationmanager@bghs-alumni.com',
    'TestPass123!',
    'Vikram',
    'Gupta',
    '+91-9876543214',
    12,
    2000,
    'Fundraising Manager',
    'Non-Profit Organization',
    'Chennai, Tamil Nadu, India',
    'donation_manager',
    true
);

SELECT create_test_user(
    'premiummember@bghs-alumni.com',
    'TestPass123!',
    'Sneha',
    'Joshi',
    '+91-9876543215',
    12,
    2015,
    'Software Engineer',
    'Tech Solutions Ltd.',
    'Hyderabad, Telangana, India',
    'alumni_premium',
    true
);

SELECT create_test_user(
    'alumnimember@bghs-alumni.com',
    'TestPass123!',
    'Arjun',
    'Kumar',
    '+91-9876543216',
    12,
    2018,
    'Marketing Executive',
    'Advertising Agency',
    'Kolkata, West Bengal, India',
    'alumni_member',
    true
);

SELECT create_test_user(
    'pendinguser@bghs-alumni.com',
    'TestPass123!',
    'Rohit',
    'Verma',
    '+91-9876543217',
    12,
    2020,
    'Recent Graduate',
    'Startup Company',
    'Ahmedabad, Gujarat, India',
    'alumni_member',
    false
);

SELECT create_test_user(
    'privateuser@bghs-alumni.com',
    'TestPass123!',
    'Kavya',
    'Reddy',
    '+91-9876543218',
    12,
    2012,
    'Data Scientist',
    'AI Research Lab',
    'Bangalore, Karnataka, India',
    'alumni_member',
    true
);

-- Clean up the function
DROP FUNCTION create_test_user(TEXT, TEXT, TEXT, TEXT, TEXT, INTEGER, INTEGER, TEXT, TEXT, TEXT, TEXT, BOOLEAN);

-- Verification query
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
ORDER BY p.email;
