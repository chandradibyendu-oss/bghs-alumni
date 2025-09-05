-- Create a test user for forgot password testing
-- Run this in your Supabase SQL Editor

-- Insert a test user profile
INSERT INTO profiles (id, email, full_name, batch_year, profession, company, location, bio, role, permissions) VALUES
('test-user-1234-5678-9abc-def012345678', 'test@example.com', 'Test User', 2000, 'Software Developer', 'Test Company', 'Kolkata, West Bengal', 'Test user for forgot password feature', 'alumni_member', '{"can_view_landing": true, "can_view_directory": true, "can_edit_profile": true, "can_view_events": true, "can_register_events": true, "can_view_blog": true, "can_comment_blog": true}');

-- Verify the user was created
SELECT 
  full_name,
  email,
  role,
  batch_year,
  profession
FROM profiles 
WHERE email = 'test@example.com';
