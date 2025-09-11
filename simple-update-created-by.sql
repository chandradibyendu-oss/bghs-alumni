-- Simple SQL to update created_by for existing events
-- This will set all events to be created by the first super_admin user

UPDATE events 
SET created_by = (
  SELECT p.id 
  FROM profiles p
  WHERE p.role = 'super_admin'
  ORDER BY p.created_at ASC
  LIMIT 1
)
WHERE created_by IS NULL;

-- Check the result
SELECT id, title, created_by FROM events;
