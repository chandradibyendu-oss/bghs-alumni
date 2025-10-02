-- =====================================================
-- BGHS Alumni Website - Remove Permissions Column
-- =====================================================
-- This script removes the permissions column from the profiles table
-- since we're now using dynamic permission lookup from user_roles table.
-- 
-- IMPORTANT: This is optional - the system will work with or without
-- the permissions column, but removing it cleans up the schema.
-- =====================================================

-- Step 1: Verify current structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND column_name = 'permissions';

-- Step 2: Remove the permissions column (optional cleanup)
-- Execute the command below to remove the unused permissions column
ALTER TABLE profiles DROP COLUMN IF EXISTS permissions;

-- Step 3: Verify the column is removed (if you ran the DROP command)
-- SELECT column_name, data_type, is_nullable 
-- FROM information_schema.columns 
-- WHERE table_name = 'profiles' 
-- AND column_name = 'permissions';

-- =====================================================
-- NOTES:
-- =====================================================
-- 1. The system now uses dynamic permission lookup from user_roles table
-- 2. When you edit a role's permissions, all users with that role 
--    immediately get the updated permissions
-- 3. No need to sync permissions to individual user records
-- 4. The permissions column in profiles table is no longer used
-- 5. Removing it is optional but recommended for cleaner schema
-- =====================================================
