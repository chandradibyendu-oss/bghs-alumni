-- BGHS Alumni Website - Add Privacy Settings to Profiles
-- Run this in your Supabase SQL Editor

-- Step 1: Add privacy_settings column to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS privacy_settings JSONB DEFAULT '{
  "show_email": true,
  "show_phone": false,
  "show_in_directory": true,
  "allow_connection_requests": true,
  "show_profession": true,
  "show_company": true,
  "show_location": true,
  "show_bio": true,
  "show_social_links": true
}';

-- Step 2: Update existing users with default privacy settings
-- This ensures all existing users have consistent privacy settings
UPDATE profiles 
SET privacy_settings = '{
  "show_email": true,
  "show_phone": false,
  "show_in_directory": true,
  "allow_connection_requests": true,
  "show_profession": true,
  "show_company": true,
  "show_location": true,
  "show_bio": true,
  "show_social_links": true
}'::jsonb
WHERE privacy_settings IS NULL;

-- Step 3: Add comment to explain the privacy settings structure
COMMENT ON COLUMN profiles.privacy_settings IS 'JSONB object containing user privacy preferences:
{
  "show_email": boolean,           -- Allow email to be visible in directory/profile
  "show_phone": boolean,           -- Allow phone to be visible in directory/profile  
  "show_in_directory": boolean,    -- Include user in public directory listing
  "allow_connection_requests": boolean, -- Allow other users to send connection requests
  "show_profession": boolean,      -- Show profession in directory/profile
  "show_company": boolean,         -- Show company in directory/profile
  "show_location": boolean,        -- Show location in directory/profile
  "show_bio": boolean,             -- Show bio in directory/profile
  "show_social_links": boolean     -- Show LinkedIn/website links in directory/profile
}';

-- Step 4: Create index for efficient privacy-based queries
CREATE INDEX IF NOT EXISTS idx_profiles_privacy_directory 
ON profiles USING GIN ((privacy_settings->'show_in_directory'));

-- Step 5: Create function to check if user can view another user's profile
CREATE OR REPLACE FUNCTION can_view_profile(viewer_id UUID, target_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  viewer_approved BOOLEAN;
  target_approved BOOLEAN;
  target_in_directory BOOLEAN;
BEGIN
  -- Check if viewer is approved
  SELECT is_approved INTO viewer_approved 
  FROM profiles 
  WHERE id = viewer_id;
  
  -- Check if target user is approved and visible in directory
  SELECT is_approved, 
         COALESCE((privacy_settings->>'show_in_directory')::boolean, true)
  INTO target_approved, target_in_directory
  FROM profiles 
  WHERE id = target_id;
  
  -- Can view if:
  -- 1. Viewer is approved AND
  -- 2. Target is approved AND  
  -- 3. Target allows directory visibility
  -- 4. OR viewer is viewing their own profile
  RETURN (viewer_approved = true AND target_approved = true AND target_in_directory = true)
         OR viewer_id = target_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 6: Grant execute permission on the function
GRANT EXECUTE ON FUNCTION can_view_profile(UUID, UUID) TO authenticated, anon;

-- Verification queries (optional - run to check the setup)
-- SELECT COUNT(*) as total_users FROM profiles;
-- SELECT COUNT(*) as users_with_privacy_settings FROM profiles WHERE privacy_settings IS NOT NULL;
-- SELECT privacy_settings FROM profiles LIMIT 3;
