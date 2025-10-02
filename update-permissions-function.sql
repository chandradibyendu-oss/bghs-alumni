-- =====================================================
-- BGHS Alumni Website - Update Permissions Function
-- =====================================================
-- This script updates the get_user_permissions function to use
-- dynamic lookup from user_roles table instead of stored permissions.
-- 
-- IMPORTANT: Execute this in Supabase SQL editor to ensure
-- all components use the same dynamic permission lookup.
-- =====================================================

-- Update the get_user_permissions function to use dynamic lookup
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
  
  -- Get permissions from the role definition in user_roles table (always current)
  SELECT permissions INTO role_permissions FROM user_roles WHERE name = user_role;
  
  -- Return permissions or empty object if none found
  RETURN COALESCE(role_permissions, '{}'::jsonb);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION get_user_permissions(UUID) TO anon, authenticated;

-- =====================================================
-- VERIFICATION:
-- =====================================================
-- Test the function with a sample user
-- SELECT get_user_permissions('your-user-id-here');

-- =====================================================
-- NOTES:
-- =====================================================
-- 1. This function now uses dynamic lookup from user_roles table
-- 2. When you edit a role's permissions, all users with that role
--    immediately get the updated permissions
-- 3. No need to sync permissions to individual user records
-- 4. The permissions column in profiles table is no longer used
-- 5. All components (ProtectedRoute, API routes, etc.) will use
--    the updated permissions automatically
-- =====================================================
