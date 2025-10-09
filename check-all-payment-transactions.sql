-- Check if there are ANY payment transactions (bypassing potential RLS issues)
-- This will help us understand if the transaction exists but is hidden by RLS

-- Check by order ID (we know this from the logs: order_RRNXf7YJNkEa3r)
SELECT *
FROM payment_transactions
WHERE razorpay_order_id = 'order_RRNXf7YJNkEa3r';

-- Also check the most recent transactions (in case user_id doesn't match)
SELECT 
    id,
    user_id,
    related_entity_id,
    amount,
    currency,
    payment_status,
    razorpay_order_id,
    razorpay_payment_id,
    created_at
FROM payment_transactions
ORDER BY created_at DESC
LIMIT 5;

