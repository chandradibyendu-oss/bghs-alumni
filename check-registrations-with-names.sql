-- Check registrations with member names for the test event
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
