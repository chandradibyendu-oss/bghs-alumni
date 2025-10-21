-- Add unique constraint to prevent duplicate registrations
-- One user can only have one registration per event

-- First check if constraint already exists
SELECT 
    tc.constraint_name, 
    tc.table_name, 
    kcu.column_name,
    tc.constraint_type
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name = 'event_registrations' 
    AND tc.constraint_type = 'UNIQUE'
    AND kcu.column_name IN ('user_id', 'event_id');

-- Add unique constraint if it doesn't exist
-- This will prevent duplicate registrations for the same user and event
ALTER TABLE event_registrations 
ADD CONSTRAINT unique_user_event_registration 
UNIQUE (user_id, event_id);
