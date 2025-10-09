-- Reset Test Payments for Testing
-- This script allows you to revert payment status for specific users to test the payment flow again
-- WARNING: Only use this in development/testing environments!

-- Option 1: Reset a specific user's payment status
-- Replace 'USER_ID_HERE' with the actual user ID
UPDATE profiles
SET 
    payment_status = 'pending',
    registration_payment_status = 'pending',
    registration_payment_transaction_id = NULL,
    updated_at = NOW()
WHERE id = 'USER_ID_HERE';

-- Option 2: Reset ALL test users (be careful!)
-- Uncomment the following to reset all users:
/*
UPDATE profiles
SET 
    payment_status = 'pending',
    registration_payment_status = 'pending',
    registration_payment_transaction_id = NULL,
    updated_at = NOW()
WHERE email LIKE '%test%' OR email LIKE '%example%';
*/

-- Option 3: Delete payment transactions for a specific user
-- This removes the transaction records entirely
-- Replace 'USER_ID_HERE' with the user ID whose transactions you want to delete
DELETE FROM payment_transactions
WHERE related_entity_id = 'USER_ID_HERE'
AND payment_status IN ('success', 'initiated', 'pending', 'failed');

-- Option 3b: Delete payment notification queue for a specific user
-- This removes their pending payment email notifications
-- Replace 'USER_ID_HERE' with the user ID
DELETE FROM payment_notification_queue
WHERE recipient_user_id = 'USER_ID_HERE'
AND notification_type = 'payment_link';

-- Option 4: Delete ALL test payment transactions (be very careful!)
-- Uncomment to delete all test transactions:
/*
DELETE FROM payment_transactions
WHERE metadata->>'user_email' LIKE '%test%' 
   OR metadata->>'user_email' LIKE '%example%';
*/

-- Option 5: Clear payment notification queue for testing
-- This removes queued payment emails
DELETE FROM payment_notification_queue
WHERE status = 'pending'
AND notification_type = 'payment_link';

-- Option 6: Delete used payment tokens to allow re-testing
-- This allows you to reuse payment links (for testing only!)
DELETE FROM payment_tokens
WHERE used = true;

-- Verify the reset (replace USER_ID_HERE with actual ID)
SELECT 
    id,
    email,
    full_name,
    is_approved,
    payment_status,
    registration_payment_status
FROM profiles
WHERE id = 'USER_ID_HERE';

