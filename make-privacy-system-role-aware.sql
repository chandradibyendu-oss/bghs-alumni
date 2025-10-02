-- =====================================================
-- BGHS Alumni Website - Make Privacy System Role-Aware
-- =====================================================
-- This script updates the privacy system to respect role-based permissions
-- Super admins and other admin roles can see all data regardless of privacy settings
-- =====================================================

-- Update the get_profile_data_with_privacy function to be role-aware
CREATE OR REPLACE FUNCTION get_profile_data_with_privacy(
  viewer_id UUID,
  target_id UUID
)
RETURNS JSONB AS $$
DECLARE
  profile_data JSONB;
  filtered_data JSONB;
  setting_key VARCHAR(100);
  setting_value JSONB;
  privacy_settings JSONB;
  viewer_role VARCHAR(50);
  viewer_permissions JSONB;
BEGIN
  -- Get viewer's role and permissions
  SELECT role INTO viewer_role FROM profiles WHERE id = viewer_id;
  
  -- Get viewer's permissions from role definition
  SELECT permissions INTO viewer_permissions 
  FROM user_roles 
  WHERE name = viewer_role;
  
  -- Get full profile data
  SELECT to_jsonb(p.*) INTO profile_data
  FROM profiles p
  WHERE p.id = target_id;
  
  -- Check if viewer has admin-level permissions (can see all data)
  -- This includes: super_admin, and any role with can_manage_users permission
  IF viewer_role = 'super_admin' OR 
     (viewer_permissions ? 'can_manage_users' AND (viewer_permissions->>'can_manage_users')::boolean = true) THEN
    -- Admin users see all data without privacy filtering
    RETURN jsonb_build_object(
      'profile', profile_data,
      'privacy_settings', '{}'::jsonb,
      'admin_override', true,
      'reason', 'Admin access - full data visible'
    );
  END IF;
  
  -- For non-admin users, apply privacy filtering
  -- Get target user's privacy settings
  privacy_settings := get_user_privacy_settings(target_id);
  
  -- Start with full data
  filtered_data := profile_data;
  
  -- Remove fields based on privacy settings
  FOR setting_key, setting_value IN 
    SELECT key, value->'value' 
    FROM jsonb_each(privacy_settings)
  LOOP
    -- If setting is false, remove the corresponding field
    IF NOT COALESCE((setting_value)::boolean, true) THEN
      CASE setting_key
        WHEN 'show_email' THEN
          filtered_data := filtered_data - 'email';
        WHEN 'show_phone' THEN
          filtered_data := filtered_data - 'phone';
        WHEN 'show_profession' THEN
          filtered_data := filtered_data - 'profession';
        WHEN 'show_company' THEN
          filtered_data := filtered_data - 'company';
        WHEN 'show_location' THEN
          filtered_data := filtered_data - 'location';
        WHEN 'show_bio' THEN
          filtered_data := filtered_data - 'bio';
        WHEN 'show_social_links' THEN
          filtered_data := filtered_data - 'linkedin_url' - 'website_url';
        WHEN 'show_registration_date' THEN
          filtered_data := filtered_data - 'created_at';
        WHEN 'show_last_login' THEN
          filtered_data := filtered_data - 'last_sign_in_at';
        -- Add more cases as needed
      END CASE;
    END IF;
  END LOOP;
  
  -- Always remove sensitive system fields for non-admin users
  IF viewer_id != target_id THEN
    filtered_data := filtered_data - 'registration_id' - 'import_source' - 'imported_at';
  END IF;
  
  RETURN jsonb_build_object(
    'profile', filtered_data,
    'privacy_settings', privacy_settings,
    'admin_override', false,
    'reason', 'Standard privacy filtering applied'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION get_profile_data_with_privacy(UUID, UUID) TO authenticated, anon;

-- =====================================================
-- VERIFICATION:
-- =====================================================
-- Test with different roles:
-- 1. Super admin should see all data
-- 2. Users with can_manage_users permission should see all data
-- 3. Regular users should see filtered data based on privacy settings

-- =====================================================
-- NOTES:
-- =====================================================
-- 1. The privacy system now respects role-based permissions
-- 2. Any role with 'can_manage_users' permission can see all profile data
-- 3. This can be configured through the role management screen
-- 4. Super admins automatically get full access
-- 5. Other admin roles can be granted full access by giving them 'can_manage_users' permission
-- =====================================================
