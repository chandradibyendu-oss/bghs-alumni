-- Add old_registration_id column to profiles table for mapping old registration numbers
-- This is a simple reference field to map old registration IDs with new system registration IDs

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS old_registration_id TEXT;

-- Add an index for better performance on queries using old_registration_id
CREATE INDEX IF NOT EXISTS idx_profiles_old_registration_id ON profiles(old_registration_id);

-- Verify the column was added
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'profiles' AND column_name = 'old_registration_id';
