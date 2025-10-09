-- Get the payment transaction for the user (without assuming column names)
-- This will show ALL columns that exist in the table

SELECT *
FROM payment_transactions
WHERE user_id = '080a42db-c2ea-40b3-b91e-4b4e977f4e03'
ORDER BY created_at DESC
LIMIT 1;

