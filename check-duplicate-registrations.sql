-- Check for duplicate registrations (same user, same event)
SELECT 
    user_id,
    event_id,
    COUNT(*) as registration_count,
    STRING_AGG(id::text, ', ') as registration_ids,
    STRING_AGG(status, ', ') as statuses,
    STRING_AGG(attendance_status, ', ') as attendance_statuses
FROM event_registrations 
WHERE event_id = 'f4b7b9a5-9845-4025-9504-0f12e5401316'
GROUP BY user_id, event_id
HAVING COUNT(*) > 1
ORDER BY registration_count DESC;
