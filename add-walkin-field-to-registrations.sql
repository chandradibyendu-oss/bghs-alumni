-- Add is_walkin field to event_registrations table
-- This will permanently track whether a registration was created as a walk-in

-- Check if column already exists
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'event_registrations' 
AND column_name = 'is_walkin';

-- Add the is_walkin column if it doesn't exist
ALTER TABLE event_registrations 
ADD COLUMN IF NOT EXISTS is_walkin BOOLEAN DEFAULT FALSE;

-- Update existing records based on current logic
-- Mark registrations as walk-in if they were created recently (within last 24 hours)
-- This is a one-time migration to set existing walk-ins
UPDATE event_registrations 
SET is_walkin = TRUE 
WHERE registration_date > NOW() - INTERVAL '24 hours'
AND attendance_status = 'attended';

-- Verify the changes with member names
SELECT 
    er.id,
    er.user_id,
    er.status,
    er.attendance_status,
    er.is_walkin,
    er.registration_date,
    EXTRACT(EPOCH FROM (NOW() - er.registration_date)) / 3600 as hours_since_registration,
    p.full_name,
    p.email,
    p.phone
FROM event_registrations er
LEFT JOIN profiles p ON er.user_id = p.id
WHERE er.event_id = 'f4b7b9a5-9845-4025-9504-0f12e5401316'
ORDER BY er.registration_date DESC;
