-- BGHS Alumni Website - Enhanced Access Control (DELTA ONLY)
-- Run this AFTER you've already executed add-privacy-settings.sql
-- This script only adds the new role-based functions and policies

-- Step 1: Create enhanced function for role-based profile viewing
CREATE OR REPLACE FUNCTION can_view_profile_enhanced(viewer_id UUID, target_id UUID)
RETURNS JSONB AS $$
DECLARE
  viewer_role VARCHAR(50);
  viewer_approved BOOLEAN;
  target_approved BOOLEAN;
  target_in_directory BOOLEAN;
  target_privacy JSONB;
  can_view BOOLEAN := false;
  access_level VARCHAR(20) := 'none';
  reason TEXT := '';
BEGIN
  -- Get viewer's role and approval status
  SELECT role, is_approved INTO viewer_role, viewer_approved 
  FROM profiles 
  WHERE id = viewer_id;
  
  -- Get target user's approval status and privacy settings
  SELECT is_approved, 
         COALESCE((privacy_settings->>'show_in_directory')::boolean, true),
         privacy_settings
  INTO target_approved, target_in_directory, target_privacy
  FROM profiles 
  WHERE id = target_id;
  
  -- Default viewer role if not found
  IF viewer_role IS NULL THEN
    viewer_role := 'public';
  END IF;
  
  -- Access Control Logic by Role:
  
  -- 1. SUPER ADMIN: Can view everything (override all privacy settings)
  IF viewer_role = 'super_admin' THEN
    can_view := true;
    access_level := 'full';
    reason := 'Super admin access';
  
  -- 2. ADMIN: Can view everything except private profiles
  ELSIF viewer_role = 'admin' THEN
    IF target_in_directory = true THEN
      can_view := true;
      access_level := 'full';
      reason := 'Admin access';
    ELSE
      can_view := false;
      access_level := 'none';
      reason := 'Profile not visible in directory';
    END IF;
  
  -- 3. AUTHENTICATED MEMBERS: Can view based on privacy settings
  ELSIF viewer_role IN ('alumni_member', 'alumni_premium', 'content_moderator') THEN
    IF viewer_approved = true AND target_approved = true AND target_in_directory = true THEN
      can_view := true;
      access_level := 'member';
      reason := 'Approved member access';
    ELSE
      can_view := false;
      access_level := 'none';
      reason := 'Not approved or profile not visible';
    END IF;
  
  -- 4. PENDING MEMBERS: Limited access
  ELSIF viewer_role = 'pending_member' THEN
    can_view := false;
    access_level := 'none';
    reason := 'Pending approval';
  
  -- 5. PUBLIC/NON-MEMBERS: Very limited access
  ELSIF viewer_role = 'public' OR viewer_role IS NULL THEN
    can_view := false;
    access_level := 'none';
    reason := 'Public access not allowed';
  
  -- 6. SELF-VIEW: Always allowed
  ELSIF viewer_id = target_id THEN
    can_view := true;
    access_level := 'self';
    reason := 'Viewing own profile';
  END IF;
  
  -- Return comprehensive access information
  RETURN jsonb_build_object(
    'can_view', can_view,
    'access_level', access_level,
    'reason', reason,
    'viewer_role', viewer_role,
    'target_privacy', target_privacy
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 2: Create function to get filtered profile data based on access level
CREATE OR REPLACE FUNCTION get_profile_data_for_viewer(viewer_id UUID, target_id UUID)
RETURNS JSONB AS $$
DECLARE
  access_info JSONB;
  profile_data JSONB;
  privacy_settings JSONB;
  filtered_data JSONB;
BEGIN
  -- Check access permissions
  access_info := can_view_profile_enhanced(viewer_id, target_id);
  
  -- If no access, return empty
  IF NOT (access_info->>'can_view')::boolean THEN
    RETURN jsonb_build_object(
      'error', 'Access denied',
      'reason', access_info->>'reason'
    );
  END IF;
  
  -- Get full profile data
  SELECT to_jsonb(p.*) INTO profile_data
  FROM profiles p
  WHERE p.id = target_id;
  
  -- Get privacy settings
  privacy_settings := profile_data->'privacy_settings';
  
  -- Filter data based on access level and privacy settings
  filtered_data := profile_data;
  
  -- Remove sensitive fields based on access level
  IF access_info->>'access_level' NOT IN ('full', 'self') THEN
    -- For member-level access, respect privacy settings
    IF NOT COALESCE((privacy_settings->>'show_email')::boolean, true) THEN
      filtered_data := filtered_data - 'email';
    END IF;
    
    IF NOT COALESCE((privacy_settings->>'show_phone')::boolean, false) THEN
      filtered_data := filtered_data - 'phone';
    END IF;
    
    IF NOT COALESCE((privacy_settings->>'show_profession')::boolean, true) THEN
      filtered_data := filtered_data - 'profession';
    END IF;
    
    IF NOT COALESCE((privacy_settings->>'show_company')::boolean, true) THEN
      filtered_data := filtered_data - 'company';
    END IF;
    
    IF NOT COALESCE((privacy_settings->>'show_location')::boolean, true) THEN
      filtered_data := filtered_data - 'location';
    END IF;
    
    IF NOT COALESCE((privacy_settings->>'show_bio')::boolean, true) THEN
      filtered_data := filtered_data - 'bio';
    END IF;
    
    IF NOT COALESCE((privacy_settings->>'show_social_links')::boolean, true) THEN
      filtered_data := filtered_data - 'linkedin_url' - 'website_url';
    END IF;
  END IF;
  
  -- Always remove sensitive system fields for non-admin users
  IF access_info->>'access_level' NOT IN ('full', 'self') THEN
    filtered_data := filtered_data - 'registration_id' - 'import_source' - 'imported_at';
  END IF;
  
  RETURN jsonb_build_object(
    'profile', filtered_data,
    'access_info', access_info
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 3: Create function to determine user role from auth context
CREATE OR REPLACE FUNCTION get_current_user_role()
RETURNS VARCHAR(50) AS $$
DECLARE
  current_user_id UUID;
  user_role VARCHAR(50);
BEGIN
  -- Get current authenticated user
  current_user_id := auth.uid();
  
  -- If no authenticated user, return public
  IF current_user_id IS NULL THEN
    RETURN 'public';
  END IF;
  
  -- Get user's role from profiles table
  SELECT role INTO user_role
  FROM profiles
  WHERE id = current_user_id;
  
  -- Default role if not found
  IF user_role IS NULL THEN
    RETURN 'public';
  END IF;
  
  RETURN user_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 4: Grant permissions
GRANT EXECUTE ON FUNCTION can_view_profile_enhanced(UUID, UUID) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION get_profile_data_for_viewer(UUID, UUID) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION get_current_user_role() TO authenticated, anon;

-- Step 5: Create RLS policy for profile viewing based on roles
DROP POLICY IF EXISTS "Role-based profile viewing" ON profiles;
CREATE POLICY "Role-based profile viewing" ON profiles
  FOR SELECT USING (
    -- Super admin can see everything
    get_current_user_role() = 'super_admin' OR
    -- Admin can see directory-visible profiles
    (get_current_user_role() = 'admin' AND COALESCE((privacy_settings->>'show_in_directory')::boolean, true)) OR
    -- Approved members can see other approved members
    (get_current_user_role() IN ('alumni_member', 'alumni_premium', 'content_moderator') 
     AND is_approved = true 
     AND COALESCE((privacy_settings->>'show_in_directory')::boolean, true)) OR
    -- Users can always see their own profile
    auth.uid() = id
  );

-- Verification queries (optional - run to check the setup)
-- SELECT get_current_user_role();
-- SELECT can_view_profile_enhanced('viewer-uuid', 'target-uuid');
-- SELECT get_profile_data_for_viewer('viewer-uuid', 'target-uuid');
