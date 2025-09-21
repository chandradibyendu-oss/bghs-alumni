-- Alumni Verification Table
-- This table stores evidence files and reference information for alumni verification during registration

CREATE TABLE alumni_verification (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    
    -- Evidence files information
    has_evidence BOOLEAN DEFAULT FALSE,
    evidence_files JSONB DEFAULT '[]', -- Array of file objects: [{name, url, size, type}]
    
    -- Reference information
    has_references BOOLEAN DEFAULT FALSE,
    reference_1 TEXT, -- First alumni registration ID
    reference_2 TEXT, -- Second alumni registration ID
    reference_1_valid BOOLEAN DEFAULT FALSE,
    reference_2_valid BOOLEAN DEFAULT FALSE,
    
    -- Verification status
    verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending', 'approved', 'rejected', 'needs_review')),
    verified_by UUID REFERENCES profiles(id) ON DELETE SET NULL, -- Admin who verified
    verification_notes TEXT, -- Admin notes during verification
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    
    -- Ensure one verification record per user
    UNIQUE(user_id)
);

-- Create indexes for better performance
CREATE INDEX idx_alumni_verification_user_id ON alumni_verification(user_id);
CREATE INDEX idx_alumni_verification_status ON alumni_verification(verification_status);
CREATE INDEX idx_alumni_verification_reference_1 ON alumni_verification(reference_1) WHERE reference_1 IS NOT NULL;
CREATE INDEX idx_alumni_verification_reference_2 ON alumni_verification(reference_2) WHERE reference_2 IS NOT NULL;
CREATE INDEX idx_alumni_verification_created_at ON alumni_verification(created_at DESC);

-- Enable Row Level Security
ALTER TABLE alumni_verification ENABLE ROW LEVEL SECURITY;

-- RLS Policies for alumni_verification

-- Users can view their own verification record
CREATE POLICY "Users can view own verification" ON alumni_verification
    FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own verification record during registration
CREATE POLICY "Users can insert own verification" ON alumni_verification
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own verification record (only before admin review)
CREATE POLICY "Users can update own verification" ON alumni_verification
    FOR UPDATE USING (
        auth.uid() = user_id 
        AND verification_status = 'pending'
    );

-- Admins can view all verification records
CREATE POLICY "Admins can view all verifications" ON alumni_verification
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles p 
            WHERE p.id = auth.uid() 
            AND p.role IN ('super_admin', 'content_moderator')
        )
    );

-- Admins can update verification status
CREATE POLICY "Admins can update verification status" ON alumni_verification
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM profiles p 
            WHERE p.id = auth.uid() 
            AND p.role IN ('super_admin', 'content_moderator')
        )
    );

-- Create trigger for updating timestamps
CREATE TRIGGER update_alumni_verification_updated_at 
    BEFORE UPDATE ON alumni_verification 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to validate reference IDs (mock for now, will be replaced with real validation)
CREATE OR REPLACE FUNCTION validate_alumni_reference(reference_id TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    -- Mock validation: check if format is valid (6-12 alphanumeric characters)
    -- In production, this would check against actual alumni database
    RETURN reference_id ~ '^[A-Z0-9]{6,12}$';
END;
$$ LANGUAGE plpgsql;

-- Function to get verification summary for admin dashboard
CREATE OR REPLACE FUNCTION get_verification_summary()
RETURNS TABLE(
    total_pending INTEGER,
    total_approved INTEGER,
    total_rejected INTEGER,
    pending_with_evidence INTEGER,
    pending_with_references INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*) FILTER (WHERE verification_status = 'pending')::INTEGER as total_pending,
        COUNT(*) FILTER (WHERE verification_status = 'approved')::INTEGER as total_approved,
        COUNT(*) FILTER (WHERE verification_status = 'rejected')::INTEGER as total_rejected,
        COUNT(*) FILTER (WHERE verification_status = 'pending' AND has_evidence = TRUE)::INTEGER as pending_with_evidence,
        COUNT(*) FILTER (WHERE verification_status = 'pending' AND has_references = TRUE)::INTEGER as pending_with_references
    FROM alumni_verification;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
