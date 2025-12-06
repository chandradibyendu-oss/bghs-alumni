-- Update Year of Leaving validation constraint to allow historical years (1900+)
-- This fixes the constraint error and lowers minimum year from 1950 to 1900

-- Step 1: Drop the existing constraint
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS chk_year_of_leaving;

-- Step 2: Add the updated constraint with lower minimum year (1900)
ALTER TABLE profiles ADD CONSTRAINT chk_year_of_leaving 
    CHECK (year_of_leaving >= 1900 AND year_of_leaving <= EXTRACT(YEAR FROM NOW()));

-- Step 3: Also update start_year constraint if it exists
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS chk_start_year;

ALTER TABLE profiles ADD CONSTRAINT chk_start_year 
    CHECK (start_year IS NULL OR (start_year >= 1900 AND start_year <= EXTRACT(YEAR FROM NOW())));

-- Step 4: Verify the constraints were updated
SELECT 
    conname AS constraint_name,
    pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'profiles'::regclass
    AND conname IN ('chk_year_of_leaving', 'chk_start_year');

-- Note: This allows historical alumni records from 1900 onwards
-- API validation has also been updated to match (1900 minimum)


