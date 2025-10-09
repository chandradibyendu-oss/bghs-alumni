-- Manually fix the user's profile after successful payment
-- The payment was completed but the profile update failed due to the is_active column error

-- First, get the transaction ID from the payment_transactions table
SELECT 
    id as transaction_id,
    razorpay_payment_id,
    amount,
    status
FROM payment_transactions
WHERE user_id = '080a42db-c2ea-40b3-b91e-4b4e977f4e03'
ORDER BY created_at DESC
LIMIT 1;

-- After confirming the transaction exists and is successful, update the profile
-- Replace 'TRANSACTION_ID_HERE' with the actual transaction ID from above
UPDATE profiles
SET 
    payment_status = 'completed',
    registration_payment_status = 'paid',
    registration_payment_transaction_id = 'TRANSACTION_ID_HERE',  -- Replace with actual ID
    updated_at = NOW()
WHERE id = '080a42db-c2ea-40b3-b91e-4b4e977f4e03';

-- Verify the update
SELECT 
    id,
    email,
    full_name,
    is_approved,
    payment_status,
    registration_payment_status,
    registration_payment_transaction_id
FROM profiles
WHERE id = '080a42db-c2ea-40b3-b91e-4b4e977f4e03';

