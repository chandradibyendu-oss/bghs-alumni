-- BGHS Alumni Website - Comprehensive RBAC System
-- This extends the existing role system with enhanced features

-- Step 1: Create permission categories for better organization
CREATE TABLE IF NOT EXISTS permission_categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Insert permission categories
INSERT INTO permission_categories (name, description, display_order) VALUES
('general', 'General Access', 1),
('profile', 'Profile Management', 2),
('directory', 'Directory Access', 3),
('events', 'Event Management', 4),
('blog', 'Blog & Content', 5),
('donations', 'Donation Management', 6),
('admin', 'Administration', 7),
('analytics', 'Analytics & Reports', 8)
ON CONFLICT (name) DO NOTHING;

-- Step 2: Create detailed permissions table
CREATE TABLE IF NOT EXISTS permissions (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  category_id INTEGER REFERENCES permission_categories(id),
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Insert detailed permissions
INSERT INTO permissions (name, description, category_id, display_order) VALUES
-- General Access
('view_landing', 'View landing page', 1, 1),
('view_public_content', 'View public content', 1, 2),

-- Profile Management
('edit_own_profile', 'Edit own profile', 2, 1),
('view_other_profiles', 'View other user profiles', 2, 2),
('manage_profile_privacy', 'Manage profile privacy settings', 2, 3),

-- Directory Access
('view_directory', 'View alumni directory', 3, 1),
('search_directory', 'Search directory', 3, 2),
('download_directory', 'Download directory data', 3, 3),
('connect_with_alumni', 'Connect with other alumni', 3, 4),

-- Event Management
('view_events', 'View events', 4, 1),
('register_events', 'Register for events', 4, 2),
('create_events', 'Create new events', 4, 3),
('manage_events', 'Manage existing events', 4, 4),
('delete_events', 'Delete events', 4, 5),
('send_event_notifications', 'Send event notifications', 4, 6),

-- Blog & Content
('view_blog', 'View blog posts', 5, 1),
('comment_blog', 'Comment on blog posts', 5, 2),
('create_blog', 'Create blog posts', 5, 3),
('edit_blog', 'Edit blog posts', 5, 4),
('delete_blog', 'Delete blog posts', 5, 5),
('moderate_comments', 'Moderate blog comments', 5, 6),
('upload_media', 'Upload media files', 5, 7),

-- Donation Management
('view_donations', 'View donation information', 6, 1),
('make_donations', 'Make donations', 6, 2),
('manage_campaigns', 'Manage donation campaigns', 6, 3),
('view_donation_reports', 'View donation reports', 6, 4),

-- Administration
('access_admin', 'Access admin panel', 7, 1),
('manage_users', 'Manage user accounts', 7, 2),
('manage_roles', 'Manage user roles', 7, 3),
('manage_permissions', 'Manage permissions', 7, 4),
('manage_system_settings', 'Manage system settings', 7, 5),
('view_audit_logs', 'View audit logs', 7, 6),

-- Analytics & Reports
('view_analytics', 'View analytics dashboard', 8, 1),
('generate_reports', 'Generate reports', 8, 2),
('export_data', 'Export system data', 8, 3)
ON CONFLICT (name) DO NOTHING;

-- Step 3: Create role-permission mapping table
CREATE TABLE IF NOT EXISTS role_permissions (
  id SERIAL PRIMARY KEY,
  role_id INTEGER REFERENCES user_roles(id) ON DELETE CASCADE,
  permission_id INTEGER REFERENCES permissions(id) ON DELETE CASCADE,
  granted BOOLEAN DEFAULT true,
  granted_by UUID REFERENCES auth.users(id),
  granted_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(role_id, permission_id)
);

-- Step 4: Create function to get user permissions with categories
CREATE OR REPLACE FUNCTION get_user_permissions_detailed(user_uuid UUID)
RETURNS JSONB AS $$
DECLARE
  user_role VARCHAR(50);
  permissions_data JSONB;
BEGIN
  -- Get user's role
  SELECT role INTO user_role FROM profiles WHERE id = user_uuid;
  
  -- If no role found, default to public
  IF user_role IS NULL THEN
    user_role := 'public';
  END IF;
  
  -- Get permissions grouped by category
  SELECT jsonb_object_agg(
    pc.name,
    jsonb_object_agg(
      p.name,
      COALESCE(rp.granted, false)
    )
  ) INTO permissions_data
  FROM permission_categories pc
  LEFT JOIN permissions p ON p.category_id = pc.id
  LEFT JOIN user_roles ur ON ur.name = user_role
  LEFT JOIN role_permissions rp ON rp.role_id = ur.id AND rp.permission_id = p.id
  GROUP BY pc.name;
  
  RETURN COALESCE(permissions_data, '{}'::jsonb);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 5: Create function to check specific permission
CREATE OR REPLACE FUNCTION has_permission(user_uuid UUID, permission_name VARCHAR)
RETURNS BOOLEAN AS $$
DECLARE
  user_role VARCHAR(50);
  has_perm BOOLEAN := false;
BEGIN
  -- Get user's role
  SELECT role INTO user_role FROM profiles WHERE id = user_uuid;
  
  -- If no role found, default to public
  IF user_role IS NULL THEN
    user_role := 'public';
  END IF;
  
  -- Check if user has the specific permission
  SELECT COALESCE(rp.granted, false) INTO has_perm
  FROM user_roles ur
  JOIN role_permissions rp ON rp.role_id = ur.id
  JOIN permissions p ON p.id = rp.permission_id
  WHERE ur.name = user_role AND p.name = permission_name;
  
  RETURN has_perm;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 6: Create audit log table for permission changes
CREATE TABLE IF NOT EXISTS permission_audit_log (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  action VARCHAR(50) NOT NULL, -- 'grant', 'revoke', 'role_change'
  permission_name VARCHAR(100),
  role_name VARCHAR(50),
  target_user_id UUID REFERENCES auth.users(id),
  performed_by UUID REFERENCES auth.users(id),
  performed_at TIMESTAMP DEFAULT NOW(),
  ip_address INET,
  user_agent TEXT
);

-- Step 7: Create function to log permission changes
CREATE OR REPLACE FUNCTION log_permission_change(
  p_user_id UUID,
  p_action VARCHAR(50),
  p_permission_name VARCHAR(100),
  p_role_name VARCHAR(50),
  p_target_user_id UUID,
  p_performed_by UUID
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO permission_audit_log (
    user_id, action, permission_name, role_name, 
    target_user_id, performed_by
  ) VALUES (
    p_user_id, p_action, p_permission_name, p_role_name,
    p_target_user_id, p_performed_by
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 8: Grant permissions
GRANT EXECUTE ON FUNCTION get_user_permissions_detailed(UUID) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION has_permission(UUID, VARCHAR) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION log_permission_change(UUID, VARCHAR, VARCHAR, VARCHAR, UUID, UUID) TO authenticated;

-- Step 9: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_role_permissions_role_id ON role_permissions(role_id);
CREATE INDEX IF NOT EXISTS idx_role_permissions_permission_id ON role_permissions(permission_id);
CREATE INDEX IF NOT EXISTS idx_permission_audit_log_user_id ON permission_audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_permission_audit_log_performed_at ON permission_audit_log(performed_at);

-- Step 10: Populate role-permission mappings for existing roles
-- This will be done in a separate script to avoid conflicts
