-- Add Payment Tokens Table
-- This table stores secure tokens for payment links
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS payment_tokens (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    
    -- Token (hashed for security)
    token_hash TEXT NOT NULL UNIQUE,
    
    -- Associated user and payment
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    payment_config_id UUID REFERENCES payment_configurations(id) ON DELETE SET NULL,
    
    -- Token details
    amount DECIMAL(10,2) NOT NULL,
    token_type TEXT DEFAULT 'registration_payment' CHECK (
        token_type IN ('registration_payment', 'event_payment', 'donation_payment', 'other')
    ),
    
    -- Status
    used BOOLEAN DEFAULT FALSE,
    used_at TIMESTAMP WITH TIME ZONE,
    
    -- Expiry
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_payment_tokens_token_hash ON payment_tokens(token_hash);
CREATE INDEX IF NOT EXISTS idx_payment_tokens_user_id ON payment_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_tokens_used ON payment_tokens(used) WHERE used = FALSE;
CREATE INDEX IF NOT EXISTS idx_payment_tokens_expires ON payment_tokens(expires_at) WHERE used = FALSE;

-- Enable RLS
ALTER TABLE payment_tokens ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- System can manage tokens (service role)
CREATE POLICY "System can manage payment tokens" ON payment_tokens
    FOR ALL WITH CHECK (true);

-- Users can view their own tokens (for debugging)
CREATE POLICY "Users can view own payment tokens" ON payment_tokens
    FOR SELECT USING (auth.uid() = user_id);

-- Function to clean up expired tokens
CREATE OR REPLACE FUNCTION cleanup_expired_payment_tokens()
RETURNS void AS $$
BEGIN
    DELETE FROM payment_tokens 
    WHERE expires_at < NOW() AND used = FALSE;
END;
$$ LANGUAGE plpgsql;

-- Verification
DO $$
BEGIN
    RAISE NOTICE '✓ payment_tokens table created successfully';
    RAISE NOTICE 'Table is ready for payment link workflow';
END $$;
