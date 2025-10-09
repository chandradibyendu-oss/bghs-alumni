-- ========================================
-- BGHS Alumni Payment System - ROLLBACK SCRIPT
-- ========================================
-- This script removes all payment system tables and modifications
-- ⚠️ WARNING: This will delete all payment data permanently!
-- Only run this if you need to completely remove the payment system
-- Run this in Supabase SQL Editor

-- ========================================
-- STEP 1: DROP TRIGGERS
-- ========================================

DROP TRIGGER IF EXISTS update_payment_configurations_timestamp ON payment_configurations;
DROP TRIGGER IF EXISTS update_payment_transactions_timestamp ON payment_transactions;
DROP TRIGGER IF EXISTS update_payment_notification_queue_timestamp ON payment_notification_queue;

-- ========================================
-- STEP 2: DROP FUNCTIONS
-- ========================================

DROP FUNCTION IF EXISTS update_payment_updated_at() CASCADE;
DROP FUNCTION IF EXISTS generate_receipt_number() CASCADE;
DROP FUNCTION IF EXISTS get_payment_statistics(TIMESTAMP, TIMESTAMP) CASCADE;
DROP FUNCTION IF EXISTS user_has_pending_payments(UUID) CASCADE;
DROP FUNCTION IF EXISTS get_user_payment_summary(UUID) CASCADE;

-- ========================================
-- STEP 3: REMOVE COLUMNS FROM EXISTING TABLES
-- ========================================

-- Remove columns from events table
ALTER TABLE events 
    DROP COLUMN IF EXISTS requires_payment,
    DROP COLUMN IF EXISTS payment_config_id,
    DROP COLUMN IF EXISTS payment_amount,
    DROP COLUMN IF EXISTS payment_deadline,
    DROP COLUMN IF EXISTS early_bird_amount,
    DROP COLUMN IF EXISTS early_bird_deadline;

-- Remove columns from event_registrations table
ALTER TABLE event_registrations
    DROP COLUMN IF EXISTS payment_status,
    DROP COLUMN IF EXISTS payment_transaction_id,
    DROP COLUMN IF EXISTS payment_amount,
    DROP COLUMN IF EXISTS registration_confirmed;

-- Remove columns from profiles table
ALTER TABLE profiles
    DROP COLUMN IF EXISTS registration_payment_status,
    DROP COLUMN IF EXISTS registration_payment_transaction_id;

-- Remove columns from donations table
ALTER TABLE donations
    DROP COLUMN IF EXISTS payment_transaction_id;

-- Restore original donations payment_status constraint
ALTER TABLE donations DROP CONSTRAINT IF EXISTS donations_payment_status_check;
ALTER TABLE donations ADD CONSTRAINT donations_payment_status_check 
    CHECK (payment_status IN ('pending', 'completed', 'failed', 'cancelled'));

-- ========================================
-- STEP 4: DROP PAYMENT TABLES (in reverse dependency order)
-- ========================================

DROP TABLE IF EXISTS payment_notification_queue CASCADE;
DROP TABLE IF EXISTS payment_receipts CASCADE;
DROP TABLE IF EXISTS payment_transactions CASCADE;
DROP TABLE IF EXISTS payment_configurations CASCADE;

-- ========================================
-- VERIFICATION
-- ========================================

DO $$
BEGIN
    RAISE NOTICE 'Payment system rollback complete!';
    RAISE NOTICE 'All payment tables and functions have been removed.';
END $$;
