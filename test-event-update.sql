-- Test script to check event update permissions and column structure

-- 1. Check if created_by column exists
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'events' 
AND column_name = 'created_by';

-- 2. Check current events and their created_by values
SELECT id, title, created_by, max_attendees 
FROM events 
ORDER BY created_at DESC;

-- 3. Test a simple update (replace with actual event ID)
-- UPDATE events 
-- SET max_attendees = 150 
-- WHERE id = 'your-event-id-here'
-- RETURNING id, title, max_attendees;

-- 4. Check RLS policies on events table
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'events';









