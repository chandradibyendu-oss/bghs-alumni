-- Quick check: What columns does payment_notification_queue have?
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'payment_notification_queue'
ORDER BY ordinal_position;

