-- Temporary fix for gallery_photos RLS policy
-- This allows any authenticated user to insert photos for testing

-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "Content creators can insert photos" ON gallery_photos;

-- Create a more permissive policy for testing
CREATE POLICY "Authenticated users can insert photos" ON gallery_photos
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Also allow viewing all photos (not just approved ones) for testing
DROP POLICY IF EXISTS "Anyone can view approved photos" ON gallery_photos;

CREATE POLICY "Anyone can view all photos" ON gallery_photos
    FOR SELECT USING (true);

-- Keep the other policies as they are
-- Users can view their own photos
-- Content managers can update photos  
-- Admins can delete photos
