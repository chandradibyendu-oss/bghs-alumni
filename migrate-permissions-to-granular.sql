-- Migration Script: Convert can_manage_users to Granular Permissions
-- Run this in your Supabase SQL Editor
-- 
-- This script converts existing roles that have can_manage_users: true
-- to the new granular permissions:
--   - can_manage_user_profiles
--   - can_manage_payment_settings
--   - can_view_payment_queue
--   - can_manage_alumni_migration
--   - can_manage_notices
--   - can_export_alumni_data

-- Step 1: Update roles that have can_manage_users: true
UPDATE user_roles
SET permissions = jsonb_set(
  jsonb_set(
    jsonb_set(
      jsonb_set(
        jsonb_set(
          jsonb_set(
            permissions,
            '{can_manage_user_profiles}',
            'true'
          ),
          '{can_manage_payment_settings}',
          'true'
        ),
        '{can_view_payment_queue}',
        'true'
      ),
      '{can_manage_alumni_migration}',
      'true'
    ),
    '{can_manage_notices}',
    'true'
  ),
  '{can_export_alumni_data}',
  'true'
)
WHERE permissions->>'can_manage_users' = 'true';

-- Step 2: Remove can_manage_users from all roles (clean up)
UPDATE user_roles
SET permissions = permissions - 'can_manage_users'
WHERE permissions ? 'can_manage_users';

-- Step 3: Add new event-related permissions if can_manage_events exists
-- Add can_take_attendance and can_manage_committee for roles with can_manage_events
UPDATE user_roles
SET permissions = jsonb_set(
  jsonb_set(
    permissions,
    '{can_take_attendance}',
    COALESCE(permissions->'can_take_attendance', 'true')
  ),
  '{can_manage_committee}',
  COALESCE(permissions->'can_manage_committee', 'true')
)
WHERE permissions->>'can_manage_events' = 'true'
  AND (
    permissions->>'can_take_attendance' IS NULL 
    OR permissions->>'can_manage_committee' IS NULL
  );

-- Verification: Check which roles were updated
SELECT 
  name,
  description,
  permissions->>'can_manage_users' as old_can_manage_users,
  permissions->>'can_manage_user_profiles' as can_manage_user_profiles,
  permissions->>'can_manage_payment_settings' as can_manage_payment_settings,
  permissions->>'can_view_payment_queue' as can_view_payment_queue,
  permissions->>'can_manage_alumni_migration' as can_manage_alumni_migration,
  permissions->>'can_manage_notices' as can_manage_notices,
  permissions->>'can_export_alumni_data' as can_export_alumni_data
FROM user_roles
WHERE permissions ? 'can_manage_user_profiles'
ORDER BY name;

-- Note: After running this migration, you should:
-- 1. Test that existing roles still work correctly
-- 2. Verify that dashboard cards appear for users with updated roles
-- 3. Update any custom roles manually if needed


