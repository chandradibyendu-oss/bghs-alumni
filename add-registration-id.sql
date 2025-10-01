-- Add registration_id column to profiles table
-- This will create memorable registration IDs for alumni members
-- Format: BGHSA-YYYY-XXXXX (e.g., BGHSA-2024-00001)
-- BGHSA = BGHS Alumni (configurable prefix)
-- YYYY = Registration year
-- XXXXX = 5-digit global sequence number (max 99,999)

-- Step 1: Add the registration_id column
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS registration_id VARCHAR(25) UNIQUE;

-- Step 2: Add tracking fields for legacy imports
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS import_source TEXT DEFAULT 'online_registration';

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS imported_at TIMESTAMP WITH TIME ZONE;

-- Step 3: Create a sequence for generating sequential numbers
CREATE SEQUENCE IF NOT EXISTS alumni_registration_seq
    START WITH 1
    INCREMENT BY 1
    MINVALUE 1
    MAXVALUE 99999  -- 5-digit sequence allows up to 99,999 registrations
    CACHE 1;

-- Step 4: Create a function to generate registration ID
-- Note: Prefix defaults to 'BGHSA' but can be configured via application
CREATE OR REPLACE FUNCTION generate_registration_id(prefix TEXT DEFAULT 'BGHSA')
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
    
    -- Format: PREFIX-YYYY-XXXXX (5-digit sequence number)
    -- Example: BGHSA-2024-00001
    reg_id := prefix || '-' || current_year || '-' || LPAD(seq_num::TEXT, 5, '0');
    
    RETURN reg_id;
END;
$$ LANGUAGE plpgsql;

-- Step 5: Create a trigger to auto-generate registration_id on APPROVAL or ADMIN CREATION
-- This ensures IDs are assigned when:
-- 1. Admin approves a self-registered user (is_approved changes to TRUE)
-- 2. Admin creates a new user (import_source = 'admin_created')
CREATE OR REPLACE FUNCTION set_registration_id_on_approval()
RETURNS TRIGGER AS $$
BEGIN
    -- Generate ID when:
    -- 1. User is being approved (is_approved changes to TRUE)
    -- 2. OR user is created by admin (import_source = 'admin_created')
    IF (NEW.is_approved = TRUE AND (OLD.is_approved IS NULL OR OLD.is_approved = FALSE)) 
       OR (NEW.import_source = 'admin_created' AND NEW.registration_id IS NULL) THEN
        -- Only set if registration_id is not already provided
        IF NEW.registration_id IS NULL THEN
            -- Use default prefix 'BGHSA'
            NEW.registration_id := generate_registration_id('BGHSA');
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop old INSERT trigger if it exists
DROP TRIGGER IF EXISTS trigger_set_registration_id ON profiles;

-- Create triggers that fire on both INSERT and UPDATE
DROP TRIGGER IF EXISTS trigger_set_registration_id_on_approval ON profiles;
CREATE TRIGGER trigger_set_registration_id_on_approval
    BEFORE INSERT OR UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION set_registration_id_on_approval();

-- Step 6: Update existing APPROVED profiles with registration IDs
-- This will generate IDs ONLY for already approved users
-- Pending/unapproved users will get IDs when admin approves them
UPDATE profiles 
SET registration_id = generate_registration_id('BGHSA'),
    import_source = 'existing_data'
WHERE registration_id IS NULL 
  AND is_approved = TRUE;

-- Step 7: Keep registration_id as NULLABLE
-- Because pending users won't have IDs until approved
-- Only approved users will have registration_id
-- Note: We do NOT make this NOT NULL

-- Step 8: Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_registration_id ON profiles(registration_id);
CREATE INDEX IF NOT EXISTS idx_profiles_import_source ON profiles(import_source);

-- Step 9: Add comments explaining the fields
COMMENT ON COLUMN profiles.registration_id IS 'Alumni registration ID in format BGHSA-YYYY-XXXXX (e.g., BGHSA-2024-00001). BGHSA=BGHS Alumni, YYYY=registration year, XXXXX=sequence number';
COMMENT ON COLUMN profiles.import_source IS 'Source of the profile record: online_registration, legacy_import, admin_created, existing_data';
COMMENT ON COLUMN profiles.imported_at IS 'Timestamp when the profile was imported (for legacy/bulk imports)';





