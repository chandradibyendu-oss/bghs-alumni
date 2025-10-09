-- Check if the payment actually updated the user's profile
-- (without the is_active field that was causing the error)

SELECT 
    id,
    email,
    full_name,
    is_approved,
    payment_status,
    registration_payment_status,
    registration_payment_transaction_id,
    created_at,
    updated_at
FROM profiles
WHERE id = '080a42db-c2ea-40b3-b91e-4b4e977f4e03';

-- Also check the payment transaction
SELECT 
    id,
    user_id,
    razorpay_order_id,
    razorpay_payment_id,
    amount,
    currency,
    status,
    related_entity_type,
    created_at
FROM payment_transactions
WHERE user_id = '080a42db-c2ea-40b3-b91e-4b4e977f4e03'
ORDER BY created_at DESC
LIMIT 1;

