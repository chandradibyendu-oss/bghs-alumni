-- Fix the actual_attendance_count constraint to allow up to 10 people
-- instead of being limited by the original guest_count

-- Drop the existing constraint
ALTER TABLE event_registrations 
DROP CONSTRAINT chk_actual_attendance_count_valid;

-- Add the new constraint that allows up to 10 people
ALTER TABLE event_registrations 
ADD CONSTRAINT chk_actual_attendance_count_valid 
CHECK (
    actual_attendance_count IS NULL 
    OR (
        actual_attendance_count >= 1 
        AND actual_attendance_count <= 10
    )
);

-- Verify the constraint was updated
SELECT 
    tc.constraint_name, 
    tc.table_name, 
    cc.check_clause
FROM information_schema.table_constraints tc
JOIN information_schema.check_constraints cc 
    ON tc.constraint_name = cc.constraint_name
WHERE tc.constraint_name = 'chk_actual_attendance_count_valid'
    AND tc.table_name = 'event_registrations';
