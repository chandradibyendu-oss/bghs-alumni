-- Clean up duplicate registrations
-- Keep the most recent registration for each user-event pair
-- Delete the older duplicates

-- First, let's see what we're about to delete
SELECT 
    er.id,
    er.user_id,
    er.event_id,
    er.status,
    er.attendance_status,
    er.registration_date,
    er.guest_count,
    er.actual_attendance_count,
    p.full_name
FROM event_registrations er
JOIN profiles p ON er.user_id = p.id
WHERE er.id IN (
    SELECT er2.id
    FROM event_registrations er2
    WHERE er2.id NOT IN (
        SELECT DISTINCT ON (user_id, event_id) id
        FROM event_registrations
        WHERE event_id = 'f4b7b9a5-9845-4025-9504-0f12e5401316'
        ORDER BY user_id, event_id, registration_date DESC
    )
    AND er2.event_id = 'f4b7b9a5-9845-4025-9504-0f12e5401316'
)
ORDER BY er.user_id, er.registration_date;

-- Uncomment the DELETE statement below after reviewing the above SELECT results
-- DELETE FROM event_registrations 
-- WHERE id IN (
--     SELECT er2.id
--     FROM event_registrations er2
--     WHERE er2.id NOT IN (
--         SELECT DISTINCT ON (user_id, event_id) id
--         FROM event_registrations
--         WHERE event_id = 'f4b7b9a5-9845-4025-9504-0f12e5401316'
--         ORDER BY user_id, event_id, registration_date DESC
--     )
--     AND er2.event_id = 'f4b7b9a5-9845-4025-9504-0f12e5401316'
-- );
