-- BGHS Alumni Website - Create Sample Users for Testing
-- Run this in your Supabase SQL Editor AFTER running database-roles-setup.sql

-- First, let's create sample users in Supabase Auth
-- Note: You'll need to manually create these users in Supabase Dashboard first
-- Go to Authentication > Users > Add User for each of these

-- 1. Create sample user profiles with different roles
INSERT INTO profiles (id, email, full_name, batch_year, profession, company, location, bio, role, permissions) VALUES
-- Super Admin
('11111111-1111-1111-1111-111111111111', 'admin@bghs.edu.in', 'Admin User', 1990, 'System Administrator', 'BGHS Alumni Association', 'Kolkata, West Bengal', 'Super administrator with full system access', 'super_admin', '{"can_view_landing": true, "can_view_directory": true, "can_edit_profile": true, "can_view_events": true, "can_register_events": true, "can_view_blog": true, "can_comment_blog": true, "can_moderate_comments": true, "can_edit_public_content": true, "can_create_events": true, "can_manage_events": true, "can_send_notifications": true, "can_create_blog": true, "can_edit_blog": true, "can_upload_media": true, "can_view_donations": true, "can_manage_campaigns": true, "can_generate_reports": true, "can_manage_users": true, "can_manage_roles": true, "can_access_admin": true, "can_view_analytics": true}'),

-- Alumni Premium
('22222222-2222-2222-2222-222222222222', 'premium@bghs.edu.in', 'Premium User', 1995, 'Software Engineer', 'Tech Corp', 'Bangalore, Karnataka', 'Premium alumni member with enhanced features', 'alumni_premium', '{"can_view_landing": true, "can_view_directory": true, "can_edit_profile": true, "can_view_events": true, "can_register_events": true, "can_view_blog": true, "can_comment_blog": true, "can_access_premium": true, "can_download_directory": true}'),

-- Content Moderator
('33333333-3333-3333-3333-333333333333', 'moderator@bghs.edu.in', 'Moderator User', 1992, 'Content Manager', 'Media House', 'Mumbai, Maharashtra', 'Content moderator responsible for community guidelines', 'content_moderator', '{"can_view_landing": true, "can_view_directory": true, "can_edit_profile": true, "can_view_events": true, "can_register_events": true, "can_view_blog": true, "can_comment_blog": true, "can_moderate_comments": true, "can_edit_public_content": true}'),

-- Event Manager
('44444444-4444-4444-4444-444444444444', 'events@bghs.edu.in', 'Event Manager', 1988, 'Event Coordinator', 'Event Solutions', 'Delhi, NCR', 'Event manager organizing alumni gatherings and reunions', 'event_manager', '{"can_view_landing": true, "can_view_directory": true, "can_edit_profile": true, "can_view_events": true, "can_register_events": true, "can_view_blog": true, "can_comment_blog": true, "can_create_events": true, "can_manage_events": true, "can_send_notifications": true}'),

-- Content Creator
('55555555-5555-5555-5555-555555555555', 'creator@bghs.edu.in', 'Content Creator', 1993, 'Journalist', 'News Daily', 'Chennai, Tamil Nadu', 'Content creator writing alumni stories and updates', 'content_creator', '{"can_view_landing": true, "can_view_directory": true, "can_edit_profile": true, "can_view_events": true, "can_register_events": true, "can_view_blog": true, "can_comment_blog": true, "can_create_blog": true, "can_edit_blog": true, "can_upload_media": true}'),

-- Donation Manager
('66666666-6666-6666-6666-666666666666', 'donations@bghs.edu.in', 'Donation Manager', 1985, 'Fundraising Manager', 'Charity Foundation', 'Hyderabad, Telangana', 'Donation manager handling fundraising campaigns', 'donation_manager', '{"can_view_landing": true, "can_view_directory": true, "can_edit_profile": true, "can_view_events": true, "can_register_events": true, "can_view_blog": true, "can_comment_blog": true, "can_view_donations": true, "can_manage_campaigns": true, "can_generate_reports": true}'),

-- Basic Alumni Members
('77777777-7777-7777-7777-777777777777', 'alumni1@bghs.edu.in', 'Alumni One', 2000, 'Teacher', 'Public School', 'Kolkata, West Bengal', 'Basic alumni member working in education', 'alumni_member', '{"can_view_landing": true, "can_view_directory": true, "can_edit_profile": true, "can_view_events": true, "can_register_events": true, "can_view_blog": true, "can_comment_blog": true}'),

('88888888-8888-8888-8888-888888888888', 'alumni2@bghs.edu.in', 'Alumni Two', 2005, 'Doctor', 'City Hospital', 'Kolkata, West Bengal', 'Basic alumni member in healthcare', 'alumni_member', '{"can_view_landing": true, "can_view_directory": true, "can_edit_profile": true, "can_view_events": true, "can_register_events": true, "can_view_blog": true, "can_comment_blog": true}'),

('99999999-9999-9999-9999-999999999999', 'alumni3@bghs.edu.in', 'Alumni Three', 2010, 'Engineer', 'Construction Co', 'Kolkata, West Bengal', 'Basic alumni member in construction', 'alumni_member', '{"can_view_landing": true, "can_view_directory": true, "can_edit_profile": true, "can_view_events": true, "can_register_events": true, "can_view_blog": true, "can_comment_blog": true}'),

('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'alumni4@bghs.edu.in', 'Alumni Four', 2015, 'Student', 'University', 'Kolkata, West Bengal', 'Recent graduate pursuing higher studies', 'alumni_member', '{"can_view_landing": true, "can_view_directory": true, "can_edit_profile": true, "can_view_events": true, "can_register_events": true, "can_view_blog": true, "can_comment_blog": true}');

-- 2. Create test passwords for these users (you'll need to set these in Supabase Auth)
-- Go to Authentication > Users and set these passwords:
-- admin@bghs.edu.in: admin123
-- premium@bghs.edu.in: premium123
-- moderator@bghs.edu.in: moderator123
-- events@bghs.edu.in: events123
-- creator@bghs.edu.in: creator123
-- donations@bghs.edu.in: donations123
-- alumni1@bghs.edu.in: alumni123
-- alumni2@bghs.edu.in: alumni123
-- alumni3@bghs.edu.in: alumni123
-- alumni4@bghs.edu.in: alumni123

-- 3. Verify the users were created
SELECT 
  full_name,
  email,
  role,
  batch_year,
  profession,
  company,
  location
FROM profiles 
WHERE role IS NOT NULL 
ORDER BY 
  CASE role
    WHEN 'super_admin' THEN 1
    WHEN 'alumni_premium' THEN 2
    WHEN 'content_moderator' THEN 3
    WHEN 'event_manager' THEN 4
    WHEN 'content_creator' THEN 5
    WHEN 'donation_manager' THEN 6
    WHEN 'alumni_member' THEN 7
    ELSE 8
  END,
  full_name;

