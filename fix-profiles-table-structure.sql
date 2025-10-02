-- =====================================================
-- BGHS Alumni Website - Fix Profiles Table Structure
-- =====================================================
-- This script fixes the profiles table structure to match
-- the actual registration form requirements.
-- 
-- ISSUE: batch_year is NOT NULL but not used in registration
-- SOLUTION: Make batch_year nullable, ensure last_class and year_of_leaving are properly handled
-- =====================================================

-- Step 1: Make batch_year nullable (it's not used in registration form)
ALTER TABLE profiles ALTER COLUMN batch_year DROP NOT NULL;

-- Step 2: Ensure last_class and year_of_leaving have proper constraints
-- These fields are required in the registration form, so they should be NOT NULL

-- Make last_class NOT NULL (required in registration form: 1-12)
ALTER TABLE profiles ALTER COLUMN last_class SET NOT NULL;

-- Make year_of_leaving NOT NULL (required in registration form: 4-digit year)
ALTER TABLE profiles ALTER COLUMN year_of_leaving SET NOT NULL;

-- Step 3: Add check constraints to match registration form validation
-- last_class should be between 1 and 12
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS chk_last_class_range;
ALTER TABLE profiles ADD CONSTRAINT chk_last_class_range 
    CHECK (last_class >= 1 AND last_class <= 12);

-- year_of_leaving should be a valid 4-digit year (1950 to current year)
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS chk_year_of_leaving;
ALTER TABLE profiles ADD CONSTRAINT chk_year_of_leaving 
    CHECK (year_of_leaving >= 1950 AND year_of_leaving <= EXTRACT(YEAR FROM NOW()));

-- Step 4: Update any existing NULL values to default values
-- This is needed in case there are existing records with NULL values
UPDATE profiles 
SET last_class = 12 
WHERE last_class IS NULL;

UPDATE profiles 
SET year_of_leaving = EXTRACT(YEAR FROM NOW()) 
WHERE year_of_leaving IS NULL;

-- Step 4: Verify the table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND column_name IN ('batch_year', 'last_class', 'year_of_leaving', 'start_class', 'start_year')
ORDER BY column_name;

-- =====================================================
-- NOTES:
-- =====================================================
-- 1. batch_year is now nullable - not used in registration form
-- 2. last_class and year_of_leaving are the actual required fields
-- 3. start_class and start_year are optional fields
-- 4. The registration form sends:
--    - last_class: required (1-12)
--    - year_of_leaving: required (4-digit year)
--    - start_class: optional
--    - start_year: optional
--    - batch_year: not sent (can be derived from year_of_leaving if needed)
-- =====================================================
