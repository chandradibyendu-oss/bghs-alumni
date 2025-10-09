-- Verify payment_tokens table structure
-- Run this in Supabase SQL Editor to confirm the table exists with all columns

-- Check if table exists and show all columns
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'payment_tokens'
ORDER BY ordinal_position;

-- Also check if the table has any rows
SELECT COUNT(*) as row_count FROM payment_tokens;

-- Show RLS policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'payment_tokens';

