# 🧪 Localhost Payment Testing Guide

## ✅ **You Can Test Everything Without Email Sending!**

The payment system **queues** emails in the database. You can manually extract the payment link and test the full flow.

---

## 🎯 **Complete Localhost Testing Process**

### **Step 1: Setup Payment Configuration** ✅

1. Login as admin: `http://localhost:3000/login`
2. Go to: `http://localhost:3000/admin/payments`
3. Create configuration:
   - **Category**: Registration Fee
   - **Name**: Registration Fee
   - **Amount**: 500
   - **Currency**: INR
   - **Active**: ✅ Checked
   - **Mandatory**: ✅ Checked
4. Click "Create Payment Configuration"

**Verify:**
```sql
SELECT * FROM payment_configurations WHERE category = 'registration_fee';
```

---

### **Step 2: Create Test User (or Use Existing)** ✅

**Option A: Use Admin UI**
1. Go to: `http://localhost:3000/admin/users`
2. Click "Add New User"
3. Fill in details (use your email for testing)
4. User will be created with `is_approved = false`

**Option B: Manual SQL**
```sql
-- Check existing test users
SELECT id, email, first_name, last_name, is_approved, payment_status 
FROM profiles 
WHERE role = 'alumni_member'
ORDER BY created_at DESC
LIMIT 5;
```

---

### **Step 3: Approve User (Triggers Payment Workflow)** ✅

1. In `/admin/users`, find your test user
2. Click the "Pending" button to approve
3. **Watch your terminal console** for:
   ```
   [Payment Workflow] Payment link sent to test@example.com for registration approval
   ```

**If you see this, the workflow is working!** ✅

---

### **Step 4: Extract Payment Link from Database** 🔍

Run this in Supabase SQL Editor:

```sql
-- Get the latest payment link
SELECT 
    id,
    recipient_user_id,
    notification_type,
    status,
    created_at,
    metadata->>'payment_link' as payment_link,
    metadata->>'email' as recipient_email,
    metadata->>'amount' as amount,
    metadata->>'currency' as currency,
    metadata->>'subject' as email_subject
FROM payment_notification_queue
WHERE notification_type = 'payment_link'
  AND status = 'queued'
ORDER BY created_at DESC
LIMIT 1;
```

**Expected Output:**
```
payment_link: http://localhost:3000/payments/registration/abc123token456...
recipient_email: test@example.com
amount: 500
currency: INR
subject: Registration Approved - Complete Payment of ₹500
```

**Copy the `payment_link` value!** This is what would have been emailed.

---

### **Step 5: Test Payment Link (No Login Required!)** 🎯

1. **Copy the payment link** from Step 4
2. **Open incognito/private browser window** (to simulate user without login)
3. **Paste the payment link** in the address bar
4. Press Enter

**Expected:** You should see a payment page with:
- User's name
- Amount: ₹500
- Currency: INR
- "Pay ₹500" button
- Token expiry info

**If you see this page, the token system is working!** ✅

---

### **Step 6: Complete Test Payment** 💳

1. Click the "Pay ₹500" button
2. RazorPay modal opens
3. Use **RazorPay Test Card**:
   - Card: `4111 1111 1111 1111`
   - CVV: Any 3 digits (e.g., `123`)
   - Expiry: Any future date (e.g., `12/25`)
   - Name: Any name
4. Click "Pay"
5. Payment succeeds!
6. You're redirected to success page

---

### **Step 7: Verify Account Activation** ✅

Check database to confirm everything worked:

```sql
-- Check user status
SELECT 
    email,
    first_name,
    last_name,
    is_approved,
    is_active,
    payment_status,
    registration_payment_status
FROM profiles
WHERE email = 'test@example.com';
```

**Expected After Payment:**
```
is_approved: true
is_active: true  ← ACTIVATED!
payment_status: completed
registration_payment_status: paid
```

---

### **Step 8: Verify Payment Transaction** ✅

```sql
-- Check transaction record
SELECT 
    id,
    amount,
    currency,
    payment_status,
    razorpay_order_id,
    razorpay_payment_id,
    payment_method,
    completed_at
FROM payment_transactions
WHERE user_id = (SELECT id FROM profiles WHERE email = 'test@example.com')
ORDER BY created_at DESC
LIMIT 1;
```

**Expected:**
```
payment_status: success
razorpay_payment_id: pay_xxxxx...
payment_method: card
completed_at: [timestamp]
```

---

### **Step 9: Verify Token Was Marked as Used** ✅

```sql
-- Check payment token
SELECT 
    token_hash,
    used,
    used_at,
    expires_at,
    amount,
    currency
FROM payment_tokens
WHERE user_id = (SELECT id FROM profiles WHERE email = 'test@example.com')
ORDER BY created_at DESC
LIMIT 1;
```

**Expected:**
```
used: true
used_at: [timestamp]
```

---

### **Step 10: Test User Login** ✅

1. Open new incognito window
2. Go to: `http://localhost:3000/login`
3. Login with the test user credentials
4. **Should redirect to dashboard**
5. **No payment banner** (because payment is completed!)
6. **Full access to all features** ✅

---

## 🔍 **Verification Checklist**

After completing the test, verify:

- [ ] ✅ Console shows: `[Payment Workflow] Payment link sent...`
- [ ] ✅ `payment_notification_queue` has 1 row (queued email)
- [ ] ✅ `payment_tokens` has 1 row (secure token)
- [ ] ✅ Payment link opens without login
- [ ] ✅ RazorPay modal works with test card
- [ ] ✅ Payment succeeds
- [ ] ✅ User `is_active = true`
- [ ] ✅ User `payment_status = completed`
- [ ] ✅ Transaction record exists
- [ ] ✅ Token marked as `used = true`
- [ ] ✅ User can login successfully
- [ ] ✅ Dashboard shows no payment banner

---

## 📧 **Email Testing (Manual Simulation)**

Since emails aren't sent automatically, you can:

### **Option 1: View Email HTML in Browser**

```sql
-- Get the email HTML
SELECT 
    metadata->>'subject' as subject,
    metadata->>'body' as html_body
FROM payment_notification_queue
WHERE notification_type = 'payment_link'
ORDER BY created_at DESC
LIMIT 1;
```

**Copy the `html_body` → Save as `test-email.html` → Open in browser**

You'll see the actual email that would be sent!

---

### **Option 2: Manual Email Testing (If You Have SMTP)**

If you want to actually send test emails:

1. Get email data from database
2. Use a tool like **Mailtrap** (free) or **Gmail SMTP**
3. Send the email manually with the queued content

---

## 🧪 **Test Scenarios**

### **Scenario A: First-Time User Approval**
```
1. Create user (is_approved = false)
2. Approve user
3. ✅ Email queued
4. ✅ Token generated
5. ✅ payment_status = 'pending'
6. Extract link from DB
7. Complete payment
8. ✅ Account activated
```

### **Scenario B: Re-Approval After Payment**
```
1. User already paid (payment_status = 'completed')
2. Disapprove user
3. Re-approve user
4. ✅ Console: "already completed payment, skipping email"
5. ✅ No new email queued
```

### **Scenario C: Re-Approval Before Payment**
```
1. User approved but not paid (payment_status = 'pending')
2. Disapprove user
3. Re-approve user
4. ✅ New email queued
5. ✅ New token generated
6. Old token still works (until expired)
```

### **Scenario D: Expired Token**
```
1. Generate payment link
2. Wait 72 hours (or manually update expires_at in DB)
3. Try to open payment link
4. ✅ Shows "Token expired" error
```

---

## 🐛 **Troubleshooting**

### **Problem: Console doesn't show "[Payment Workflow]" message**

**Check:**
```sql
-- Is payment config active?
SELECT * FROM payment_configurations 
WHERE category = 'registration_fee' AND is_active = true;
```

**Fix:** Make sure config exists, is active, and mandatory

---

### **Problem: payment_notification_queue is empty**

**Possible causes:**
1. Payment config not found
2. User already paid
3. Error in workflow (check terminal for errors)

**Debug:**
```sql
-- Check user status
SELECT email, is_approved, payment_status, registration_payment_status 
FROM profiles WHERE id = 'user-id-here';
```

---

### **Problem: Payment link gives 404**

**Check:**
```sql
-- Verify token exists
SELECT * FROM payment_tokens 
WHERE used = false AND expires_at > NOW()
ORDER BY created_at DESC;
```

**Fix:** Make sure you copied the full link including the token

---

### **Problem: "Token invalid" error**

**Possible causes:**
1. Token already used (`used = true`)
2. Token expired (`expires_at < NOW()`)
3. Token hash mismatch

**Check:**
```sql
SELECT token_hash, used, expires_at, created_at 
FROM payment_tokens 
ORDER BY created_at DESC LIMIT 1;
```

---

## 📊 **Quick Status Check Query**

**Run this anytime to see payment workflow status:**

```sql
SELECT 
    p.email,
    p.first_name || ' ' || p.last_name as name,
    p.is_approved,
    p.is_active,
    p.payment_status,
    p.registration_payment_status,
    (SELECT COUNT(*) FROM payment_notification_queue pnq WHERE pnq.recipient_user_id = p.id) as queued_emails,
    (SELECT COUNT(*) FROM payment_tokens pt WHERE pt.user_id = p.id) as tokens_generated,
    (SELECT COUNT(*) FROM payment_transactions tx WHERE tx.user_id = p.id AND tx.payment_status = 'success') as successful_payments
FROM profiles p
WHERE p.role = 'alumni_member'
ORDER BY p.created_at DESC
LIMIT 10;
```

---

## 🎉 **Success Indicators**

You'll know the payment system is working when:

1. ✅ **Console Logs**: `[Payment Workflow] Payment link sent...`
2. ✅ **Database**: Row in `payment_notification_queue`
3. ✅ **Database**: Row in `payment_tokens`
4. ✅ **Payment Page**: Opens without login
5. ✅ **RazorPay**: Test payment succeeds
6. ✅ **Database**: User activated (`is_active = true`)
7. ✅ **Dashboard**: User can login, no payment banner

---

## 🚀 **Ready to Test!**

**Your Setup:**
- ✅ Build successful
- ✅ Server running on `localhost:3000`
- ✅ Application code matches DB schema
- ✅ RazorPay test keys configured

**Next:**
1. Run `FIX_NOTIFICATION_QUEUE_AND_COMPLETE_SETUP.sql` in Supabase
2. Follow testing steps above
3. Extract payment link from database
4. Test the full flow!

**No email server needed for testing!** 🎯

