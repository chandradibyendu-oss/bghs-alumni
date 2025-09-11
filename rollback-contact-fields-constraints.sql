-- Rollback script for contact fields constraints
-- This reverts the changes made in update-contact-fields-constraints.sql

-- Step 1: Remove the check constraint
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'check_email_or_phone' 
        AND table_name = 'profiles'
    ) THEN
        ALTER TABLE profiles DROP CONSTRAINT check_email_or_phone;
        RAISE NOTICE 'Dropped check_email_or_phone constraint';
    ELSE
        RAISE NOTICE 'check_email_or_phone constraint does not exist';
    END IF;
END $$;

-- Step 2: Make email NOT NULL again (this will fail if any profiles have NULL email)
-- WARNING: This will fail if any profiles have NULL email values
-- You may need to update those records first

-- First, let's check if there are any NULL email values
SELECT COUNT(*) as profiles_with_null_email
FROM profiles 
WHERE email IS NULL;

-- If the above query returns 0, then you can safely run:
-- ALTER TABLE profiles ALTER COLUMN email SET NOT NULL;

-- Step 3: Remove comments
COMMENT ON COLUMN profiles.email IS NULL;
COMMENT ON COLUMN profiles.phone IS NULL;

-- Step 4: Verify rollback
SELECT 
    column_name,
    is_nullable,
    data_type
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND column_name IN ('email', 'phone')
ORDER BY column_name;
