-- Safe Update Professional Titles Schema
-- This version preserves existing user data and adds new titles

-- Step 1: Add title_prefix column if it doesn't exist
ALTER TABLE professional_titles 
ADD COLUMN IF NOT EXISTS title_prefix VARCHAR(20);

-- Step 2: Update existing records to populate title_prefix from title
UPDATE professional_titles 
SET title_prefix = title 
WHERE title_prefix IS NULL;

-- Step 3: Add new titles only if they don't exist
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
('Rev.', 'Religious', true, 10)
ON CONFLICT (title) DO UPDATE SET
    title_prefix = EXCLUDED.title_prefix,
    category = EXCLUDED.category,
    is_active = EXCLUDED.is_active,
    display_order = EXCLUDED.display_order;

-- Step 4: Update the title column to match title_prefix for backward compatibility
UPDATE professional_titles 
SET title = title_prefix
WHERE title_prefix IS NOT NULL;

-- Step 5: Add unique constraint on title_prefix if it doesn't exist
-- Note: IF NOT EXISTS for constraints is not supported in all PostgreSQL versions
-- If this fails, the constraint may already exist, which is fine
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'professional_titles_title_prefix_key' 
        AND table_name = 'professional_titles'
    ) THEN
        ALTER TABLE professional_titles 
        ADD CONSTRAINT professional_titles_title_prefix_key UNIQUE (title_prefix);
    END IF;
END $$;

-- Step 6: Verify the data
SELECT id, title_prefix, category, is_active, display_order FROM professional_titles ORDER BY display_order;
