# Payment System Database Setup Guide

## 📋 Overview

This guide walks you through setting up the database schema for the BGHS Alumni Payment System. The payment system integrates with RazorPay and extends your existing Supabase database.

## 🗂️ SQL Scripts Provided

### 1. `payment-system-schema.sql` ✅ MAIN SCRIPT
**Purpose:** Creates all payment system tables, indexes, and policies  
**When to use:** First time setup or when updating to payment system  
**Safe to run:** Yes, uses `IF NOT EXISTS` clauses  
**Duration:** ~10-15 seconds

### 2. `payment-system-verify.sql` 🔍 VERIFICATION
**Purpose:** Verifies the schema was installed correctly  
**When to use:** After running the main schema script  
**Safe to run:** Yes, read-only queries  
**Duration:** ~5 seconds

### 3. `payment-system-rollback.sql` ⚠️ ROLLBACK
**Purpose:** Completely removes the payment system from database  
**When to use:** Only if you need to undo everything  
**Safe to run:** ⚠️ NO - Permanently deletes all payment data!  
**Duration:** ~5 seconds

---

## 🚀 Installation Steps

### Step 1: Backup Your Database (Recommended)

Before making any changes, create a backup:

1. Go to Supabase Dashboard → Settings → Database
2. Click "Database Backups" 
3. Create a manual backup
4. Wait for confirmation

### Step 2: Run the Main Schema Script

1. Open Supabase Dashboard
2. Navigate to **SQL Editor**
3. Create a new query
4. Copy the entire contents of `payment-system-schema.sql`
5. Paste into the editor
6. Click **Run** or press `Ctrl+Enter`
7. Wait for success message

**Expected Output:**
```
✓ payment_configurations table created
✓ payment_transactions table created
✓ payment_receipts table created
✓ payment_notification_queue table created
Payment system schema installation complete!
```

### Step 3: Verify Installation

1. In SQL Editor, create a new query
2. Copy the entire contents of `payment-system-verify.sql`
3. Paste and run
4. Review the output

**Expected Output:**
```
Tables created: 4 / 4
Functions created: 5 / 5
RLS Policies created: [number]
✓ Payment system schema successfully installed!
```

### Step 4: Check the Tables

Verify tables exist in your database:

```sql
SELECT tablename 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename LIKE '%payment%'
ORDER BY tablename;
```

You should see:
- `payment_configurations`
- `payment_notification_queue`
- `payment_receipts`
- `payment_transactions`

---

## 📊 What Gets Created

### New Tables (4)

| Table | Purpose | Records |
|-------|---------|---------|
| `payment_configurations` | Stores payment categories and amounts | Admin-managed |
| `payment_transactions` | All payment transactions and status | User transactions |
| `payment_receipts` | Generated receipt PDFs | One per successful payment |
| `payment_notification_queue` | Payment notification queue | System-managed |

### Modified Tables (4)

| Table | Columns Added | Impact |
|-------|---------------|--------|
| `events` | 6 payment-related columns | No data loss |
| `event_registrations` | 4 payment-related columns | No data loss |
| `profiles` | 2 registration payment columns | No data loss |
| `donations` | 1 column + updated constraint | No data loss |

### Helper Functions (5)

1. `generate_receipt_number()` - Auto-generates receipt numbers
2. `get_payment_statistics()` - Payment analytics
3. `user_has_pending_payments()` - Check user payment status
4. `get_user_payment_summary()` - User payment summary
5. `update_payment_updated_at()` - Timestamp trigger function

### Security Policies (Multiple RLS Policies)

- Users can only see their own payment data
- Admins can see all payment data
- Proper isolation between users
- Service role can manage system operations

---

## 🧪 Testing the Installation

### Test 1: Check Helper Functions

```sql
-- Test receipt number generation
SELECT generate_receipt_number();
-- Expected: BGHS/2024/000001 (or current year)

-- Test payment statistics (will show zeros initially)
SELECT * FROM get_payment_statistics();
-- Expected: All zeros (no payments yet)
```

### Test 2: Check Table Structure

```sql
-- View payment_configurations structure
\d payment_configurations

-- View payment_transactions structure
\d payment_transactions
```

### Test 3: Insert Test Data (Optional)

```sql
-- Create a test payment configuration
INSERT INTO payment_configurations (
    category, 
    name, 
    description, 
    amount, 
    is_active
) VALUES (
    'registration_fee',
    'Test Registration Fee',
    'Test configuration',
    500.00,
    TRUE
);

-- Verify insertion
SELECT * FROM payment_configurations;

-- Clean up test data
DELETE FROM payment_configurations WHERE name = 'Test Registration Fee';
```

---

## 📋 Schema Details

### payment_configurations
Stores global payment settings for different categories.

**Key Columns:**
- `category` - Type of payment (registration_fee, event_fee, donation, etc.)
- `amount` - Payment amount in INR
- `is_active` - Enable/disable this configuration
- `is_mandatory` - Whether payment is required

**Sample Data:**
```sql
INSERT INTO payment_configurations (
    category, name, description, amount, is_active, is_mandatory
) VALUES 
(
    'registration_fee', 
    'New Member Registration', 
    'One-time registration fee for new alumni members', 
    500.00, 
    TRUE, 
    TRUE
);
```

### payment_transactions
Records all payment attempts and completions.

**Key Columns:**
- `user_id` - Who made the payment
- `amount` - Payment amount
- `payment_status` - initiated/pending/success/failed/cancelled/refunded
- `razorpay_order_id` - RazorPay order reference
- `razorpay_payment_id` - RazorPay payment reference
- `related_entity_type` - What this payment is for (event/registration/donation)

**Status Flow:**
```
initiated → pending → success
                   → failed → (can retry)
success → refunded (if admin refunds)
```

### payment_receipts
Stores generated receipt PDFs.

**Key Columns:**
- `transaction_id` - Links to payment_transactions
- `receipt_number` - Unique receipt number (auto-generated)
- `pdf_url` - URL to receipt PDF in Supabase Storage

### payment_notification_queue
Manages payment-related notifications.

**Key Columns:**
- `notification_type` - Type of notification to send
- `channel` - email/sms/push/in_app
- `status` - queued/sent/failed/retry
- `scheduled_for` - When to send

---

## 🔒 Security & Access Control

### Row Level Security (RLS)

All payment tables have RLS enabled:

✅ **Users can:**
- View their own payment transactions
- View their own receipts
- Create payment transactions for themselves
- View active payment configurations

✅ **Admins can:**
- View all payment data
- Manage payment configurations
- Update transaction statuses
- Refund payments

❌ **Users cannot:**
- See other users' payment data
- Modify payment configurations
- Change completed transaction amounts

### Testing RLS Policies

```sql
-- Test as a user (will only see own data)
SELECT * FROM payment_transactions;

-- Test as admin (requires admin role in profiles table)
-- Will see all transactions if you have admin role
```

---

## 🔄 Updating the Schema

If you need to run the schema again (e.g., after updates):

1. The script is **safe to re-run**
2. Uses `IF NOT EXISTS` and `ADD COLUMN IF NOT EXISTS`
3. Won't duplicate data or tables
4. Will only add missing components

```sql
-- Safe to run multiple times
\i payment-system-schema.sql
```

---

## ⚠️ Rollback Instructions

**Only use if you need to completely remove the payment system!**

### Before Rollback:
1. Export payment data if needed
2. Notify users if payments are pending
3. Create a database backup

### Rollback Steps:
1. Open Supabase SQL Editor
2. Run `payment-system-rollback.sql`
3. Verify tables are removed
4. Check dependent features still work

**Warning:** This permanently deletes:
- All payment configurations
- All payment transactions
- All payment receipts
- All payment notifications
- Payment-related columns from existing tables

---

## 🐛 Troubleshooting

### Issue: "relation already exists"
**Solution:** Safe to ignore, means table already created

### Issue: "column already exists"
**Solution:** Safe to ignore, means column already added

### Issue: RLS policy creation fails
**Cause:** Policy might already exist  
**Solution:** Drop and recreate:
```sql
DROP POLICY IF EXISTS "policy_name" ON table_name;
-- Then re-run the schema script
```

### Issue: Function already exists
**Solution:** The script uses `CREATE OR REPLACE`, so just re-run

### Issue: Foreign key constraint fails
**Cause:** Referenced table doesn't exist  
**Solution:** Ensure you've run the main `supabase-schema.sql` first

---

## 📞 Support

If you encounter issues:

1. Check the verification script output
2. Review Supabase error logs
3. Ensure you have proper database permissions
4. Check if main schema (`supabase-schema.sql`) was run first

---

## ✅ Post-Installation Checklist

- [ ] Schema script executed successfully
- [ ] Verification script shows all tables created
- [ ] Helper functions are working
- [ ] RLS policies are in place
- [ ] Test data insertion works
- [ ] No errors in Supabase logs
- [ ] Database backup created
- [ ] Ready to proceed to API implementation

---

## 📈 Next Steps

After successful database setup:

1. **Set up RazorPay account** (test mode first)
2. **Create API routes** for payment operations
3. **Build admin configuration pages**
4. **Implement user payment flows**
5. **Set up notification system**

Refer to the main implementation guide for next steps.

---

**Last Updated:** October 8, 2024  
**Version:** 1.0  
**Compatible with:** Supabase PostgreSQL 15+
