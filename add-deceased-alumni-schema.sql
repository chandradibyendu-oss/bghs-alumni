-- Add deceased alumni management fields to profiles table
-- This script adds fields to track deceased alumni status

-- Add deceased status fields
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_deceased BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS deceased_year INTEGER;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS deceased_updated_by UUID REFERENCES auth.users(id);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS deceased_updated_at TIMESTAMP DEFAULT NOW();

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_profiles_is_deceased ON profiles(is_deceased);
CREATE INDEX IF NOT EXISTS idx_profiles_deceased_year ON profiles(deceased_year) WHERE deceased_year IS NOT NULL;

-- Add comments for documentation
COMMENT ON COLUMN profiles.is_deceased IS 'Indicates if the alumni member is deceased';
COMMENT ON COLUMN profiles.deceased_year IS 'Year when the alumni member passed away (optional)';
COMMENT ON COLUMN profiles.deceased_updated_by IS 'User ID who marked the member as deceased';
COMMENT ON COLUMN profiles.deceased_updated_at IS 'Timestamp when deceased status was last updated';

-- Verify the changes
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND column_name IN ('is_deceased', 'deceased_year', 'deceased_updated_by', 'deceased_updated_at')
ORDER BY column_name;
