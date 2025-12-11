-- =====================================================
-- Update RLS Policy to Allow Future Start Dates
-- =====================================================
-- This updates the RLS policy to show notices with future start dates
-- (scheduled notices) so they appear before they actually start
-- =====================================================

-- Drop the old policy
DROP POLICY IF EXISTS "Anyone can view active notices" ON notices;

-- Create the updated policy that allows future start dates
CREATE POLICY "Anyone can view active notices" ON notices
    FOR SELECT USING (
        is_active = true 
        AND (end_date IS NULL OR end_date >= NOW())
    );

-- Success message
SELECT 'RLS policy updated successfully! Notices with future start dates will now be visible.' as message;


