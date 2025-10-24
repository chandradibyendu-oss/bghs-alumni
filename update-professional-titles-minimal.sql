-- Minimal Update Professional Titles Schema
-- This version just adds the title_prefix column and updates existing data

-- Step 1: Add title_prefix column if it doesn't exist
ALTER TABLE professional_titles 
ADD COLUMN IF NOT EXISTS title_prefix VARCHAR(20);

-- Step 2: Update existing records to populate title_prefix from title
UPDATE professional_titles 
SET title_prefix = title 
WHERE title_prefix IS NULL;

-- Step 3: Add new titles only if they don't exist (preserve existing user selections)
INSERT INTO professional_titles (title, title_prefix, category, is_active, display_order) VALUES
('Dr.', 'Dr.', 'Academic/Medical', true, 1),
('Prof.', 'Prof.', 'Academic', true, 2),
('Adv.', 'Adv.', 'Legal', true, 3),
('Er.', 'Er.', 'Professional', true, 4),
('Shri', 'Shri', 'Indian Formal', true, 5),
('Smt.', 'Smt.', 'Indian Formal', true, 6),
('Mr.', 'Mr.', 'General', true, 7),
('Ms.', 'Ms.', 'General', true, 8),
('Capt.', 'Capt.', 'Military', true, 9),
('Rev.', 'Rev.', 'Religious', true, 10)
ON CONFLICT (title) DO NOTHING;

-- Step 4: Verify the data
SELECT id, title, title_prefix, category, is_active, display_order 
FROM professional_titles 
ORDER BY display_order;
