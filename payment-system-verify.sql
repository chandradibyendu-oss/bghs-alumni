-- ========================================
-- BGHS Alumni Payment System - VERIFICATION SCRIPT
-- ========================================
-- This script verifies the payment system schema installation
-- Run this in Supabase SQL Editor after installing the schema

-- ========================================
-- CHECK TABLES
-- ========================================

SELECT 
    'TABLES CHECK' as check_type,
    CASE 
        WHEN COUNT(*) = 4 THEN '✓ All payment tables exist'
        ELSE '✗ Missing payment tables: ' || (4 - COUNT(*))::TEXT
    END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
    'payment_configurations',
    'payment_transactions', 
    'payment_receipts',
    'payment_notification_queue'
);

-- ========================================
-- CHECK COLUMNS ADDED TO EXISTING TABLES
-- ========================================

-- Check events table
SELECT 
    'EVENTS COLUMNS' as check_type,
    CASE 
        WHEN COUNT(*) = 6 THEN '✓ All payment columns added to events'
        ELSE '✗ Missing columns in events table'
    END as status
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'events'
AND column_name IN (
    'requires_payment',
    'payment_config_id',
    'payment_amount',
    'payment_deadline',
    'early_bird_amount',
    'early_bird_deadline'
);

-- Check event_registrations table
SELECT 
    'EVENT_REGISTRATIONS COLUMNS' as check_type,
    CASE 
        WHEN COUNT(*) = 4 THEN '✓ All payment columns added to event_registrations'
        ELSE '✗ Missing columns in event_registrations table'
    END as status
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'event_registrations'
AND column_name IN (
    'payment_status',
    'payment_transaction_id',
    'payment_amount',
    'registration_confirmed'
);

-- Check profiles table
SELECT 
    'PROFILES COLUMNS' as check_type,
    CASE 
        WHEN COUNT(*) = 2 THEN '✓ All payment columns added to profiles'
        ELSE '✗ Missing columns in profiles table'
    END as status
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'profiles'
AND column_name IN (
    'registration_payment_status',
    'registration_payment_transaction_id'
);

-- Check donations table
SELECT 
    'DONATIONS COLUMNS' as check_type,
    CASE 
        WHEN COUNT(*) >= 1 THEN '✓ Payment column added to donations'
        ELSE '✗ Missing columns in donations table'
    END as status
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'donations'
AND column_name = 'payment_transaction_id';

-- ========================================
-- CHECK INDEXES
-- ========================================

SELECT 
    'INDEXES' as check_type,
    COUNT(*)::TEXT || ' payment-related indexes created' as status
FROM pg_indexes 
WHERE schemaname = 'public'
AND indexname LIKE 'idx_%payment%';

-- ========================================
-- CHECK FUNCTIONS
-- ========================================

SELECT 
    'FUNCTIONS' as check_type,
    CASE 
        WHEN COUNT(*) >= 4 THEN '✓ All payment functions created'
        ELSE '✗ Missing payment functions'
    END as status
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
AND p.proname IN (
    'generate_receipt_number',
    'get_payment_statistics',
    'user_has_pending_payments',
    'get_user_payment_summary',
    'update_payment_updated_at'
);

-- ========================================
-- CHECK RLS POLICIES
-- ========================================

SELECT 
    'RLS POLICIES' as check_type,
    COUNT(*)::TEXT || ' RLS policies created for payment tables' as status
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN (
    'payment_configurations',
    'payment_transactions',
    'payment_receipts',
    'payment_notification_queue'
);

-- ========================================
-- CHECK TRIGGERS
-- ========================================

SELECT 
    'TRIGGERS' as check_type,
    CASE 
        WHEN COUNT(*) >= 3 THEN '✓ All payment triggers created'
        ELSE '✗ Missing payment triggers'
    END as status
FROM information_schema.triggers
WHERE event_object_schema = 'public'
AND trigger_name LIKE '%payment%';

-- ========================================
-- DETAILED TABLE INFO
-- ========================================

-- Show all columns in payment_configurations
SELECT 
    'payment_configurations' as table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'payment_configurations'
ORDER BY ordinal_position;

-- Show all columns in payment_transactions
SELECT 
    'payment_transactions' as table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'payment_transactions'
ORDER BY ordinal_position;

-- ========================================
-- TEST HELPER FUNCTIONS
-- ========================================

-- Test generate_receipt_number function
SELECT 'RECEIPT NUMBER TEST' as test_type, generate_receipt_number() as sample_receipt_number;

-- Test get_payment_statistics function (will return zeros if no data)
SELECT 'STATISTICS TEST' as test_type, * FROM get_payment_statistics();

-- ========================================
-- SUMMARY
-- ========================================

DO $$
DECLARE
    table_count INTEGER;
    function_count INTEGER;
    policy_count INTEGER;
BEGIN
    -- Count tables
    SELECT COUNT(*) INTO table_count
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name IN (
        'payment_configurations',
        'payment_transactions', 
        'payment_receipts',
        'payment_notification_queue'
    );
    
    -- Count functions
    SELECT COUNT(*) INTO function_count
    FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public'
    AND p.proname IN (
        'generate_receipt_number',
        'get_payment_statistics',
        'user_has_pending_payments',
        'get_user_payment_summary',
        'update_payment_updated_at'
    );
    
    -- Count policies
    SELECT COUNT(*) INTO policy_count
    FROM pg_policies
    WHERE schemaname = 'public'
    AND tablename IN (
        'payment_configurations',
        'payment_transactions',
        'payment_receipts',
        'payment_notification_queue'
    );
    
    RAISE NOTICE '========================================';
    RAISE NOTICE 'PAYMENT SYSTEM VERIFICATION SUMMARY';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Tables created: % / 4', table_count;
    RAISE NOTICE 'Functions created: % / 5', function_count;
    RAISE NOTICE 'RLS Policies created: %', policy_count;
    RAISE NOTICE '========================================';
    
    IF table_count = 4 AND function_count >= 4 THEN
        RAISE NOTICE '✓ Payment system schema successfully installed!';
    ELSE
        RAISE NOTICE '✗ Payment system schema installation incomplete!';
        RAISE NOTICE 'Please review the script output above for details.';
    END IF;
END $$;
