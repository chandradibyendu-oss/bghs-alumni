-- ========================================
-- CHECK EXISTING PAYMENT SCHEMA (SAFE VERSION)
-- Run this FIRST to see what you have
-- This version won't fail if columns don't exist
-- ========================================

-- Check which payment tables exist
SELECT 
    'TABLE EXISTS: ' || table_name as info
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('payment_configurations', 'payment_transactions', 'payment_receipts', 'payment_notification_queue', 'payment_tokens')
ORDER BY table_name;

-- Check ALL columns in payment_configurations (if table exists)
SELECT 
    'payment_configurations.' || column_name || ' (' || data_type || ')' as info
FROM information_schema.columns 
WHERE table_name = 'payment_configurations' 
ORDER BY ordinal_position;

-- Check existing constraints on payment_configurations
SELECT 
    'CONSTRAINT: ' || constraint_name as info
FROM information_schema.table_constraints 
WHERE table_schema = 'public' 
  AND table_name = 'payment_configurations'
  AND constraint_type = 'CHECK';

-- Check profiles payment columns
SELECT 
    'profiles.' || column_name || ' (' || data_type || ')' as info
FROM information_schema.columns 
WHERE table_name = 'profiles' 
  AND column_name LIKE '%payment%'
ORDER BY ordinal_position;

-- Count rows in payment_configurations (if exists)
DO $$
DECLARE
    row_count INTEGER;
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'payment_configurations') THEN
        SELECT COUNT(*) INTO row_count FROM payment_configurations;
        RAISE NOTICE 'payment_configurations has % rows', row_count;
    ELSE
        RAISE NOTICE 'payment_configurations table does not exist';
    END IF;
END $$;

