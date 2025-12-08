-- =====================================================
-- BGHS Alumni Website - Committee Members Schema
-- =====================================================
-- This schema supports:
-- 1. Advisory Members (no positions, just members)
-- 2. Executive Committee Members (with configurable positions)
-- 3. History tracking (yearly changes after voting)
-- 4. Position management (configurable by admin)
-- =====================================================

-- Committee Position Types (configurable by admin)
CREATE TABLE IF NOT EXISTS committee_position_types (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE, -- e.g., "President", "Vice President", "Secretary"
    display_order INTEGER NOT NULL DEFAULT 0, -- Order in which positions should be displayed
    description TEXT, -- Optional description
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Committee Members
-- NOTE: All committee members MUST be existing alumni in the profiles table
CREATE TABLE IF NOT EXISTS committee_members (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL, -- REQUIRED: Link to alumni profile
    
    -- Committee Assignment
    committee_type TEXT NOT NULL CHECK (committee_type IN ('advisory', 'executive')),
    position_type_id UUID REFERENCES committee_position_types(id) ON DELETE SET NULL, -- NULL for advisory members or members without specific positions
    
    -- Tenure Information
    start_date DATE NOT NULL DEFAULT CURRENT_DATE, -- When they started in this role
    end_date DATE, -- NULL for current members, set when they leave
    is_current BOOLEAN DEFAULT true, -- Quick flag for current members
    
    -- Display Order
    display_order INTEGER DEFAULT 0, -- Order within their position/committee type
    
    -- Additional Metadata
    metadata JSONB DEFAULT '{}', -- Flexible storage for additional info (e.g., achievements, special notes)
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    created_by UUID REFERENCES profiles(id), -- Admin who added this member
    updated_by UUID REFERENCES profiles(id) -- Admin who last updated this member
);

-- Committee History (for tracking changes over years)
CREATE TABLE IF NOT EXISTS committee_history (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    committee_member_id UUID REFERENCES committee_members(id) ON DELETE CASCADE,
    
    -- Historical Record
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE, -- Reference to profile (may be deleted)
    full_name TEXT NOT NULL, -- Snapshot of name at time of tenure
    committee_type TEXT NOT NULL CHECK (committee_type IN ('advisory', 'executive')),
    position_type_id UUID REFERENCES committee_position_types(id) ON DELETE SET NULL,
    
    -- Tenure Period
    start_date DATE NOT NULL,
    end_date DATE, -- When this tenure ended
    
    -- Year/Period Identifier
    year INTEGER, -- e.g., 2024, 2025 (for easy filtering)
    period_label TEXT, -- e.g., "2024-2025", "2024-2025 Term"
    
    -- Snapshot of member data at that time (from profile)
    photo_url TEXT, -- Snapshot of avatar_url
    bio TEXT, -- Snapshot of bio
    metadata JSONB DEFAULT '{}',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    archived_by UUID REFERENCES profiles(id) -- Admin who archived this record
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_committee_members_type ON committee_members(committee_type);
CREATE INDEX IF NOT EXISTS idx_committee_members_current ON committee_members(is_current);
CREATE INDEX IF NOT EXISTS idx_committee_members_position ON committee_members(position_type_id);
CREATE INDEX IF NOT EXISTS idx_committee_members_profile ON committee_members(profile_id);
CREATE INDEX IF NOT EXISTS idx_committee_history_year ON committee_history(year);
CREATE INDEX IF NOT EXISTS idx_committee_history_member ON committee_history(committee_member_id);
CREATE INDEX IF NOT EXISTS idx_position_types_active ON committee_position_types(is_active);

-- Insert default position types
INSERT INTO committee_position_types (name, display_order, description) VALUES
    ('President', 1, 'Head of the executive committee'),
    ('Vice President', 2, 'Deputy to the president'),
    ('Secretary', 3, 'Handles documentation and correspondence'),
    ('Assistant Secretary', 4, 'Assists the secretary'),
    ('Treasurer', 5, 'Manages finances'),
    ('Joint Secretary', 6, 'Co-secretary position'),
    ('Member', 99, 'General committee member without specific position')
ON CONFLICT (name) DO NOTHING;

-- Function to automatically archive members when end_date is set
CREATE OR REPLACE FUNCTION archive_committee_member()
RETURNS TRIGGER AS $$
DECLARE
    profile_name TEXT;
    profile_photo TEXT;
    profile_bio TEXT;
BEGIN
    -- When a member's end_date is set and is_current becomes false, create history record
    IF NEW.end_date IS NOT NULL AND NEW.is_current = false AND (OLD.is_current = true OR OLD.end_date IS NULL) THEN
        -- Get current profile data for snapshot
        SELECT full_name, avatar_url, bio INTO profile_name, profile_photo, profile_bio
        FROM profiles WHERE id = NEW.profile_id;
        
        INSERT INTO committee_history (
            committee_member_id,
            profile_id,
            full_name,
            committee_type,
            position_type_id,
            start_date,
            end_date,
            year,
            period_label,
            photo_url,
            bio,
            metadata
        ) VALUES (
            NEW.id,
            NEW.profile_id,
            COALESCE(profile_name, 'Unknown'),
            NEW.committee_type,
            NEW.position_type_id,
            NEW.start_date,
            NEW.end_date,
            EXTRACT(YEAR FROM NEW.end_date)::INTEGER,
            EXTRACT(YEAR FROM NEW.start_date)::TEXT || '-' || EXTRACT(YEAR FROM NEW.end_date)::TEXT,
            profile_photo,
            profile_bio,
            NEW.metadata
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-archive when member tenure ends
CREATE TRIGGER trigger_archive_committee_member
    AFTER UPDATE ON committee_members
    FOR EACH ROW
    WHEN (NEW.end_date IS NOT NULL AND NEW.is_current = false)
    EXECUTE FUNCTION archive_committee_member();

-- RLS Policies (if using Row Level Security)
-- ALTER TABLE committee_members ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE committee_position_types ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE committee_history ENABLE ROW LEVEL SECURITY;

-- Policy: Public can view current committee members
-- CREATE POLICY "Public can view current committee members" ON committee_members
--     FOR SELECT USING (is_current = true);

-- Policy: Only admins can manage committee members
-- CREATE POLICY "Admins can manage committee members" ON committee_members
--     FOR ALL USING (
--         EXISTS (
--             SELECT 1 FROM profiles
--             WHERE profiles.id = auth.uid()
--             AND profiles.role IN ('super_admin', 'event_manager', 'content_moderator')
--         )
--     );

COMMENT ON TABLE committee_members IS 'Stores current and past committee members (advisory and executive)';
COMMENT ON TABLE committee_position_types IS 'Configurable position types for executive committee members';
COMMENT ON TABLE committee_history IS 'Historical records of committee members for tracking changes over years';

