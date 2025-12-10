-- =====================================================
-- BGHS Alumni Website - Notices/Announcements Schema
-- =====================================================
-- This schema supports:
-- 1. Time-sensitive notices and announcements
-- 2. Event-related notices (optional linking)
-- 3. Priority-based display (Urgent/Important/General)
-- 4. Auto-expiration based on dates
-- =====================================================

-- Create notices table
CREATE TABLE IF NOT EXISTS notices (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'general', -- 'event', 'announcement', 'general', 'urgent'
    priority INTEGER NOT NULL DEFAULT 3, -- 1=urgent, 2=important, 3=general
    event_id UUID REFERENCES events(id) ON DELETE SET NULL, -- Optional link to event
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    link_url TEXT, -- Custom URL if needed (overrides event_id link)
    icon TEXT DEFAULT 'info', -- 'calendar', 'bell', 'info', 'alert'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL
);

-- Create indexes for notices
CREATE INDEX IF NOT EXISTS idx_notices_type ON notices(type);
CREATE INDEX IF NOT EXISTS idx_notices_priority ON notices(priority);
CREATE INDEX IF NOT EXISTS idx_notices_event_id ON notices(event_id);
CREATE INDEX IF NOT EXISTS idx_notices_active ON notices(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_notices_dates ON notices(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_notices_created_at ON notices(created_at DESC);

-- Enable RLS
ALTER TABLE notices ENABLE ROW LEVEL SECURITY;

-- RLS Policies for notices

-- Anyone can view active notices (including scheduled notices with future start dates)
CREATE POLICY "Anyone can view active notices" ON notices
    FOR SELECT USING (
        is_active = true 
        AND (end_date IS NULL OR end_date >= NOW())
    );

-- Authenticated users can view all notices (including expired for history)
CREATE POLICY "Authenticated users can view all notices" ON notices
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles p 
            WHERE p.id = auth.uid() 
            AND p.id IS NOT NULL
        )
    );

-- Content moderators and admins can insert notices
CREATE POLICY "Content managers can insert notices" ON notices
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles p 
            WHERE p.id = auth.uid() 
            AND p.role IN ('content_moderator', 'super_admin', 'event_manager')
        )
    );

-- Content moderators and admins can update notices
CREATE POLICY "Content managers can update notices" ON notices
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM profiles p 
            WHERE p.id = auth.uid() 
            AND p.role IN ('content_moderator', 'super_admin', 'event_manager')
        )
    );

-- Only super admins can delete notices
CREATE POLICY "Admins can delete notices" ON notices
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM profiles p 
            WHERE p.id = auth.uid() 
            AND p.role = 'super_admin'
        )
    );

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_notices_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at on notice updates
CREATE TRIGGER update_notices_updated_at
    BEFORE UPDATE ON notices
    FOR EACH ROW
    EXECUTE FUNCTION update_notices_updated_at();

-- Success message
SELECT 'Notices schema created successfully!' as message;

