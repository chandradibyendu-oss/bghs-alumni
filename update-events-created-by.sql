-- First, let's see what events exist and their current state
SELECT id, title, created_by, created_at FROM events ORDER BY created_at DESC;

-- Update the created_by column for existing events
-- Replace 'YOUR_USER_ID_HERE' with your actual user ID from Supabase auth.users table

-- Option 1: Update all events to be created by the first super_admin user
UPDATE events 
SET created_by = (
  SELECT p.id 
  FROM profiles p
  WHERE p.role = 'super_admin'
  ORDER BY p.created_at ASC
  LIMIT 1
)
WHERE created_by IS NULL;

-- Option 2: If you want to set a specific user as the creator
-- Replace 'your-user-id-here' with the actual UUID of your user
-- UPDATE events 
-- SET created_by = 'your-user-id-here'
-- WHERE created_by IS NULL;

-- Verify the update
SELECT id, title, created_by, created_at FROM events ORDER BY created_at DESC;
