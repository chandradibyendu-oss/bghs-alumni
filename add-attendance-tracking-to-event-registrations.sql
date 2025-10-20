-- Add attendance tracking fields to event_registrations table
ALTER TABLE event_registrations
ADD COLUMN IF NOT EXISTS attendance_status VARCHAR(20) DEFAULT 'pending';

ALTER TABLE event_registrations
ADD COLUMN IF NOT EXISTS attendance_updated_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE event_registrations
ADD COLUMN IF NOT EXISTS attendance_updated_by UUID REFERENCES auth.users(id);

-- Add check constraint for attendance_status
ALTER TABLE event_registrations
ADD CONSTRAINT chk_attendance_status
CHECK (attendance_status IN ('pending', 'attended', 'no_show'));

-- Add index for attendance queries
CREATE INDEX IF NOT EXISTS idx_event_registrations_attendance_status 
ON event_registrations(attendance_status);

CREATE INDEX IF NOT EXISTS idx_event_registrations_event_attendance 
ON event_registrations(event_id, attendance_status);

-- Update existing confirmed registrations to have 'pending' attendance status
UPDATE event_registrations
SET attendance_status = 'pending'
WHERE status = 'confirmed' AND attendance_status IS NULL;

-- Add comments for documentation
COMMENT ON COLUMN event_registrations.attendance_status IS 'Attendance status: pending (not yet marked), attended (actually attended), no_show (did not attend)';
COMMENT ON COLUMN event_registrations.attendance_updated_at IS 'When the attendance status was last updated';
COMMENT ON COLUMN event_registrations.attendance_updated_by IS 'Admin user who updated the attendance status';

-- Analyze table to update statistics
ANALYZE event_registrations;
