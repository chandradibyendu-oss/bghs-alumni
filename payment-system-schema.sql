-- ========================================
-- BGHS Alumni Payment System - Database Schema
-- ========================================
-- This script creates all necessary tables, indexes, and policies for the payment system
-- Safe to run multiple times (uses IF NOT EXISTS)
-- Run this in Supabase SQL Editor

-- ========================================
-- SECTION 1: PAYMENT CONFIGURATION
-- ========================================

-- Payment configurations table - stores global payment settings per category
CREATE TABLE IF NOT EXISTS payment_configurations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    
    -- Category and identification
    category TEXT NOT NULL CHECK (category IN ('registration_fee', 'event_fee', 'donation', 'membership_renewal', 'other')),
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
    UNIQUE(category, name)
);

-- Indexes for payment_configurations
CREATE INDEX IF NOT EXISTS idx_payment_configurations_category ON payment_configurations(category);
CREATE INDEX IF NOT EXISTS idx_payment_configurations_active ON payment_configurations(is_active) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_payment_configurations_created_at ON payment_configurations(created_at DESC);

-- ========================================
-- SECTION 2: PAYMENT TRANSACTIONS
-- ========================================

-- Payment transactions table - stores all payment transactions
CREATE TABLE IF NOT EXISTS payment_transactions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    
    -- User and configuration
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    payment_config_id UUID REFERENCES payment_configurations(id) ON DELETE SET NULL,
    
    -- Related entity (what is being paid for)
    related_entity_type TEXT CHECK (related_entity_type IN ('registration', 'event', 'donation', 'membership', 'other')),
    related_entity_id UUID, -- FK to events/donations/etc (not enforced as it can be multiple tables)
    
    -- Payment details
    amount DECIMAL(10,2) NOT NULL CHECK (amount >= 0),
    currency TEXT DEFAULT 'INR' NOT NULL,
    
    -- Payment status
    payment_status TEXT DEFAULT 'initiated' NOT NULL CHECK (
        payment_status IN ('initiated', 'pending', 'success', 'failed', 'cancelled', 'refunded')
    ),
    
    -- RazorPay specific fields
    razorpay_order_id TEXT,
    razorpay_payment_id TEXT,
    razorpay_signature TEXT,
    payment_method TEXT, -- card/upi/netbanking/wallet
    
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

-- Indexes for payment_transactions
CREATE INDEX IF NOT EXISTS idx_payment_transactions_user_id ON payment_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_status ON payment_transactions(payment_status);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_razorpay_order ON payment_transactions(razorpay_order_id) WHERE razorpay_order_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_payment_transactions_razorpay_payment ON payment_transactions(razorpay_payment_id) WHERE razorpay_payment_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_payment_transactions_entity ON payment_transactions(related_entity_type, related_entity_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_created_at ON payment_transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_completed_at ON payment_transactions(completed_at DESC) WHERE completed_at IS NOT NULL;

-- ========================================
-- SECTION 3: PAYMENT RECEIPTS
-- ========================================

-- Payment receipts table - stores generated receipts
CREATE TABLE IF NOT EXISTS payment_receipts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    
    -- Link to transaction
    transaction_id UUID REFERENCES payment_transactions(id) ON DELETE CASCADE NOT NULL UNIQUE,
    
    -- Receipt details
    receipt_number TEXT NOT NULL UNIQUE,
    pdf_url TEXT, -- Stored in Supabase Storage
    
    -- Timestamps
    issued_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Indexes for payment_receipts
CREATE INDEX IF NOT EXISTS idx_payment_receipts_transaction_id ON payment_receipts(transaction_id);
CREATE INDEX IF NOT EXISTS idx_payment_receipts_receipt_number ON payment_receipts(receipt_number);
CREATE INDEX IF NOT EXISTS idx_payment_receipts_issued_at ON payment_receipts(issued_at DESC);

-- ========================================
-- SECTION 4: PAYMENT NOTIFICATIONS
-- ========================================

-- Payment notification queue table - manages payment-related notifications
CREATE TABLE IF NOT EXISTS payment_notification_queue (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    
    -- Links
    transaction_id UUID REFERENCES payment_transactions(id) ON DELETE CASCADE NOT NULL,
    recipient_user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    
    -- Notification details
    notification_type TEXT NOT NULL CHECK (
        notification_type IN ('payment_initiated', 'payment_link', 'payment_success', 'payment_failed', 'payment_reminder', 'receipt_generated')
    ),
    channel TEXT NOT NULL CHECK (channel IN ('email', 'sms', 'push', 'in_app')),
    
    -- Status
    status TEXT DEFAULT 'queued' NOT NULL CHECK (status IN ('queued', 'sent', 'failed', 'retry')),
    retry_count INTEGER DEFAULT 0,
    max_retries INTEGER DEFAULT 3,
    
    -- Scheduling
    scheduled_for TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    sent_at TIMESTAMP WITH TIME ZONE,
    
    -- Error handling
    error_message TEXT,
    
    -- Metadata
    metadata JSONB DEFAULT '{}'::jsonb,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Indexes for payment_notification_queue
CREATE INDEX IF NOT EXISTS idx_payment_notifications_transaction ON payment_notification_queue(transaction_id);
CREATE INDEX IF NOT EXISTS idx_payment_notifications_recipient ON payment_notification_queue(recipient_user_id);
CREATE INDEX IF NOT EXISTS idx_payment_notifications_status ON payment_notification_queue(status);
CREATE INDEX IF NOT EXISTS idx_payment_notifications_scheduled ON payment_notification_queue(scheduled_for) WHERE status = 'queued';
CREATE INDEX IF NOT EXISTS idx_payment_notifications_type ON payment_notification_queue(notification_type);

-- ========================================
-- SECTION 5: MODIFY EXISTING TABLES
-- ========================================

-- Add payment-related columns to events table
ALTER TABLE events 
    ADD COLUMN IF NOT EXISTS requires_payment BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS payment_config_id UUID REFERENCES payment_configurations(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS payment_amount DECIMAL(10,2) CHECK (payment_amount >= 0),
    ADD COLUMN IF NOT EXISTS payment_deadline TIMESTAMP WITH TIME ZONE,
    ADD COLUMN IF NOT EXISTS early_bird_amount DECIMAL(10,2) CHECK (early_bird_amount >= 0),
    ADD COLUMN IF NOT EXISTS early_bird_deadline TIMESTAMP WITH TIME ZONE;

-- Add index for events requiring payment
CREATE INDEX IF NOT EXISTS idx_events_requires_payment ON events(requires_payment) WHERE requires_payment = TRUE;

-- Add payment-related columns to event_registrations table
ALTER TABLE event_registrations
    ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'not_required' CHECK (
        payment_status IN ('not_required', 'pending', 'paid', 'failed', 'waived')
    ),
    ADD COLUMN IF NOT EXISTS payment_transaction_id UUID REFERENCES payment_transactions(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS payment_amount DECIMAL(10,2) CHECK (payment_amount >= 0),
    ADD COLUMN IF NOT EXISTS registration_confirmed BOOLEAN DEFAULT TRUE;

-- Add index for event registrations by payment status
CREATE INDEX IF NOT EXISTS idx_event_registrations_payment_status ON event_registrations(payment_status);
CREATE INDEX IF NOT EXISTS idx_event_registrations_payment_transaction ON event_registrations(payment_transaction_id) WHERE payment_transaction_id IS NOT NULL;

-- Add payment-related columns to profiles table
ALTER TABLE profiles
    ADD COLUMN IF NOT EXISTS registration_payment_status TEXT DEFAULT 'pending' CHECK (
        registration_payment_status IN ('pending', 'paid', 'waived', 'not_required')
    ),
    ADD COLUMN IF NOT EXISTS registration_payment_transaction_id UUID REFERENCES payment_transactions(id) ON DELETE SET NULL;

-- Add index for profiles by registration payment status
CREATE INDEX IF NOT EXISTS idx_profiles_registration_payment_status ON profiles(registration_payment_status);

-- Update donations table to use new payment system
ALTER TABLE donations
    DROP COLUMN IF EXISTS stripe_payment_intent_id,
    ADD COLUMN IF NOT EXISTS payment_transaction_id UUID REFERENCES payment_transactions(id) ON DELETE SET NULL;

-- Update donations payment_status to match new statuses
-- Note: This is a safe operation that expands the enum-like constraint
ALTER TABLE donations DROP CONSTRAINT IF EXISTS donations_payment_status_check;
ALTER TABLE donations ADD CONSTRAINT donations_payment_status_check 
    CHECK (payment_status IN ('initiated', 'pending', 'completed', 'failed', 'cancelled', 'refunded'));

-- Add index for donations by payment transaction
CREATE INDEX IF NOT EXISTS idx_donations_payment_transaction ON donations(payment_transaction_id) WHERE payment_transaction_id IS NOT NULL;

-- ========================================
-- SECTION 6: ROW LEVEL SECURITY (RLS)
-- ========================================

-- Enable RLS on new tables
ALTER TABLE payment_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_notification_queue ENABLE ROW LEVEL SECURITY;

-- RLS Policies for payment_configurations
-- Anyone can view active payment configurations
CREATE POLICY "Anyone can view active payment configs" ON payment_configurations
    FOR SELECT USING (is_active = TRUE);

-- Admins can manage payment configurations
CREATE POLICY "Admins can manage payment configs" ON payment_configurations
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role IN ('super_admin', 'admin')
        )
    );

-- RLS Policies for payment_transactions
-- Users can view their own transactions
CREATE POLICY "Users can view own transactions" ON payment_transactions
    FOR SELECT USING (auth.uid() = user_id);

-- Users can create their own transactions
CREATE POLICY "Users can create own transactions" ON payment_transactions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own pending transactions (for verification)
CREATE POLICY "Users can update own pending transactions" ON payment_transactions
    FOR UPDATE USING (
        auth.uid() = user_id 
        AND payment_status IN ('initiated', 'pending')
    );

-- Admins can view all transactions
CREATE POLICY "Admins can view all transactions" ON payment_transactions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role IN ('super_admin', 'admin', 'content_moderator')
        )
    );

-- Admins can update any transaction (for manual verification, refunds)
CREATE POLICY "Admins can update transactions" ON payment_transactions
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role IN ('super_admin', 'admin')
        )
    );

-- RLS Policies for payment_receipts
-- Users can view their own receipts (via transaction)
CREATE POLICY "Users can view own receipts" ON payment_receipts
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM payment_transactions 
            WHERE payment_transactions.id = payment_receipts.transaction_id 
            AND payment_transactions.user_id = auth.uid()
        )
    );

-- Admins can view all receipts
CREATE POLICY "Admins can view all receipts" ON payment_receipts
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role IN ('super_admin', 'admin', 'content_moderator')
        )
    );

-- System can insert receipts (service role)
CREATE POLICY "System can insert receipts" ON payment_receipts
    FOR INSERT WITH CHECK (true);

-- RLS Policies for payment_notification_queue
-- Users can view their own notifications
CREATE POLICY "Users can view own payment notifications" ON payment_notification_queue
    FOR SELECT USING (auth.uid() = recipient_user_id);

-- Admins can view all notifications
CREATE POLICY "Admins can view all payment notifications" ON payment_notification_queue
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role IN ('super_admin', 'admin', 'content_moderator')
        )
    );

-- System can insert and update notifications (service role)
CREATE POLICY "System can manage notifications" ON payment_notification_queue
    FOR ALL WITH CHECK (true);

-- ========================================
-- SECTION 7: HELPER FUNCTIONS
-- ========================================

-- Function to generate unique receipt number
CREATE OR REPLACE FUNCTION generate_receipt_number()
RETURNS TEXT AS $$
DECLARE
    receipt_num TEXT;
    year_prefix TEXT;
    sequence_num INTEGER;
BEGIN
    -- Format: BGHS/YYYY/NNNNNN (e.g., BGHS/2024/000001)
    year_prefix := 'BGHS/' || EXTRACT(YEAR FROM NOW()) || '/';
    
    -- Get the next sequence number for this year
    SELECT COALESCE(MAX(
        CAST(SUBSTRING(receipt_number FROM LENGTH(year_prefix) + 1) AS INTEGER)
    ), 0) + 1
    INTO sequence_num
    FROM payment_receipts
    WHERE receipt_number LIKE year_prefix || '%';
    
    -- Format with leading zeros (6 digits)
    receipt_num := year_prefix || LPAD(sequence_num::TEXT, 6, '0');
    
    RETURN receipt_num;
END;
$$ LANGUAGE plpgsql;

-- Function to get payment statistics (for admin dashboard)
CREATE OR REPLACE FUNCTION get_payment_statistics(start_date TIMESTAMP DEFAULT NULL, end_date TIMESTAMP DEFAULT NULL)
RETURNS TABLE(
    total_transactions BIGINT,
    successful_payments BIGINT,
    failed_payments BIGINT,
    pending_payments BIGINT,
    total_revenue DECIMAL(10,2),
    total_refunded DECIMAL(10,2),
    average_transaction_value DECIMAL(10,2),
    success_rate DECIMAL(5,2)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*)::BIGINT as total_transactions,
        COUNT(*) FILTER (WHERE payment_status = 'success')::BIGINT as successful_payments,
        COUNT(*) FILTER (WHERE payment_status = 'failed')::BIGINT as failed_payments,
        COUNT(*) FILTER (WHERE payment_status IN ('initiated', 'pending'))::BIGINT as pending_payments,
        COALESCE(SUM(amount) FILTER (WHERE payment_status = 'success'), 0) as total_revenue,
        COALESCE(SUM(amount) FILTER (WHERE payment_status = 'refunded'), 0) as total_refunded,
        COALESCE(AVG(amount) FILTER (WHERE payment_status = 'success'), 0) as average_transaction_value,
        CASE 
            WHEN COUNT(*) FILTER (WHERE payment_status IN ('success', 'failed')) > 0 
            THEN ROUND(
                (COUNT(*) FILTER (WHERE payment_status = 'success')::DECIMAL / 
                 COUNT(*) FILTER (WHERE payment_status IN ('success', 'failed'))::DECIMAL) * 100, 
                2
            )
            ELSE 0
        END as success_rate
    FROM payment_transactions
    WHERE 
        (start_date IS NULL OR created_at >= start_date)
        AND (end_date IS NULL OR created_at <= end_date);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user has pending payments
CREATE OR REPLACE FUNCTION user_has_pending_payments(p_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 
        FROM payment_transactions 
        WHERE user_id = p_user_id 
        AND payment_status IN ('initiated', 'pending')
        AND created_at > NOW() - INTERVAL '7 days' -- Only check recent payments
    );
END;
$$ LANGUAGE plpgsql;

-- Function to get user payment summary
CREATE OR REPLACE FUNCTION get_user_payment_summary(p_user_id UUID)
RETURNS TABLE(
    total_paid DECIMAL(10,2),
    total_pending DECIMAL(10,2),
    total_failed BIGINT,
    last_payment_date TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COALESCE(SUM(amount) FILTER (WHERE payment_status = 'success'), 0) as total_paid,
        COALESCE(SUM(amount) FILTER (WHERE payment_status IN ('initiated', 'pending')), 0) as total_pending,
        COUNT(*) FILTER (WHERE payment_status = 'failed')::BIGINT as total_failed,
        MAX(completed_at) FILTER (WHERE payment_status = 'success') as last_payment_date
    FROM payment_transactions
    WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========================================
-- SECTION 8: TRIGGERS
-- ========================================

-- Trigger function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_payment_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply update triggers to all payment tables
DROP TRIGGER IF EXISTS update_payment_configurations_timestamp ON payment_configurations;
CREATE TRIGGER update_payment_configurations_timestamp
    BEFORE UPDATE ON payment_configurations
    FOR EACH ROW EXECUTE FUNCTION update_payment_updated_at();

DROP TRIGGER IF EXISTS update_payment_transactions_timestamp ON payment_transactions;
CREATE TRIGGER update_payment_transactions_timestamp
    BEFORE UPDATE ON payment_transactions
    FOR EACH ROW EXECUTE FUNCTION update_payment_updated_at();

DROP TRIGGER IF EXISTS update_payment_notification_queue_timestamp ON payment_notification_queue;
CREATE TRIGGER update_payment_notification_queue_timestamp
    BEFORE UPDATE ON payment_notification_queue
    FOR EACH ROW EXECUTE FUNCTION update_payment_updated_at();

-- ========================================
-- SECTION 9: INITIAL DATA (OPTIONAL)
-- ========================================

-- Insert default payment configurations (commented out - enable as needed)
/*
INSERT INTO payment_configurations (category, name, description, amount, is_active, is_mandatory, created_by)
VALUES 
    ('registration_fee', 'New Member Registration', 'One-time registration fee for new alumni members', 500.00, TRUE, TRUE, NULL),
    ('membership_renewal', 'Annual Membership Renewal', 'Annual renewal fee for existing members', 300.00, TRUE, FALSE, NULL),
    ('donation', 'General Donation', 'General donation to alumni association', 0.00, TRUE, FALSE, NULL)
ON CONFLICT (category, name) DO NOTHING;
*/

-- ========================================
-- VERIFICATION QUERIES
-- ========================================

-- Run these queries to verify the schema was created successfully:

-- Check all tables exist
DO $$
BEGIN
    RAISE NOTICE 'Verifying payment system tables...';
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'payment_configurations') THEN
        RAISE NOTICE '✓ payment_configurations table created';
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'payment_transactions') THEN
        RAISE NOTICE '✓ payment_transactions table created';
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'payment_receipts') THEN
        RAISE NOTICE '✓ payment_receipts table created';
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'payment_notification_queue') THEN
        RAISE NOTICE '✓ payment_notification_queue table created';
    END IF;
    
    RAISE NOTICE 'Payment system schema installation complete!';
END $$;

-- ========================================
-- END OF SCHEMA
-- ========================================
