-- Add registration_id column to profiles table
-- This will create memorable registration IDs for alumni members

-- Step 1: Add the registration_id column
ALTER TABLE profiles 
ADD COLUMN registration_id VARCHAR(20) UNIQUE;

-- Step 2: Create a sequence for generating sequential numbers
CREATE SEQUENCE IF NOT EXISTS alumni_registration_seq
    START WITH 1
    INCREMENT BY 1
    MINVALUE 1
    MAXVALUE 999999
    CACHE 1;

-- Step 3: Create a function to generate registration ID
CREATE OR REPLACE FUNCTION generate_registration_id()
RETURNS TEXT AS $$
DECLARE
    current_year INTEGER;
    seq_num INTEGER;
    reg_id TEXT;
BEGIN
    -- Get current year
    current_year := EXTRACT(YEAR FROM NOW());
    
    -- Get next sequence number
    seq_num := nextval('alumni_registration_seq');
    
    -- Format: BGHS-YYYY-XXXX (4-digit sequence number)
    reg_id := 'BGHS-' || current_year || '-' || LPAD(seq_num::TEXT, 4, '0');
    
    RETURN reg_id;
END;
$$ LANGUAGE plpgsql;

-- Step 4: Create a trigger to auto-generate registration_id on insert
CREATE OR REPLACE FUNCTION set_registration_id()
RETURNS TRIGGER AS $$
BEGIN
    -- Only set if registration_id is not already provided
    IF NEW.registration_id IS NULL THEN
        NEW.registration_id := generate_registration_id();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger
DROP TRIGGER IF EXISTS trigger_set_registration_id ON profiles;
CREATE TRIGGER trigger_set_registration_id
    BEFORE INSERT ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION set_registration_id();

-- Step 5: Update existing profiles with registration IDs
-- This will generate IDs for existing users
UPDATE profiles 
SET registration_id = generate_registration_id()
WHERE registration_id IS NULL;

-- Step 6: Make registration_id NOT NULL after populating existing records
ALTER TABLE profiles 
ALTER COLUMN registration_id SET NOT NULL;

-- Step 7: Create an index for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_registration_id ON profiles(registration_id);

-- Step 8: Add a comment explaining the format
COMMENT ON COLUMN profiles.registration_id IS 'Memorable registration ID in format BGHS-YYYY-XXXX (e.g., BGHS-2024-0001)';


