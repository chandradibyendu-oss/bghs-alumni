-- ========================================
-- FIX NOTIFICATION QUEUE & COMPLETE SETUP
-- Matches your existing schema exactly
-- ========================================

BEGIN;

-- ========================================
-- STEP 1: Fix payment_notification_queue to allow NULL transaction_id
-- (For payment links sent before transaction exists)
-- ========================================

-- Make transaction_id nullable (for payment link notifications that happen before transaction)
ALTER TABLE payment_notification_queue 
ALTER COLUMN transaction_id DROP NOT NULL;

-- Add missing indexes
CREATE INDEX IF NOT EXISTS idx_payment_notification_queue_recipient ON payment_notification_queue(recipient_user_id);
CREATE INDEX IF NOT EXISTS idx_payment_notification_queue_status ON payment_notification_queue(status);
CREATE INDEX IF NOT EXISTS idx_payment_notification_queue_created_at ON payment_notification_queue(created_at DESC);

-- ========================================
-- STEP 2: CREATE payment_tokens TABLE (if not exists)
-- ========================================

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
CREATE INDEX IF NOT EXISTS idx_payment_tokens_expiry ON payment_tokens(expires_at) WHERE used = FALSE;

-- ========================================
-- STEP 3: ADD COLUMNS TO profiles TABLE
-- ========================================

ALTER TABLE profiles
    ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'not_required',
    ADD COLUMN IF NOT EXISTS registration_payment_status TEXT DEFAULT 'pending',
    ADD COLUMN IF NOT EXISTS registration_payment_transaction_id UUID;

-- Drop old constraints if they exist
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_payment_status_check;
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_registration_payment_status_check;

-- Add constraints
ALTER TABLE profiles ADD CONSTRAINT profiles_payment_status_check 
CHECK (payment_status IN ('pending', 'completed', 'failed', 'not_required'));

ALTER TABLE profiles ADD CONSTRAINT profiles_registration_payment_status_check 
CHECK (registration_payment_status IN ('pending', 'paid', 'waived', 'not_required'));

-- Add FK
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'profiles_registration_payment_transaction_id_fkey') THEN
        ALTER TABLE profiles ADD CONSTRAINT profiles_registration_payment_transaction_id_fkey 
        FOREIGN KEY (registration_payment_transaction_id) REFERENCES payment_transactions(id) ON DELETE SET NULL;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_profiles_payment_status ON profiles(payment_status);
CREATE INDEX IF NOT EXISTS idx_profiles_registration_payment_status ON profiles(registration_payment_status);

-- ========================================
-- STEP 4: ADD COLUMNS TO events TABLE (if exists)
-- ========================================

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
        
        CREATE INDEX IF NOT EXISTS idx_events_requires_payment ON events(requires_payment) WHERE requires_payment = TRUE;
    END IF;
END $$;

-- ========================================
-- STEP 5: ADD COLUMNS TO event_registrations TABLE (if exists)
-- ========================================

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
        
        CREATE INDEX IF NOT EXISTS idx_event_registrations_payment_status ON event_registrations(payment_status);
        CREATE INDEX IF NOT EXISTS idx_event_registrations_payment_transaction ON event_registrations(payment_transaction_id);
    END IF;
END $$;

-- ========================================
-- STEP 6: UPDATE donations TABLE (if exists)
-- ========================================

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
        
        CREATE INDEX IF NOT EXISTS idx_donations_payment_transaction ON donations(payment_transaction_id);
    END IF;
END $$;

-- ========================================
-- STEP 7: ENABLE RLS ON NEW TABLES
-- ========================================

ALTER TABLE payment_tokens ENABLE ROW LEVEL SECURITY;

-- ========================================
-- STEP 8: CREATE/UPDATE RLS POLICIES
-- ========================================

-- Drop old policies
DROP POLICY IF EXISTS "Users can view own payment notifications" ON payment_notification_queue;
DROP POLICY IF EXISTS "Admins can view all payment notifications" ON payment_notification_queue;
DROP POLICY IF EXISTS "System can manage notifications" ON payment_notification_queue;
DROP POLICY IF EXISTS "Users can view own tokens" ON payment_tokens;
DROP POLICY IF EXISTS "System can manage tokens" ON payment_tokens;

-- payment_notification_queue policies (use recipient_user_id)
CREATE POLICY "Users can view own payment notifications" ON payment_notification_queue
    FOR SELECT USING (auth.uid() = recipient_user_id);

CREATE POLICY "Admins can view all payment notifications" ON payment_notification_queue
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('super_admin', 'admin', 'content_moderator'))
    );

CREATE POLICY "System can manage notifications" ON payment_notification_queue
    FOR ALL WITH CHECK (true);

-- payment_tokens policies
CREATE POLICY "Users can view own tokens" ON payment_tokens
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can manage tokens" ON payment_tokens
    FOR ALL WITH CHECK (true);

-- ========================================
-- STEP 9: HELPER FUNCTIONS & TRIGGERS
-- ========================================

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

COMMIT;

-- ========================================
-- COMPLETE!
-- Verify with:
-- ========================================
-- SELECT table_name FROM information_schema.tables 
-- WHERE table_schema = 'public' AND table_name LIKE 'payment%';
--
-- SELECT column_name FROM information_schema.columns 
-- WHERE table_name = 'profiles' AND column_name LIKE '%payment%';
-- ========================================

