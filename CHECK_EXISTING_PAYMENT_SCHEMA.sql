-- ========================================
-- CHECK EXISTING PAYMENT SCHEMA
-- Run this FIRST to see what you have
-- ========================================

-- Check which payment tables exist
SELECT 
    'TABLE EXISTS: ' || table_name as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('payment_configurations', 'payment_transactions', 'payment_receipts', 'payment_notification_queue', 'payment_tokens')
ORDER BY table_name;

-- Check payment_configurations structure (if exists)
SELECT 
    'payment_configurations column: ' || column_name || ' (' || data_type || ')' as status
FROM information_schema.columns 
WHERE table_name = 'payment_configurations' 
ORDER BY ordinal_position;

-- Check existing constraints on payment_configurations
SELECT 
    'CONSTRAINT: ' || constraint_name || ' - ' || check_clause as status
FROM information_schema.check_constraints 
WHERE constraint_schema = 'public' 
  AND constraint_name LIKE '%payment_config%';

-- Check profiles columns
SELECT 
    'profiles column: ' || column_name || ' (' || data_type || ')' as status
FROM information_schema.columns 
WHERE table_name = 'profiles' 
  AND column_name LIKE '%payment%'
ORDER BY ordinal_position;

-- Check existing data in payment_configurations (if exists)
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'payment_configurations') THEN
        RAISE NOTICE 'Checking payment_configurations data...';
        PERFORM * FROM payment_configurations LIMIT 1;
    END IF;
END $$;

SELECT 
    id,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payment_configurations' AND column_name = 'category')
        THEN 'OLD: category = ' || category::text
        WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payment_configurations' AND column_name = 'payment_category')
        THEN 'NEW: payment_category = ' || payment_category::text
        ELSE 'UNKNOWN STRUCTURE'
    END as category_info,
    name,
    amount,
    currency,
    is_active,
    is_mandatory
FROM payment_configurations
WHERE EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'payment_configurations');

