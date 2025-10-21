-- Check current registrations for the test event
SELECT 
    er.id,
    er.user_id,
    er.event_id,
    er.status,
    er.guest_count,
    er.attendance_status,
    er.actual_attendance_count,
    er.registration_date,
    er.attendance_updated_at,
    p.full_name,
    p.email,
    p.phone,
    -- Calculate hours since registration
    EXTRACT(EPOCH FROM (NOW() - er.registration_date)) / 3600 as hours_since_registration
FROM event_registrations er
LEFT JOIN profiles p ON er.user_id = p.id
WHERE er.event_id = 'f4b7b9a5-9845-4025-9504-0f12e5401316'
ORDER BY er.registration_date DESC;
