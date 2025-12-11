-- Add visibility field to notices table
-- This allows notices to be either:
-- - Public (visible to everyone, including non-registered users)
-- - Members Only (visible only to registered/authenticated users)

-- Add the visibility column
ALTER TABLE notices 
ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT true;

-- Update existing notices to be public by default (backward compatibility)
UPDATE notices 
SET is_public = true 
WHERE is_public IS NULL;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_notices_is_public ON notices(is_public);

-- Update RLS Policies

-- Drop the old "Anyone can view active notices" policy
DROP POLICY IF EXISTS "Anyone can view active notices" ON notices;

-- Policy 1: Public notices - anyone can view (including non-authenticated users)
CREATE POLICY "Public can view public notices" ON notices
    FOR SELECT USING (
        is_active = true 
        AND is_public = true
        AND (end_date IS NULL OR end_date >= NOW())
    );

-- Policy 2: Authenticated users can view all active notices (public + members-only)
CREATE POLICY "Authenticated users can view all active notices" ON notices
    FOR SELECT USING (
        is_active = true 
        AND (end_date IS NULL OR end_date >= NOW())
        AND EXISTS (
            SELECT 1 FROM profiles p 
            WHERE p.id = auth.uid() 
            AND p.id IS NOT NULL
        )
    );

-- Policy 3: Authenticated users can view all notices (including expired) for history
-- (Keep existing policy - no change needed)
-- This policy already exists and allows authenticated users to see all notices

-- Success message
SELECT 'Notice visibility field added successfully!' as message;


