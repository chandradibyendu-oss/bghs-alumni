-- BGHS Alumni Website - User Roles and Permissions Setup
-- Run this in your Supabase SQL Editor

-- 1. Add role field to existing profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'alumni_member';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS permissions JSONB DEFAULT '{}';

-- 2. Create user roles table
CREATE TABLE IF NOT EXISTS user_roles (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  permissions JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 3. Create role assignments table
CREATE TABLE IF NOT EXISTS user_role_assignments (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role_id INTEGER REFERENCES user_roles(id) ON DELETE CASCADE,
  assigned_by UUID REFERENCES auth.users(id),
  assigned_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, role_id)
);

-- 4. Insert default roles with permissions
INSERT INTO user_roles (name, description, permissions) VALUES
('public', 'Unauthenticated users', '{"can_view_landing": true, "can_view_public_events": true, "can_view_public_blog": true}'),
('alumni_member', 'Basic alumni member', '{"can_view_landing": true, "can_view_directory": true, "can_edit_profile": true, "can_view_events": true, "can_register_events": true, "can_view_blog": true, "can_comment_blog": true}'),
('alumni_premium', 'Premium alumni member', '{"can_view_landing": true, "can_view_directory": true, "can_edit_profile": true, "can_view_events": true, "can_register_events": true, "can_view_blog": true, "can_comment_blog": true, "can_access_premium": true, "can_download_directory": true}'),
('content_moderator', 'Content moderator', '{"can_view_landing": true, "can_view_directory": true, "can_edit_profile": true, "can_view_events": true, "can_register_events": true, "can_view_blog": true, "can_comment_blog": true, "can_moderate_comments": true, "can_edit_public_content": true}'),
('event_manager', 'Event manager', '{"can_view_landing": true, "can_view_directory": true, "can_edit_profile": true, "can_view_events": true, "can_register_events": true, "can_view_blog": true, "can_comment_blog": true, "can_create_events": true, "can_manage_events": true, "can_send_notifications": true}'),
('content_creator', 'Content creator', '{"can_view_landing": true, "can_view_directory": true, "can_edit_profile": true, "can_view_events": true, "can_register_events": true, "can_view_blog": true, "can_comment_blog": true, "can_create_blog": true, "can_edit_blog": true, "can_upload_media": true}'),
('donation_manager', 'Donation manager', '{"can_view_landing": true, "can_view_directory": true, "can_edit_profile": true, "can_view_events": true, "can_register_events": true, "can_view_blog": true, "can_comment_blog": true, "can_view_donations": true, "can_manage_campaigns": true, "can_generate_reports": true}'),
('super_admin', 'Super administrator', '{"can_view_landing": true, "can_view_directory": true, "can_edit_profile": true, "can_view_events": true, "can_register_events": true, "can_view_blog": true, "can_comment_blog": true, "can_moderate_comments": true, "can_edit_public_content": true, "can_create_events": true, "can_manage_events": true, "can_send_notifications": true, "can_create_blog": true, "can_edit_blog": true, "can_upload_media": true, "can_view_donations": true, "can_manage_campaigns": true, "can_generate_reports": true, "can_manage_users": true, "can_manage_roles": true, "can_access_admin": true, "can_view_analytics": true}')
ON CONFLICT (name) DO UPDATE SET 
  permissions = EXCLUDED.permissions,
  updated_at = NOW();

-- 5. Update existing admin users to have super_admin role
UPDATE profiles 
SET role = 'super_admin', 
    permissions = (SELECT permissions FROM user_roles WHERE name = 'super_admin')
WHERE email = 'admin@bghs.edu.in' OR email LIKE '%admin%';

-- 6. Create function to get user permissions
CREATE OR REPLACE FUNCTION get_user_permissions(user_uuid UUID)
RETURNS JSONB AS $$
DECLARE
  user_role VARCHAR(50);
  role_permissions JSONB;
BEGIN
  -- Get user's role from profiles table
  SELECT role INTO user_role FROM profiles WHERE id = user_uuid;
  
  -- If no role found, default to public
  IF user_role IS NULL THEN
    user_role := 'public';
  END IF;
  
  -- Get permissions for the role
  SELECT permissions INTO role_permissions FROM user_roles WHERE name = user_role;
  
  -- Return permissions or empty object if none found
  RETURN COALESCE(role_permissions, '{}'::jsonb);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Create RLS policies for role-based access
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own profile
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- Policy: Users can update their own profile
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Policy: Public can view basic profile info (for directory)
CREATE POLICY "Public can view basic profiles" ON profiles
  FOR SELECT USING (true);

-- 8. Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON user_roles TO anon, authenticated;
GRANT SELECT ON user_role_assignments TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_user_permissions(UUID) TO anon, authenticated;

