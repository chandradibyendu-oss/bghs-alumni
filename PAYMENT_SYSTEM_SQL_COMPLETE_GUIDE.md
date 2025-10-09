# 🗄️ Payment System - Complete SQL Scripts Guide

## 📋 **All SQL Scripts (Execute in This Order)**

Execute these scripts in your Supabase SQL Editor in the exact order shown below.

---

## **Script 1: Main Payment System Schema** ✅ CRITICAL

**File:** `payment-system-schema.sql`  
**Purpose:** Creates all payment tables and updates existing tables

### **What It Creates:**

#### **New Tables (4):**
1. **`payment_configurations`** - Payment settings (amounts, categories)
2. **`payment_transactions`** - All payment records
3. **`payment_receipts`** - Generated receipts
4. **`payment_notification_queue`** - Email queue

#### **Updates Existing Tables:**

**`profiles` table:**
```sql
-- Adds these columns:
- payment_status TEXT ('pending', 'completed', 'failed', 'not_required')
- registration_payment_status TEXT ('pending', 'paid', 'waived', 'not_required')
- registration_payment_transaction_id UUID (FK to payment_transactions)
```

**`events` table:**
```sql
-- Adds these columns:
- requires_payment BOOLEAN (default FALSE)
- payment_amount DECIMAL(10,2)
- payment_currency TEXT (default 'INR')
- payment_config_id UUID (FK to payment_configurations)
```

**`event_registrations` table:**
```sql
-- Adds these columns:
- payment_status TEXT ('pending', 'paid', 'waived', 'not_required')
- payment_amount DECIMAL(10,2)
- payment_currency TEXT
- payment_transaction_id UUID (FK to payment_transactions)
- registration_confirmed BOOLEAN (default FALSE)
```

**`donations` table:**
```sql
-- Adds these columns:
- payment_transaction_id UUID (FK to payment_transactions)

-- Removes old column:
- stripe_payment_intent_id (if exists)

-- Updates constraint:
- payment_status CHECK constraint updated to include new statuses
```

### **What It Also Creates:**
- ✅ Indexes for performance
- ✅ RLS (Row Level Security) policies
- ✅ Helper functions:
  - `generate_receipt_number()` - Creates unique receipt IDs
  - `update_payment_configurations_updated_at()` - Auto-updates timestamps
- ✅ Triggers for auto-updating timestamps

### **Execution:**
```sql
-- Run the entire file in Supabase SQL Editor
-- File: payment-system-schema.sql
-- Safe to run multiple times (uses IF NOT EXISTS)
```

---

## **Script 2: Payment Tokens Table** ✅ CRITICAL

**File:** `add-payment-tokens-table.sql`  
**Purpose:** Creates table for secure payment links (registration payments)

### **What It Creates:**

**New Table:**
```sql
payment_tokens (
  id UUID PRIMARY KEY,
  token_hash TEXT NOT NULL UNIQUE,
  user_id UUID NOT NULL,
  payment_config_id UUID,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'INR',
  token_type TEXT ('registration_payment', 'other'),
  used BOOLEAN DEFAULT FALSE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB
)
```

### **What It's Used For:**
- Secure payment links for registration (no login required)
- 72-hour expiry tokens
- One-time use tokens
- Token validation for payment pages

### **Execution:**
```sql
-- Run the entire file in Supabase SQL Editor
-- File: add-payment-tokens-table.sql
-- Safe to run multiple times (uses IF NOT EXISTS)
```

---

## **Script 3: Verification Script** ✅ OPTIONAL (for testing)

**File:** `payment-system-verify.sql`  
**Purpose:** Verifies that all tables, columns, and policies were created correctly

### **What It Does:**
- ✅ Checks if all 4 payment tables exist
- ✅ Checks if columns were added to existing tables
- ✅ Verifies indexes were created
- ✅ Verifies RLS policies exist
- ✅ Verifies helper functions exist
- ✅ Counts rows in each table

### **Execution:**
```sql
-- Run after Scripts 1 & 2
-- File: payment-system-verify.sql
-- Displays verification results
```

### **Expected Output:**
```
✓ Table payment_configurations exists
✓ Table payment_transactions exists
✓ Table payment_receipts exists
✓ Table payment_notification_queue exists
✓ Table payment_tokens exists
✓ profiles.payment_status column exists
✓ profiles.registration_payment_status column exists
✓ events.requires_payment column exists
✓ event_registrations.payment_status column exists
✓ donations.payment_transaction_id column exists
... (and more)
```

---

## **Script 4: Rollback Script** ⚠️ DANGER (only if needed)

**File:** `payment-system-rollback.sql`  
**Purpose:** Completely removes all payment system changes

### **⚠️ WARNING:**
- This will **DELETE ALL PAYMENT DATA**
- This will **DROP ALL 5 PAYMENT TABLES**
- This will **REMOVE COLUMNS** from existing tables
- **USE ONLY IF YOU NEED TO START OVER**

### **Execution:**
```sql
-- ONLY run if you need to completely undo the payment system
-- File: payment-system-rollback.sql
-- DESTRUCTIVE: Cannot be undone!
```

---

## 🚀 **Quick Setup Guide**

### **Step 1: Execute Main Schema**
```sql
-- In Supabase SQL Editor, run:
```
Open `payment-system-schema.sql` → Copy all → Paste in SQL Editor → Run

**Expected:** ✅ All tables, columns, policies created

---

### **Step 2: Execute Tokens Table**
```sql
-- In Supabase SQL Editor, run:
```
Open `add-payment-tokens-table.sql` → Copy all → Paste in SQL Editor → Run

**Expected:** ✅ `payment_tokens` table created

---

### **Step 3: Verify Installation** (Optional)
```sql
-- In Supabase SQL Editor, run:
```
Open `payment-system-verify.sql` → Copy all → Paste in SQL Editor → Run

**Expected:** ✅ All checks pass (green checkmarks)

---

### **Step 4: Add Sample Payment Configuration**
```sql
-- In Supabase SQL Editor, run this manually:

INSERT INTO payment_configurations (
  category,
  name,
  description,
  amount,
  currency,
  is_active,
  is_mandatory,
  payment_gateway
) VALUES (
  'registration_fee',
  'Registration',
  'One-time registration fee for alumni membership',
  500.00,
  'INR',
  TRUE,
  TRUE,
  'razorpay'
);
```

**Expected:** ✅ 1 row inserted into `payment_configurations`

---

## 📊 **What Data Gets Created**

### **Initial State (After Scripts):**

**New Tables Created:**
| Table | Rows |
|-------|------|
| payment_configurations | 0 |
| payment_transactions | 0 |
| payment_receipts | 0 |
| payment_notification_queue | 0 |
| payment_tokens | 0 |

**Existing Tables Updated:**
| Table | New Columns Added |
|-------|-------------------|
| profiles | 3 columns |
| events | 4 columns |
| event_registrations | 5 columns |
| donations | 1 column (+ 1 removed) |

---

## 🔍 **How to Check If Scripts Were Executed**

### **Method 1: Check Tables Exist**
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name LIKE 'payment%';
```

**Expected Output:**
```
payment_configurations
payment_transactions
payment_receipts
payment_notification_queue
payment_tokens
```

---

### **Method 2: Check Columns Were Added to profiles**
```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
  AND column_name LIKE '%payment%';
```

**Expected Output:**
```
payment_status | text
registration_payment_status | text
registration_payment_transaction_id | uuid
```

---

### **Method 3: Check Columns Were Added to events**
```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'events' 
  AND column_name LIKE '%payment%';
```

**Expected Output:**
```
requires_payment | boolean
payment_amount | numeric
payment_currency | text
payment_config_id | uuid
```

---

### **Method 4: Check payment_configurations Table**
```sql
SELECT * FROM payment_configurations;
```

**Expected Output:**
- Empty table if you haven't added configurations yet
- OR 1+ rows if you manually inserted sample data

---

## 🆘 **Troubleshooting**

### **Problem: "relation 'payment_configurations' does not exist"**
**Solution:** Script 1 (`payment-system-schema.sql`) was not executed
```sql
-- Run payment-system-schema.sql in Supabase SQL Editor
```

---

### **Problem: "column 'payment_status' does not exist in profiles"**
**Solution:** Script 1 didn't complete successfully
```sql
-- Re-run payment-system-schema.sql
-- Or manually add columns:

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'not_required' 
CHECK (payment_status IN ('pending', 'completed', 'failed', 'not_required'));

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS registration_payment_status TEXT DEFAULT 'pending' 
CHECK (registration_payment_status IN ('pending', 'paid', 'waived', 'not_required'));

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS registration_payment_transaction_id UUID 
REFERENCES payment_transactions(id) ON DELETE SET NULL;
```

---

### **Problem: "relation 'payment_tokens' does not exist"**
**Solution:** Script 2 (`add-payment-tokens-table.sql`) was not executed
```sql
-- Run add-payment-tokens-table.sql in Supabase SQL Editor
```

---

### **Problem: RLS policy errors**
**Solution:** RLS policies might conflict with existing ones
```sql
-- Drop old policies first (if any):
DROP POLICY IF EXISTS "Anyone can view active payment configs" ON payment_configurations;
DROP POLICY IF EXISTS "Admins can manage payment configs" ON payment_configurations;
-- (and so on for other policies)

-- Then re-run payment-system-schema.sql
```

---

## 📝 **Summary Checklist**

Before proceeding with payment testing, verify:

- [ ] ✅ `payment_configurations` table exists
- [ ] ✅ `payment_transactions` table exists
- [ ] ✅ `payment_receipts` table exists
- [ ] ✅ `payment_notification_queue` table exists
- [ ] ✅ `payment_tokens` table exists
- [ ] ✅ `profiles.payment_status` column exists
- [ ] ✅ `profiles.registration_payment_status` column exists
- [ ] ✅ `events.requires_payment` column exists
- [ ] ✅ `event_registrations.payment_status` column exists
- [ ] ✅ `donations.payment_transaction_id` column exists
- [ ] ✅ At least 1 row in `payment_configurations` (registration config)

---

## 🎯 **Next Steps After SQL Setup**

1. ✅ Execute SQL scripts (this guide)
2. ✅ Verify tables exist (verification script)
3. ✅ Add sample payment configuration
4. ✅ Configure RazorPay keys in `.env.local`
5. ✅ Test payment workflow (see `PAYMENT_WORKFLOW_COMPLETE.md`)

---

**All SQL scripts are ready to use. Just run them in order!** 🚀

