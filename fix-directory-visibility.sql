-- Fix Directory Visibility Issue
-- This ensures existing users are visible in the directory

-- Step 1: Update existing users to have show_in_directory = true by default
UPDATE profiles 
SET privacy_settings = COALESCE(privacy_settings, '{}'::jsonb) || '{"show_in_directory": true}'::jsonb
WHERE privacy_settings IS NULL 
   OR NOT (privacy_settings ? 'show_in_directory')
   OR (privacy_settings->>'show_in_directory')::boolean IS NULL;

-- Step 2: Ensure all approved users are visible in directory
UPDATE profiles 
SET privacy_settings = privacy_settings || '{"show_in_directory": true}'::jsonb
WHERE is_approved = true;

-- Step 3: Verify the fix
SELECT 
  COUNT(*) as total_users,
  COUNT(CASE WHEN is_approved = true THEN 1 END) as approved_users,
  COUNT(CASE WHEN (privacy_settings->>'show_in_directory')::boolean = true THEN 1 END) as visible_in_directory
FROM profiles;
