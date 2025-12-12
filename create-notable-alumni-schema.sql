-- =====================================================
-- BGHS Alumni Website - Notable Alumni Management
-- =====================================================
-- This script creates the notable_alumni table for managing
-- distinguished alumni displayed on the About page.
-- =====================================================

-- Create notable_alumni table
CREATE TABLE IF NOT EXISTS notable_alumni (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Basic Information
  name VARCHAR(255) NOT NULL,
  batch_year INTEGER, -- Optional: year of leaving/batch
  achievement VARCHAR(255) NOT NULL, -- e.g., "Dadasaheb Phalke Awardee", "IAS Officer"
  field VARCHAR(255), -- e.g., "Indian Cinema", "Civil Services", "Physics"
  description TEXT, -- Detailed description of achievements
  
  -- Photo
  photo_url TEXT, -- URL to profile photo (can be from R2 or external)
  
  -- Link to registered member (optional)
  profile_id UUID REFERENCES profiles(id) ON DELETE SET NULL, -- If this alumni is a registered member
  
  -- Display Settings
  display_order INTEGER NOT NULL DEFAULT 0, -- Order for display (lower = first)
  is_active BOOLEAN DEFAULT true, -- Show/hide from About page
  
  -- Metadata
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_notable_alumni_display_order ON notable_alumni(display_order);
CREATE INDEX IF NOT EXISTS idx_notable_alumni_is_active ON notable_alumni(is_active);
CREATE INDEX IF NOT EXISTS idx_notable_alumni_profile_id ON notable_alumni(profile_id);

-- Enable RLS
ALTER TABLE notable_alumni ENABLE ROW LEVEL SECURITY;

-- RLS Policies for notable_alumni

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public can view active notable alumni" ON notable_alumni;
DROP POLICY IF EXISTS "Authenticated users can view all notable alumni" ON notable_alumni;
DROP POLICY IF EXISTS "Content managers can insert notable alumni" ON notable_alumni;
DROP POLICY IF EXISTS "Content managers can update notable alumni" ON notable_alumni;
DROP POLICY IF EXISTS "Super admins can delete notable alumni" ON notable_alumni;

-- Public can view active notable alumni
CREATE POLICY "Public can view active notable alumni" ON notable_alumni
    FOR SELECT USING (is_active = true);

-- Authenticated users can view all notable alumni (for admin preview)
CREATE POLICY "Authenticated users can view all notable alumni" ON notable_alumni
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles p 
            WHERE p.id = auth.uid() 
            AND p.id IS NOT NULL
        )
    );

-- Content managers and admins can insert notable alumni
CREATE POLICY "Content managers can insert notable alumni" ON notable_alumni
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles p
            WHERE p.id = auth.uid()
            AND (p.role IN ('content_moderator', 'super_admin', 'event_manager')
                 OR EXISTS (
                     SELECT 1 FROM user_roles ur
                     WHERE ur.name = p.role
                     AND (ur.permissions->>'can_manage_content')::boolean = true
                 ))
        )
    );

-- Content managers and admins can update notable alumni
CREATE POLICY "Content managers can update notable alumni" ON notable_alumni
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM profiles p
            WHERE p.id = auth.uid()
            AND (p.role IN ('content_moderator', 'super_admin', 'event_manager')
                 OR EXISTS (
                     SELECT 1 FROM user_roles ur
                     WHERE ur.name = p.role
                     AND (ur.permissions->>'can_manage_content')::boolean = true
                 ))
        )
    );

-- Super admins can delete notable alumni
CREATE POLICY "Super admins can delete notable alumni" ON notable_alumni
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM profiles p
            WHERE p.id = auth.uid()
            AND p.role = 'super_admin'
        )
    );

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_notable_alumni_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if exists before creating
DROP TRIGGER IF EXISTS update_notable_alumni_updated_at ON notable_alumni;

CREATE TRIGGER update_notable_alumni_updated_at
    BEFORE UPDATE ON notable_alumni
    FOR EACH ROW
    EXECUTE FUNCTION update_notable_alumni_updated_at();

-- Insert some sample data (optional - can be removed)
-- INSERT INTO notable_alumni (name, batch_year, achievement, field, description, photo_url, display_order, is_active)
-- VALUES
--   ('Soumitra Chatterjee', NULL, 'Dadasaheb Phalke Awardee', 'Indian Cinema', 'Renowned actor, play-director, playwright, writer, thespian and poet', '/notable-alumni/soumitra-chatterjee.png', 1, true),
--   ('Prof. Anjali Chatterjee', 1988, 'National Science Award', 'Physics', 'Leading physicist and academician', '/bghs-logo.png', 2, true),
--   ('Mr. Suresh Mondal', 1992, 'IAS Officer', 'Civil Services', 'Distinguished civil servant and administrator', '/bghs-logo.png', 3, true),
--   ('Dr. Priya Sen', 2001, 'Entrepreneur of the Year', 'Technology', 'Successful tech entrepreneur and innovator', '/bghs-logo.png', 4, true);

