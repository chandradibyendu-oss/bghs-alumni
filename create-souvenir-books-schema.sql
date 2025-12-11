-- =====================================================
-- BGHS Alumni Website - Souvenir Books Schema
-- =====================================================
-- This schema supports:
-- 1. Annual souvenir book PDFs
-- 2. Public/members-only visibility
-- 3. Optional download control
-- 4. Cover images for thumbnails
-- =====================================================

-- Create souvenir_books table
CREATE TABLE IF NOT EXISTS souvenir_books (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    year INTEGER NOT NULL UNIQUE,
    title TEXT,
    description TEXT,
    pdf_url TEXT NOT NULL,
    cover_image_url TEXT,
    file_size BIGINT,
    is_public BOOLEAN DEFAULT true,
    allow_download BOOLEAN DEFAULT true,
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_souvenir_books_year ON souvenir_books(year DESC);
CREATE INDEX IF NOT EXISTS idx_souvenir_books_public ON souvenir_books(is_public, year DESC);
CREATE INDEX IF NOT EXISTS idx_souvenir_books_created_at ON souvenir_books(created_at DESC);

-- Enable RLS
ALTER TABLE souvenir_books ENABLE ROW LEVEL SECURITY;

-- RLS Policies for souvenir_books

-- Public can view public souvenir books
CREATE POLICY "Public can view public souvenir books" ON souvenir_books
    FOR SELECT USING (is_public = true);

-- Authenticated users can view all souvenir books
CREATE POLICY "Authenticated users can view all souvenir books" ON souvenir_books
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles p 
            WHERE p.id = auth.uid() 
            AND p.id IS NOT NULL
        )
    );

-- Content moderators and admins can insert souvenir books
CREATE POLICY "Content managers can insert souvenir books" ON souvenir_books
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles p 
            WHERE p.id = auth.uid() 
            AND p.role IN ('content_moderator', 'super_admin', 'event_manager')
        )
    );

-- Content moderators and admins can update souvenir books
CREATE POLICY "Content managers can update souvenir books" ON souvenir_books
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM profiles p 
            WHERE p.id = auth.uid() 
            AND p.role IN ('content_moderator', 'super_admin', 'event_manager')
        )
    );

-- Only super admins can delete souvenir books
CREATE POLICY "Super admins can delete souvenir books" ON souvenir_books
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM profiles p 
            WHERE p.id = auth.uid() 
            AND p.role = 'super_admin'
        )
    );

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_souvenir_books_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update updated_at
CREATE TRIGGER update_souvenir_books_updated_at
    BEFORE UPDATE ON souvenir_books
    FOR EACH ROW
    EXECUTE FUNCTION update_souvenir_books_updated_at();

-- Add comment to table
COMMENT ON TABLE souvenir_books IS 'Annual souvenir book PDFs published by the school';

