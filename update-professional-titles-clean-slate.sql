-- Clean Slate Update Name Prefixes
-- This version clears existing prefixes and inserts new ones

-- Step 1: Clear existing user professional title references (test data)
UPDATE profiles SET professional_title_id = NULL;

-- Step 2: Clear existing professional titles table
DELETE FROM professional_titles;

-- Step 3: Insert new name prefixes
INSERT INTO professional_titles (title, title_prefix, category, is_active, display_order) VALUES
('Dr.', 'Dr.', 'Medical/Academic', true, 1),
('Prof.', 'Prof.', 'Academic', true, 2),
('Adv.', 'Adv.', 'Legal', true, 3),
('Er.', 'Er.', 'Professional', true, 4),
('Shri', 'Shri', 'Indian Formal', true, 5),
('Smt.', 'Smt.', 'Indian Formal', true, 6),
('Mr.', 'Mr.', 'General', true, 7),
('Ms.', 'Ms.', 'General', true, 8),
('Capt.', 'Capt.', 'Military', true, 9),
('Rev.', 'Rev.', 'Religious', true, 10);

-- Step 4: Verify the data
SELECT id, title, title_prefix, category, is_active, display_order 
FROM professional_titles 
ORDER BY display_order;
