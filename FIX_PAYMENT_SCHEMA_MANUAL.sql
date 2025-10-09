-- ========================================
-- MANUAL FIX FOR PAYMENT SCHEMA
-- Run each section ONE AT A TIME
-- ========================================
-- Your current issue: 
-- - Table has 'category' column (old)
-- - Need to rename to 'payment_category' (new)
-- - Need to update constraint
-- ========================================

-- ========================================
-- SECTION A: FIX payment_configurations TABLE
-- Run this section first
-- ========================================

-- Step 1: Drop ALL constraints
ALTER TABLE payment_configurations DROP CONSTRAINT IF EXISTS payment_configurations_category_check;
ALTER TABLE payment_configurations DROP CONSTRAINT IF EXISTS payment_configurations_payment_category_check;
ALTER TABLE payment_configurations DROP CONSTRAINT IF EXISTS payment_configurations_check;

-- Step 2: Rename column
ALTER TABLE payment_configurations RENAME COLUMN category TO payment_category;

-- Step 3: Update old values to new standard
UPDATE payment_configurations SET payment_category = 'registration' WHERE payment_category = 'registration_fee';
UPDATE payment_configurations SET payment_category = 'event' WHERE payment_category = 'event_fee';
UPDATE payment_configurations SET payment_category = 'membership' WHERE payment_category = 'membership_renewal';

-- Step 4: Add new constraint
ALTER TABLE payment_configurations 
ADD CONSTRAINT payment_configurations_payment_category_check 
CHECK (payment_category IN ('registration', 'event', 'donation', 'membership', 'other'));

-- Step 5: Fix unique constraint
ALTER TABLE payment_configurations DROP CONSTRAINT IF EXISTS payment_configurations_category_name_key;
ALTER TABLE payment_configurations DROP CONSTRAINT IF EXISTS payment_configurations_payment_category_name_key;
ALTER TABLE payment_configurations ADD CONSTRAINT payment_configurations_payment_category_name_key UNIQUE(payment_category, name);

-- Verify
SELECT payment_category, name, amount, currency FROM payment_configurations;

-- ========================================
-- SECTION B: CREATE MISSING TABLES
-- Run this section second
-- ========================================

-- Create payment_transactions if not exists
CREATE TABLE IF NOT EXISTS payment_transactions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    payment_config_id UUID REFERENCES payment_configurations(id) ON DELETE SET NULL,
    related_entity_type TEXT CHECK (related_entity_type IN ('registration', 'event', 'donation', 'membership', 'other')),
    related_entity_id UUID,
    amount DECIMAL(10,2) NOT NULL CHECK (amount >= 0),
    currency TEXT DEFAULT 'INR' NOT NULL,
    payment_status TEXT DEFAULT 'initiated' NOT NULL CHECK (
        payment_status IN ('initiated', 'pending', 'success', 'failed', 'cancelled', 'refunded')
    ),
    razorpay_order_id TEXT,
    razorpay_payment_id TEXT,
    razorpay_signature TEXT,
    payment_method TEXT,
    failure_reason TEXT,
    retry_count INTEGER DEFAULT 0,
    metadata JSONB DEFAULT '{}'::jsonb,
    initiated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_payment_transactions_user_id ON payment_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_status ON payment_transactions(payment_status);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_razorpay_order ON payment_transactions(razorpay_order_id);

-- Create payment_receipts if not exists
CREATE TABLE IF NOT EXISTS payment_receipts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    transaction_id UUID REFERENCES payment_transactions(id) ON DELETE CASCADE NOT NULL,
    receipt_number TEXT UNIQUE NOT NULL,
    receipt_url TEXT,
    amount DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'INR' NOT NULL,
    tax_amount DECIMAL(10,2) DEFAULT 0,
    metadata JSONB DEFAULT '{}'::jsonb,
    issued_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_payment_receipts_transaction ON payment_receipts(transaction_id);

-- Create payment_notification_queue if not exists
CREATE TABLE IF NOT EXISTS payment_notification_queue (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    notification_type TEXT NOT NULL CHECK (notification_type IN ('payment_link', 'payment_success', 'payment_failed', 'receipt')),
    subject TEXT NOT NULL,
    body TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'cancelled')),
    sent_at TIMESTAMP WITH TIME ZONE,
    failure_reason TEXT,
    retry_count INTEGER DEFAULT 0,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_payment_notification_queue_user ON payment_notification_queue(user_id);

-- Create payment_tokens if not exists
CREATE TABLE IF NOT EXISTS payment_tokens (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    token_hash TEXT NOT NULL UNIQUE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    payment_config_id UUID REFERENCES payment_configurations(id) ON DELETE SET NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'INR' NOT NULL,
    token_type TEXT DEFAULT 'registration_payment' CHECK (token_type IN ('registration_payment', 'other')),
    used BOOLEAN DEFAULT FALSE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    used_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_payment_tokens_hash ON payment_tokens(token_hash);
CREATE INDEX IF NOT EXISTS idx_payment_tokens_user ON payment_tokens(user_id);

-- ========================================
-- SECTION C: UPDATE EXISTING TABLES
-- Run this section third
-- ========================================

-- Add payment columns to profiles
ALTER TABLE profiles
    ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'not_required',
    ADD COLUMN IF NOT EXISTS registration_payment_status TEXT DEFAULT 'pending',
    ADD COLUMN IF NOT EXISTS registration_payment_transaction_id UUID;

-- Drop and recreate profiles constraints
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_payment_status_check;
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_registration_payment_status_check;

ALTER TABLE profiles ADD CONSTRAINT profiles_payment_status_check 
CHECK (payment_status IN ('pending', 'completed', 'failed', 'not_required'));

ALTER TABLE profiles ADD CONSTRAINT profiles_registration_payment_status_check 
CHECK (registration_payment_status IN ('pending', 'paid', 'waived', 'not_required'));

-- Add FK for profiles
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'profiles_registration_payment_transaction_id_fkey') THEN
        ALTER TABLE profiles ADD CONSTRAINT profiles_registration_payment_transaction_id_fkey 
        FOREIGN KEY (registration_payment_transaction_id) REFERENCES payment_transactions(id) ON DELETE SET NULL;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_profiles_payment_status ON profiles(payment_status);

-- Update events table (if exists)
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'events') THEN
        ALTER TABLE events
            ADD COLUMN IF NOT EXISTS requires_payment BOOLEAN DEFAULT FALSE,
            ADD COLUMN IF NOT EXISTS payment_amount DECIMAL(10,2),
            ADD COLUMN IF NOT EXISTS payment_currency TEXT DEFAULT 'INR',
            ADD COLUMN IF NOT EXISTS payment_config_id UUID;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'events_payment_config_id_fkey') THEN
            ALTER TABLE events ADD CONSTRAINT events_payment_config_id_fkey 
            FOREIGN KEY (payment_config_id) REFERENCES payment_configurations(id) ON DELETE SET NULL;
        END IF;
    END IF;
END $$;

-- Update event_registrations table (if exists)
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'event_registrations') THEN
        ALTER TABLE event_registrations
            ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'not_required',
            ADD COLUMN IF NOT EXISTS payment_amount DECIMAL(10,2),
            ADD COLUMN IF NOT EXISTS payment_currency TEXT DEFAULT 'INR',
            ADD COLUMN IF NOT EXISTS payment_transaction_id UUID,
            ADD COLUMN IF NOT EXISTS registration_confirmed BOOLEAN DEFAULT FALSE;
        
        ALTER TABLE event_registrations DROP CONSTRAINT IF EXISTS event_registrations_payment_status_check;
        ALTER TABLE event_registrations ADD CONSTRAINT event_registrations_payment_status_check 
        CHECK (payment_status IN ('pending', 'paid', 'waived', 'not_required'));
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'event_registrations_payment_transaction_id_fkey') THEN
            ALTER TABLE event_registrations ADD CONSTRAINT event_registrations_payment_transaction_id_fkey 
            FOREIGN KEY (payment_transaction_id) REFERENCES payment_transactions(id) ON DELETE SET NULL;
        END IF;
    END IF;
END $$;

-- Update donations table (if exists)
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'donations') THEN
        ALTER TABLE donations DROP COLUMN IF EXISTS stripe_payment_intent_id;
        ALTER TABLE donations ADD COLUMN IF NOT EXISTS payment_transaction_id UUID;
        
        ALTER TABLE donations DROP CONSTRAINT IF EXISTS donations_payment_status_check;
        ALTER TABLE donations ADD CONSTRAINT donations_payment_status_check 
        CHECK (payment_status IN ('initiated', 'pending', 'completed', 'failed', 'cancelled', 'refunded'));
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'donations_payment_transaction_id_fkey') THEN
            ALTER TABLE donations ADD CONSTRAINT donations_payment_transaction_id_fkey 
            FOREIGN KEY (payment_transaction_id) REFERENCES payment_transactions(id) ON DELETE SET NULL;
        END IF;
    END IF;
END $$;

-- ========================================
-- SECTION D: ENABLE RLS & CREATE POLICIES
-- Run this section fourth
-- ========================================

ALTER TABLE payment_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_notification_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_tokens ENABLE ROW LEVEL SECURITY;

-- Drop old policies
DROP POLICY IF EXISTS "Anyone can view active payment configs" ON payment_configurations;
DROP POLICY IF EXISTS "Admins can manage payment configs" ON payment_configurations;
DROP POLICY IF EXISTS "Users can view own transactions" ON payment_transactions;
DROP POLICY IF EXISTS "Users can create own transactions" ON payment_transactions;
DROP POLICY IF EXISTS "Users can update own pending transactions" ON payment_transactions;
DROP POLICY IF EXISTS "Admins can view all transactions" ON payment_transactions;
DROP POLICY IF EXISTS "Admins can update transactions" ON payment_transactions;
DROP POLICY IF EXISTS "Service role can manage transactions" ON payment_transactions;
DROP POLICY IF EXISTS "Users can view own receipts" ON payment_receipts;
DROP POLICY IF EXISTS "Admins can view all receipts" ON payment_receipts;
DROP POLICY IF EXISTS "System can insert receipts" ON payment_receipts;
DROP POLICY IF EXISTS "Users can view own payment notifications" ON payment_notification_queue;
DROP POLICY IF EXISTS "Admins can view all payment notifications" ON payment_notification_queue;
DROP POLICY IF EXISTS "System can manage notifications" ON payment_notification_queue;
DROP POLICY IF EXISTS "Users can view own tokens" ON payment_tokens;
DROP POLICY IF EXISTS "System can manage tokens" ON payment_tokens;

-- Create policies
CREATE POLICY "Anyone can view active payment configs" ON payment_configurations
    FOR SELECT USING (is_active = TRUE);

CREATE POLICY "Admins can manage payment configs" ON payment_configurations
    FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('super_admin', 'admin')));

CREATE POLICY "Users can view own transactions" ON payment_transactions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own transactions" ON payment_transactions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own pending transactions" ON payment_transactions
    FOR UPDATE USING (auth.uid() = user_id AND payment_status IN ('initiated', 'pending'));

CREATE POLICY "Admins can view all transactions" ON payment_transactions
    FOR SELECT USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('super_admin', 'admin', 'content_moderator')));

CREATE POLICY "Admins can update transactions" ON payment_transactions
    FOR UPDATE USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('super_admin', 'admin')));

CREATE POLICY "Service role can manage transactions" ON payment_transactions
    FOR ALL USING (true);

CREATE POLICY "Users can view own receipts" ON payment_receipts
    FOR SELECT USING (EXISTS (SELECT 1 FROM payment_transactions WHERE payment_transactions.id = payment_receipts.transaction_id AND payment_transactions.user_id = auth.uid()));

CREATE POLICY "Admins can view all receipts" ON payment_receipts
    FOR SELECT USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('super_admin', 'admin', 'content_moderator')));

CREATE POLICY "System can insert receipts" ON payment_receipts
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view own payment notifications" ON payment_notification_queue
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all payment notifications" ON payment_notification_queue
    FOR SELECT USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('super_admin', 'admin', 'content_moderator')));

CREATE POLICY "System can manage notifications" ON payment_notification_queue
    FOR ALL WITH CHECK (true);

CREATE POLICY "Users can view own tokens" ON payment_tokens
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can manage tokens" ON payment_tokens
    FOR ALL WITH CHECK (true);

-- ========================================
-- SECTION E: HELPER FUNCTIONS & TRIGGERS
-- Run this section fifth
-- ========================================

CREATE OR REPLACE FUNCTION generate_receipt_number()
RETURNS TEXT AS $$
DECLARE
    receipt_num TEXT;
    year_prefix TEXT;
    sequence_num INTEGER;
BEGIN
    year_prefix := 'BGHS/' || EXTRACT(YEAR FROM NOW()) || '/';
    SELECT COALESCE(MAX(CAST(SUBSTRING(receipt_number FROM LENGTH(year_prefix) + 1) AS INTEGER)), 0) + 1
    INTO sequence_num FROM payment_receipts WHERE receipt_number LIKE year_prefix || '%';
    receipt_num := year_prefix || LPAD(sequence_num::TEXT, 6, '0');
    RETURN receipt_num;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_payment_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_payment_configurations_updated_at ON payment_configurations;
CREATE TRIGGER update_payment_configurations_updated_at
    BEFORE UPDATE ON payment_configurations FOR EACH ROW EXECUTE FUNCTION update_payment_updated_at();

DROP TRIGGER IF EXISTS update_payment_transactions_updated_at ON payment_transactions;
CREATE TRIGGER update_payment_transactions_updated_at
    BEFORE UPDATE ON payment_transactions FOR EACH ROW EXECUTE FUNCTION update_payment_updated_at();

DROP TRIGGER IF EXISTS update_payment_tokens_updated_at ON payment_tokens;
CREATE TRIGGER update_payment_tokens_updated_at
    BEFORE UPDATE ON payment_tokens FOR EACH ROW EXECUTE FUNCTION update_payment_updated_at();

DROP TRIGGER IF EXISTS update_payment_notification_queue_updated_at ON payment_notification_queue;
CREATE TRIGGER update_payment_notification_queue_updated_at
    BEFORE UPDATE ON payment_notification_queue FOR EACH ROW EXECUTE FUNCTION update_payment_updated_at();

-- ========================================
-- DONE! Run verification:
-- ========================================
-- SELECT table_name FROM information_schema.tables 
-- WHERE table_schema = 'public' AND table_name LIKE 'payment%';
--
-- SELECT payment_category, name, amount FROM payment_configurations;
-- ========================================

