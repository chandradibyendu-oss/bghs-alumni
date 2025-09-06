-- Gallery Schema for BGHS Alumni Website
-- Run this SQL in your Supabase SQL Editor

-- Create photo_categories table
CREATE TABLE IF NOT EXISTS photo_categories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create gallery_photos table
CREATE TABLE IF NOT EXISTS gallery_photos (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    category_id UUID REFERENCES photo_categories(id) ON DELETE SET NULL,
    uploaded_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    file_url TEXT NOT NULL,
    thumbnail_url TEXT,
    file_size INTEGER,
    width INTEGER,
    height INTEGER,
    is_featured BOOLEAN DEFAULT FALSE,
    is_approved BOOLEAN DEFAULT FALSE,
    view_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create indexes for gallery_photos
CREATE INDEX IF NOT EXISTS idx_gallery_photos_category ON gallery_photos(category_id);
CREATE INDEX IF NOT EXISTS idx_gallery_photos_uploaded_by ON gallery_photos(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_gallery_photos_featured ON gallery_photos(is_featured) WHERE is_featured = TRUE;
CREATE INDEX IF NOT EXISTS idx_gallery_photos_approved ON gallery_photos(is_approved) WHERE is_approved = TRUE;
CREATE INDEX IF NOT EXISTS idx_gallery_photos_created_at ON gallery_photos(created_at DESC);

-- Insert default photo categories
INSERT INTO photo_categories (name, description, display_order) VALUES
('School Building', 'Photos of the school building, classrooms, and facilities', 1),
('Events', 'Photos from school events, reunions, and gatherings', 2),
('Sports', 'Sports events, teams, and activities', 3),
('Cultural', 'Cultural programs, competitions, and performances', 4),
('Alumni', 'Alumni gatherings, achievements, and activities', 5),
('Historical', 'Historical photos and memorabilia', 6),
('General', 'General school life and miscellaneous photos', 7)
ON CONFLICT (name) DO NOTHING;

-- Enable RLS
ALTER TABLE gallery_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE photo_categories ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view approved photos" ON gallery_photos;
DROP POLICY IF EXISTS "Users can view their own photos" ON gallery_photos;
DROP POLICY IF EXISTS "Content creators can insert photos" ON gallery_photos;
DROP POLICY IF EXISTS "Content managers can update photos" ON gallery_photos;
DROP POLICY IF EXISTS "Admins can delete photos" ON gallery_photos;
DROP POLICY IF EXISTS "Anyone can view photo categories" ON photo_categories;
DROP POLICY IF EXISTS "Content managers can manage categories" ON photo_categories;

-- Create RLS Policies for gallery_photos
-- Anyone can view approved photos
CREATE POLICY "Anyone can view approved photos" ON gallery_photos
    FOR SELECT USING (is_approved = TRUE);

-- Authenticated users can view their own photos
CREATE POLICY "Users can view their own photos" ON gallery_photos
    FOR SELECT USING (auth.uid() = uploaded_by);

-- Users with content creation permissions can upload photos
CREATE POLICY "Content creators can insert photos" ON gallery_photos
    FOR INSERT WITH CHECK (
        auth.uid() IS NOT NULL AND
        EXISTS (
            SELECT 1 FROM profiles p 
            WHERE p.id = auth.uid() 
            AND p.role IN ('content_creator', 'content_moderator', 'super_admin')
        )
    );

-- Users with content management permissions can update photos
CREATE POLICY "Content managers can update photos" ON gallery_photos
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM profiles p 
            WHERE p.id = auth.uid() 
            AND p.role IN ('content_moderator', 'super_admin')
        )
    );

-- Users with admin permissions can delete photos
CREATE POLICY "Admins can delete photos" ON gallery_photos
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM profiles p 
            WHERE p.id = auth.uid() 
            AND p.role = 'super_admin'
        )
    );

-- Create RLS Policies for photo_categories
-- Anyone can view photo categories
CREATE POLICY "Anyone can view photo categories" ON photo_categories
    FOR SELECT USING (TRUE);

-- Users with content management permissions can manage categories
CREATE POLICY "Content managers can manage categories" ON photo_categories
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles p 
            WHERE p.id = auth.uid() 
            AND p.role IN ('content_moderator', 'super_admin')
        )
    );

-- Success message
SELECT 'Gallery schema created successfully!' as message;
