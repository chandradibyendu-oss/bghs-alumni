-- Debug Directory Issue
-- Run this to check what's happening with directory visibility

-- Step 1: Check current privacy settings
SELECT 
  id,
  full_name,
  is_approved,
  privacy_settings,
  (privacy_settings->>'show_in_directory')::boolean as show_in_directory_setting
FROM profiles 
LIMIT 10;

-- Step 2: Check if privacy settings definitions exist
SELECT COUNT(*) as privacy_definitions_count 
FROM privacy_settings_definitions;

-- Step 3: Check if the privacy functions exist
SELECT 
  routine_name,
  routine_type
FROM information_schema.routines 
WHERE routine_name IN (
  'get_privacy_settings_with_defaults',
  'user_allows_privacy_setting',
  'get_profile_data_with_privacy'
);

-- Step 4: Test the privacy function
SELECT get_privacy_settings_with_defaults();

-- Step 5: Check a specific user's privacy settings
-- Replace 'your-user-id' with an actual user ID from your profiles table
SELECT get_user_privacy_settings('your-user-id-here');

-- Step 6: Check if user allows directory visibility
-- Replace 'your-user-id' with an actual user ID
SELECT user_allows_privacy_setting('your-user-id-here', 'show_in_directory');
