-- =====================================================
-- BGHS Alumni Website - Fix Profile Viewing for Admin
-- =====================================================
-- This script fixes the profile viewing function to allow
-- super admins to see all profile data regardless of privacy settings
-- =====================================================

-- Update the get_profile_data_with_privacy function to include super admin override
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
BEGIN
  -- Get viewer's role to check if they're super admin
  SELECT role INTO viewer_role FROM profiles WHERE id = viewer_id;
  
  -- Get full profile data
  SELECT to_jsonb(p.*) INTO profile_data
  FROM profiles p
  WHERE p.id = target_id;
  
  -- If viewer is super admin, return full data without filtering
  IF viewer_role = 'super_admin' THEN
    RETURN jsonb_build_object(
      'profile', profile_data,
      'privacy_settings', '{}'::jsonb,
      'admin_override', true
    );
  END IF;
  
  -- For non-super admins, apply privacy filtering
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
    'admin_override', false
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION get_profile_data_with_privacy(UUID, UUID) TO authenticated, anon;

-- =====================================================
-- VERIFICATION:
-- =====================================================
-- Test the function with super admin
-- SELECT get_profile_data_with_privacy('super-admin-id', 'target-user-id');

-- =====================================================
-- NOTES:
-- =====================================================
-- 1. Super admins now see all profile data regardless of privacy settings
-- 2. Other users still see filtered data based on privacy settings
-- 3. The function returns an 'admin_override' flag to indicate if admin bypass was used
-- 4. This should resolve the "access denied" issue for super admins
-- =====================================================
