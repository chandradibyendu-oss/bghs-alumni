-- Add actual_attendance_count column to event_registrations table
ALTER TABLE event_registrations
ADD COLUMN IF NOT EXISTS actual_attendance_count INTEGER;

-- Add a check constraint to ensure actual_attendance_count is positive and doesn't exceed guest_count
ALTER TABLE event_registrations
ADD CONSTRAINT chk_actual_attendance_count_valid
CHECK (actual_attendance_count IS NULL OR (actual_attendance_count >= 1 AND actual_attendance_count <= guest_count));

-- Add index for attendance count queries
CREATE INDEX IF NOT EXISTS idx_event_registrations_actual_attendance_count 
ON event_registrations(actual_attendance_count);

-- Add comment for documentation
COMMENT ON COLUMN event_registrations.actual_attendance_count IS 'Actual number of people who attended (can be less than guest_count if some registered people did not attend)';

-- Analyze table to update statistics
ANALYZE event_registrations;
