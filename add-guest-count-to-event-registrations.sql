-- Add guest_count field to event_registrations table
-- This migration adds support for capturing how many people will attend an event

-- Add guest_count column to event_registrations table
ALTER TABLE event_registrations 
ADD COLUMN IF NOT EXISTS guest_count INTEGER DEFAULT 1 NOT NULL;

-- Add constraint to ensure guest_count is reasonable
ALTER TABLE event_registrations 
ADD CONSTRAINT chk_guest_count CHECK (guest_count >= 1 AND guest_count <= 10);

-- Update existing registrations to have guest_count = 1
UPDATE event_registrations 
SET guest_count = 1 
WHERE guest_count IS NULL;

-- Add comment for documentation
COMMENT ON COLUMN event_registrations.guest_count IS 'Number of people attending the event (including the registrant)';

-- Create index for better query performance on guest counts
CREATE INDEX IF NOT EXISTS idx_event_registrations_guest_count 
ON event_registrations(guest_count);
