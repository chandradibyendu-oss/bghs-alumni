-- Remove Unused Bengali Columns from Blog Posts
-- Run this in your Supabase SQL Editor
-- 
-- NOTE: If you get an error saying the columns don't exist, that's fine!
-- It means the columns were never created, so there's nothing to remove.
-- This script is safe to run - it will only drop columns if they exist.

-- Remove Bengali columns that are no longer used
ALTER TABLE blog_posts 
DROP COLUMN IF EXISTS title_bengali;

ALTER TABLE blog_posts 
DROP COLUMN IF EXISTS excerpt_bengali;

ALTER TABLE blog_posts 
DROP COLUMN IF EXISTS content_bengali;

-- Note: If you see "column does not exist" errors, that's perfectly fine.
-- It just means these columns were never created in your database.
-- The blog_posts table now uses a single field approach where
-- title, excerpt, and content can contain any language (English, Bengali, or mixed)
