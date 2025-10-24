-- Verify that professional_title_id column exists and has data
-- Run this in your Supabase SQL Editor

-- 1. Check if the column exists
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND column_name = 'professional_title_id';

-- 2. Check if any profiles have professional_title_id values
SELECT 
    COUNT(*) as total_profiles,
    COUNT(professional_title_id) as profiles_with_title_id,
    COUNT(CASE WHEN professional_title_id IS NOT NULL THEN 1 END) as profiles_with_non_null_title_id
FROM profiles 
WHERE is_approved = true;

-- 3. Check specific profiles with professional_title_id
SELECT 
    id,
    full_name,
    professional_title_id,
    profession
FROM profiles 
WHERE professional_title_id IS NOT NULL
ORDER BY created_at DESC;

-- 4. Check if there are any professional titles in the titles table
SELECT COUNT(*) as total_titles FROM professional_titles;

-- 5. Check if there are any matches between profiles and titles
SELECT 
    p.id,
    p.full_name,
    p.professional_title_id,
    pt.title,
    pt.category
FROM profiles p
LEFT JOIN professional_titles pt ON p.professional_title_id = pt.id
WHERE p.professional_title_id IS NOT NULL;
