-- Update Professional Titles - Selective Approach
-- This version allows you to choose which titles to keep and which to add

-- Step 1: Add title_prefix column if it doesn't exist
ALTER TABLE professional_titles 
ADD COLUMN IF NOT EXISTS title_prefix VARCHAR(20);

-- Step 2: Update existing records to populate title_prefix from title
UPDATE professional_titles 
SET title_prefix = title 
WHERE title_prefix IS NULL;

-- Step 3: Add only the most essential titles (you can modify this list)
INSERT INTO professional_titles (title, title_prefix, category, is_active, display_order) VALUES
('Dr.', 'Dr.', 'Medical/Academic', true, 1),
('Prof.', 'Prof.', 'Academic', true, 2),
('Adv.', 'Adv.', 'Legal', true, 3),
('Shri', 'Shri', 'Indian Formal', true, 4),
('Smt.', 'Smt.', 'Indian Formal', true, 5),
('Mr.', 'Mr.', 'General', true, 6),
('Ms.', 'Ms.', 'General', true, 7)
ON CONFLICT (title) DO UPDATE SET
    title_prefix = EXCLUDED.title_prefix,
    category = EXCLUDED.category,
    is_active = EXCLUDED.is_active,
    display_order = EXCLUDED.display_order;

-- Step 4: Optionally deactivate titles that are not appropriate
-- Uncomment the lines below to deactivate specific titles
-- UPDATE professional_titles SET is_active = false WHERE title IN ('CTO', 'CEO', 'VP');

-- Step 5: Update existing titles to have proper prefixes if they don't already
UPDATE professional_titles 
SET title_prefix = title 
WHERE title_prefix IS NULL;

-- Step 6: Verify the data
SELECT id, title, title_prefix, category, is_active, display_order 
FROM professional_titles 
ORDER BY display_order;
