-- Fix professional_title_id column issue
-- Run this in your Supabase SQL Editor

-- 1. Check if the column exists
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND column_name = 'professional_title_id';

-- 2. If the column doesn't exist, add it
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS professional_title_id INTEGER REFERENCES professional_titles(id);

-- 3. Check again after adding
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND column_name = 'professional_title_id';

-- 4. Update Dibyendu's profile with professional title ID 67 (CTO)
UPDATE profiles 
SET professional_title_id = 67 
WHERE full_name = 'Dibyendu Chandra' AND email = 'chandra.dibyendu@gmail.com';

-- 5. Verify the update
SELECT 
    id,
    full_name,
    email,
    professional_title_id,
    profession
FROM profiles 
WHERE full_name = 'Dibyendu Chandra';
