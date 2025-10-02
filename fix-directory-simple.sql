-- Simple Fix for Directory Visibility
-- This ensures all approved users are visible in directory

-- Step 1: Set show_in_directory to true for all approved users
UPDATE profiles 
SET privacy_settings = COALESCE(privacy_settings, '{}'::jsonb) || '{"show_in_directory": true}'::jsonb
WHERE is_approved = true;

-- Step 2: Also set it for users who don't have privacy_settings yet
UPDATE profiles 
SET privacy_settings = '{"show_in_directory": true}'::jsonb
WHERE privacy_settings IS NULL;

-- Step 3: Verify the fix
SELECT 
  COUNT(*) as total_users,
  COUNT(CASE WHEN is_approved = true THEN 1 END) as approved_users,
  COUNT(CASE WHEN (privacy_settings->>'show_in_directory')::boolean = true THEN 1 END) as visible_in_directory,
  COUNT(CASE WHEN is_approved = true AND (privacy_settings->>'show_in_directory')::boolean = true THEN 1 END) as approved_and_visible
FROM profiles;
