-- Update Professional Titles Schema to Use title_prefix
-- This script updates the existing professional_titles table to use title_prefix instead of title

-- Step 1: Add title_prefix column if it doesn't exist
ALTER TABLE professional_titles 
ADD COLUMN IF NOT EXISTS title_prefix VARCHAR(20);

-- Step 2: Update existing records to populate title_prefix from title
UPDATE professional_titles 
SET title_prefix = title 
WHERE title_prefix IS NULL;

-- Step 3: Clear existing data and insert new titles with proper prefixes
DELETE FROM professional_titles;

-- Insert new titles with proper prefixes
INSERT INTO professional_titles (title_prefix, category, is_active, display_order) VALUES
('Dr.', 'Academic/Medical', true, 1),
('Prof.', 'Academic', true, 2),
('Adv.', 'Legal', true, 3),
('Er.', 'Professional', true, 4),
('Shri', 'Indian Formal', true, 5),
('Smt.', 'Indian Formal', true, 6),
('Mr.', 'General', true, 7),
('Ms.', 'General', true, 8),
('Capt.', 'Military', true, 9),
('Rev.', 'Religious', true, 10);

-- Step 4: Update the title column to match title_prefix for backward compatibility
UPDATE professional_titles 
SET title = title_prefix;

-- Step 5: Add unique constraint on title_prefix if it doesn't exist
ALTER TABLE professional_titles 
ADD CONSTRAINT IF NOT EXISTS professional_titles_title_prefix_key UNIQUE (title_prefix);

-- Step 6: Verify the data
SELECT id, title_prefix, category, is_active FROM professional_titles ORDER BY display_order;
