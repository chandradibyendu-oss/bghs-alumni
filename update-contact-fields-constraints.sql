-- Migration: Update contact fields to support either email OR phone
-- This allows users to register with either email or phone (or both)
-- while ensuring at least one contact method is always provided

-- Step 1: Make email field nullable
ALTER TABLE profiles 
ALTER COLUMN email DROP NOT NULL;

-- Step 2: Ensure phone field is also nullable (it should already be)
-- This is just for documentation - phone should already be nullable
-- ALTER TABLE profiles ALTER COLUMN phone DROP NOT NULL;

-- Step 3: Add constraint to ensure at least one contact method is provided
-- This prevents users from having both email and phone as NULL
DO $$ 
BEGIN
    -- Drop existing constraint if it exists
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'check_email_or_phone' 
        AND table_name = 'profiles'
    ) THEN
        ALTER TABLE profiles DROP CONSTRAINT check_email_or_phone;
    END IF;
    
    -- Add the new constraint
    ALTER TABLE profiles 
    ADD CONSTRAINT check_email_or_phone 
    CHECK (email IS NOT NULL OR phone IS NOT NULL);
    
EXCEPTION 
    WHEN duplicate_object THEN 
        -- Constraint already exists, skip
        NULL;
END $$;

-- Step 4: Add helpful comments
COMMENT ON COLUMN profiles.email IS 'User email address - can be NULL if phone is provided';
COMMENT ON COLUMN profiles.phone IS 'User phone number with country code - can be NULL if email is provided';
COMMENT ON CONSTRAINT check_email_or_phone ON profiles IS 'Ensures at least one contact method (email or phone) is provided';

-- Step 5: Verify the changes
-- This query should return all profiles and show their contact methods
SELECT 
    id,
    full_name,
    email,
    phone,
    CASE 
        WHEN email IS NOT NULL AND phone IS NOT NULL THEN 'Both'
        WHEN email IS NOT NULL THEN 'Email only'
        WHEN phone IS NOT NULL THEN 'Phone only'
        ELSE 'ERROR: No contact method'
    END as contact_method
FROM profiles 
ORDER BY created_at DESC
LIMIT 10;

-- Step 6: Show constraint information
SELECT 
    constraint_name,
    constraint_type,
    check_clause
FROM information_schema.check_constraints 
WHERE table_name = 'profiles' 
AND constraint_name = 'check_email_or_phone';
