-- ========================================
-- BGHS ALUMNI PAYMENT SYSTEM - COMPLETE SETUP
-- ALL-IN-ONE INSTALLATION SCRIPT
-- ========================================
-- This script combines:
--   1. payment-system-schema.sql
--   2. add-payment-tokens-table.sql
--   3. Sample payment configuration
--
-- Run this ONCE in Supabase SQL Editor
-- Safe to run multiple times (uses IF NOT EXISTS)
-- ========================================

BEGIN;

-- ========================================
-- PART 1: PAYMENT CONFIGURATION TABLE
-- ========================================

CREATE TABLE IF NOT EXISTS payment_configurations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    
    -- Category and identification
    payment_category TEXT NOT NULL CHECK (payment_category IN ('registration', 'event', 'donation', 'membership', 'other')),
    name TEXT NOT NULL,
    description TEXT,
    
    -- Pricing
    amount DECIMAL(10,2) NOT NULL CHECK (amount >= 0),
    currency TEXT DEFAULT 'INR' NOT NULL,
    
    -- Status flags
    is_active BOOLEAN DEFAULT TRUE,
    is_mandatory BOOLEAN DEFAULT FALSE,
    
    -- Payment gateway settings
    payment_gateway TEXT DEFAULT 'razorpay' CHECK (payment_gateway IN ('razorpay', 'manual')),
    
    -- Metadata
    metadata JSONB DEFAULT '{}'::jsonb,
    
    -- Audit fields
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    
    -- Ensure unique active config per category
    UNIQUE(payment_category, name)
);

CREATE INDEX IF NOT EXISTS idx_payment_configurations_category ON payment_configurations(payment_category);
CREATE INDEX IF NOT EXISTS idx_payment_configurations_active ON payment_configurations(is_active) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_payment_configurations_created_at ON payment_configurations(created_at DESC);

-- ========================================
-- PART 2: PAYMENT TRANSACTIONS TABLE
-- ========================================

CREATE TABLE IF NOT EXISTS payment_transactions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    
    -- User and configuration
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    payment_config_id UUID REFERENCES payment_configurations(id) ON DELETE SET NULL,
    
    -- Related entity
    related_entity_type TEXT CHECK (related_entity_type IN ('registration', 'event', 'donation', 'membership', 'other')),
    related_entity_id UUID,
    
    -- Payment details
    amount DECIMAL(10,2) NOT NULL CHECK (amount >= 0),
    currency TEXT DEFAULT 'INR' NOT NULL,
    
    -- Payment status
    payment_status TEXT DEFAULT 'initiated' NOT NULL CHECK (
        payment_status IN ('initiated', 'pending', 'success', 'failed', 'cancelled', 'refunded')
    ),
    
    -- RazorPay fields
    razorpay_order_id TEXT,
    razorpay_payment_id TEXT,
    razorpay_signature TEXT,
    payment_method TEXT,
    
    -- Failure handling
    failure_reason TEXT,
    retry_count INTEGER DEFAULT 0,
    
    -- Additional data
    metadata JSONB DEFAULT '{}'::jsonb,
    
    -- Timestamps
    initiated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_payment_transactions_user_id ON payment_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_status ON payment_transactions(payment_status);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_razorpay_order ON payment_transactions(razorpay_order_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_entity ON payment_transactions(related_entity_type, related_entity_id);

-- ========================================
-- PART 3: PAYMENT RECEIPTS TABLE
-- ========================================

CREATE TABLE IF NOT EXISTS payment_receipts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    
    -- Transaction reference
    transaction_id UUID REFERENCES payment_transactions(id) ON DELETE CASCADE NOT NULL,
    
    -- Receipt details
    receipt_number TEXT UNIQUE NOT NULL,
    receipt_url TEXT,
    
    -- Amounts
    amount DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'INR' NOT NULL,
    tax_amount DECIMAL(10,2) DEFAULT 0,
    
    -- Metadata
    metadata JSONB DEFAULT '{}'::jsonb,
    
    -- Timestamps
    issued_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_payment_receipts_transaction ON payment_receipts(transaction_id);
CREATE INDEX IF NOT EXISTS idx_payment_receipts_number ON payment_receipts(receipt_number);

-- ========================================
-- PART 4: PAYMENT NOTIFICATION QUEUE TABLE
-- ========================================

CREATE TABLE IF NOT EXISTS payment_notification_queue (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    
    -- User reference
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    
    -- Notification details
    email TEXT NOT NULL,
    notification_type TEXT NOT NULL CHECK (notification_type IN ('payment_link', 'payment_success', 'payment_failed', 'receipt')),
    subject TEXT NOT NULL,
    body TEXT NOT NULL,
    
    -- Status
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'cancelled')),
    sent_at TIMESTAMP WITH TIME ZONE,
    failure_reason TEXT,
    retry_count INTEGER DEFAULT 0,
    
    -- Metadata
    metadata JSONB DEFAULT '{}'::jsonb,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_payment_notification_queue_status ON payment_notification_queue(status);
CREATE INDEX IF NOT EXISTS idx_payment_notification_queue_user ON payment_notification_queue(user_id);

-- ========================================
-- PART 5: PAYMENT TOKENS TABLE
-- ========================================

CREATE TABLE IF NOT EXISTS payment_tokens (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    
    -- Token details
    token_hash TEXT NOT NULL UNIQUE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    payment_config_id UUID REFERENCES payment_configurations(id) ON DELETE SET NULL,
    
    -- Payment details
    amount DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'INR' NOT NULL,
    
    -- Token metadata
    token_type TEXT DEFAULT 'registration_payment' CHECK (token_type IN ('registration_payment', 'other')),
    used BOOLEAN DEFAULT FALSE,
    
    -- Expiry
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    used_at TIMESTAMP WITH TIME ZONE,
    
    -- Metadata
    metadata JSONB DEFAULT '{}'::jsonb,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_payment_tokens_hash ON payment_tokens(token_hash);
CREATE INDEX IF NOT EXISTS idx_payment_tokens_user ON payment_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_tokens_expiry ON payment_tokens(expires_at) WHERE used = FALSE;

-- ========================================
-- PART 6: UPDATE EXISTING TABLES
-- ========================================

-- Add payment columns to profiles table
ALTER TABLE profiles
    ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'not_required' CHECK (
        payment_status IN ('pending', 'completed', 'failed', 'not_required')
    ),
    ADD COLUMN IF NOT EXISTS registration_payment_status TEXT DEFAULT 'pending' CHECK (
        registration_payment_status IN ('pending', 'paid', 'waived', 'not_required')
    ),
    ADD COLUMN IF NOT EXISTS registration_payment_transaction_id UUID REFERENCES payment_transactions(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_profiles_payment_status ON profiles(payment_status);
CREATE INDEX IF NOT EXISTS idx_profiles_registration_payment_status ON profiles(registration_payment_status);

-- Add payment columns to events table (if exists)
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'events') THEN
        ALTER TABLE events
            ADD COLUMN IF NOT EXISTS requires_payment BOOLEAN DEFAULT FALSE,
            ADD COLUMN IF NOT EXISTS payment_amount DECIMAL(10,2),
            ADD COLUMN IF NOT EXISTS payment_currency TEXT DEFAULT 'INR',
            ADD COLUMN IF NOT EXISTS payment_config_id UUID REFERENCES payment_configurations(id) ON DELETE SET NULL;
        
        CREATE INDEX IF NOT EXISTS idx_events_requires_payment ON events(requires_payment) WHERE requires_payment = TRUE;
    END IF;
END $$;

-- Add payment columns to event_registrations table (if exists)
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'event_registrations') THEN
        ALTER TABLE event_registrations
            ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'not_required' CHECK (
                payment_status IN ('pending', 'paid', 'waived', 'not_required')
            ),
            ADD COLUMN IF NOT EXISTS payment_amount DECIMAL(10,2),
            ADD COLUMN IF NOT EXISTS payment_currency TEXT DEFAULT 'INR',
            ADD COLUMN IF NOT EXISTS payment_transaction_id UUID REFERENCES payment_transactions(id) ON DELETE SET NULL,
            ADD COLUMN IF NOT EXISTS registration_confirmed BOOLEAN DEFAULT FALSE;
        
        CREATE INDEX IF NOT EXISTS idx_event_registrations_payment_status ON event_registrations(payment_status);
    END IF;
END $$;

-- Update donations table (if exists)
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'donations') THEN
        -- Remove old Stripe column if exists
        ALTER TABLE donations DROP COLUMN IF EXISTS stripe_payment_intent_id;
        
        -- Add new payment transaction reference
        ALTER TABLE donations
            ADD COLUMN IF NOT EXISTS payment_transaction_id UUID REFERENCES payment_transactions(id) ON DELETE SET NULL;
        
        -- Update payment_status constraint
        ALTER TABLE donations DROP CONSTRAINT IF EXISTS donations_payment_status_check;
        ALTER TABLE donations ADD CONSTRAINT donations_payment_status_check 
            CHECK (payment_status IN ('initiated', 'pending', 'completed', 'failed', 'cancelled', 'refunded'));
        
        CREATE INDEX IF NOT EXISTS idx_donations_payment_transaction ON donations(payment_transaction_id);
    END IF;
END $$;

-- ========================================
-- PART 7: ROW LEVEL SECURITY (RLS)
-- ========================================

-- Enable RLS on payment tables
ALTER TABLE payment_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_notification_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_tokens ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for idempotency)
DROP POLICY IF EXISTS "Anyone can view active payment configs" ON payment_configurations;
DROP POLICY IF EXISTS "Admins can manage payment configs" ON payment_configurations;
DROP POLICY IF EXISTS "Users can view own transactions" ON payment_transactions;
DROP POLICY IF EXISTS "Users can create own transactions" ON payment_transactions;
DROP POLICY IF EXISTS "Users can update own pending transactions" ON payment_transactions;
DROP POLICY IF EXISTS "Admins can view all transactions" ON payment_transactions;
DROP POLICY IF EXISTS "Admins can update transactions" ON payment_transactions;
DROP POLICY IF EXISTS "Users can view own receipts" ON payment_receipts;
DROP POLICY IF EXISTS "Admins can view all receipts" ON payment_receipts;
DROP POLICY IF EXISTS "System can insert receipts" ON payment_receipts;
DROP POLICY IF EXISTS "Users can view own payment notifications" ON payment_notification_queue;
DROP POLICY IF EXISTS "Admins can view all payment notifications" ON payment_notification_queue;
DROP POLICY IF EXISTS "System can manage notifications" ON payment_notification_queue;
DROP POLICY IF EXISTS "Users can view own tokens" ON payment_tokens;
DROP POLICY IF EXISTS "System can manage tokens" ON payment_tokens;

-- RLS Policies for payment_configurations
CREATE POLICY "Anyone can view active payment configs" ON payment_configurations
    FOR SELECT USING (is_active = TRUE);

CREATE POLICY "Admins can manage payment configs" ON payment_configurations
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role IN ('super_admin', 'admin')
        )
    );

-- RLS Policies for payment_transactions
CREATE POLICY "Users can view own transactions" ON payment_transactions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own transactions" ON payment_transactions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own pending transactions" ON payment_transactions
    FOR UPDATE USING (
        auth.uid() = user_id 
        AND payment_status IN ('initiated', 'pending')
    );

CREATE POLICY "Admins can view all transactions" ON payment_transactions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role IN ('super_admin', 'admin', 'content_moderator')
        )
    );

CREATE POLICY "Admins can update transactions" ON payment_transactions
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role IN ('super_admin', 'admin')
        )
    );

-- RLS Policies for payment_receipts
CREATE POLICY "Users can view own receipts" ON payment_receipts
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM payment_transactions 
            WHERE payment_transactions.id = payment_receipts.transaction_id 
            AND payment_transactions.user_id = auth.uid()
        )
    );

CREATE POLICY "Admins can view all receipts" ON payment_receipts
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role IN ('super_admin', 'admin', 'content_moderator')
        )
    );

CREATE POLICY "System can insert receipts" ON payment_receipts
    FOR INSERT WITH CHECK (true);

-- RLS Policies for payment_notification_queue
CREATE POLICY "Users can view own payment notifications" ON payment_notification_queue
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all payment notifications" ON payment_notification_queue
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role IN ('super_admin', 'admin', 'content_moderator')
        )
    );

CREATE POLICY "System can manage notifications" ON payment_notification_queue
    FOR ALL WITH CHECK (true);

-- RLS Policies for payment_tokens
CREATE POLICY "Users can view own tokens" ON payment_tokens
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can manage tokens" ON payment_tokens
    FOR ALL WITH CHECK (true);

-- ========================================
-- PART 8: HELPER FUNCTIONS
-- ========================================

-- Function to generate unique receipt number
CREATE OR REPLACE FUNCTION generate_receipt_number()
RETURNS TEXT AS $$
DECLARE
    receipt_num TEXT;
    year_prefix TEXT;
    sequence_num INTEGER;
BEGIN
    year_prefix := 'BGHS/' || EXTRACT(YEAR FROM NOW()) || '/';
    
    SELECT COALESCE(MAX(
        CAST(SUBSTRING(receipt_number FROM LENGTH(year_prefix) + 1) AS INTEGER)
    ), 0) + 1
    INTO sequence_num
    FROM payment_receipts
    WHERE receipt_number LIKE year_prefix || '%';
    
    receipt_num := year_prefix || LPAD(sequence_num::TEXT, 6, '0');
    
    RETURN receipt_num;
END;
$$ LANGUAGE plpgsql;

-- Function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_payment_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for auto-updating timestamps
DROP TRIGGER IF EXISTS update_payment_configurations_updated_at ON payment_configurations;
CREATE TRIGGER update_payment_configurations_updated_at
    BEFORE UPDATE ON payment_configurations
    FOR EACH ROW
    EXECUTE FUNCTION update_payment_updated_at();

DROP TRIGGER IF EXISTS update_payment_transactions_updated_at ON payment_transactions;
CREATE TRIGGER update_payment_transactions_updated_at
    BEFORE UPDATE ON payment_transactions
    FOR EACH ROW
    EXECUTE FUNCTION update_payment_updated_at();

DROP TRIGGER IF EXISTS update_payment_tokens_updated_at ON payment_tokens;
CREATE TRIGGER update_payment_tokens_updated_at
    BEFORE UPDATE ON payment_tokens
    FOR EACH ROW
    EXECUTE FUNCTION update_payment_updated_at();

DROP TRIGGER IF EXISTS update_payment_notification_queue_updated_at ON payment_notification_queue;
CREATE TRIGGER update_payment_notification_queue_updated_at
    BEFORE UPDATE ON payment_notification_queue
    FOR EACH ROW
    EXECUTE FUNCTION update_payment_updated_at();

-- ========================================
-- PART 9: SAMPLE DATA (OPTIONAL)
-- ========================================

-- Insert sample registration payment configuration
-- You can comment this out if you want to add it manually later
INSERT INTO payment_configurations (
    payment_category,
    name,
    description,
    amount,
    currency,
    is_active,
    is_mandatory,
    payment_gateway
) VALUES (
    'registration',
    'Registration Fee',
    'One-time registration fee for alumni membership',
    500.00,
    'INR',
    TRUE,
    TRUE,
    'razorpay'
)
ON CONFLICT (payment_category, name) DO NOTHING;

COMMIT;

-- ========================================
-- INSTALLATION COMPLETE!
-- ========================================
-- 
-- ✅ 5 new tables created
-- ✅ 4 existing tables updated with payment columns
-- ✅ All indexes created
-- ✅ RLS policies enabled
-- ✅ Helper functions created
-- ✅ Triggers created
-- ✅ Sample payment configuration added
--
-- Next steps:
-- 1. Run the verification script (payment-system-verify.sql)
-- 2. Configure RazorPay keys in .env.local
-- 3. Test the payment workflow
-- ========================================

