-- Check all registrations for the specific event
SELECT 
    er.id,
    er.event_id,
    er.user_id,
    er.status,
    er.guest_count,
    er.attendance_status,
    er.actual_attendance_count,
    er.registration_date,
    er.attendance_updated_at,
    p.full_name,
    p.email,
    p.phone
FROM event_registrations er
LEFT JOIN profiles p ON er.user_id = p.id
WHERE er.event_id = 'f4b7b9a5-9845-4025-9504-0f12e5401316'
ORDER BY er.registration_date DESC;
