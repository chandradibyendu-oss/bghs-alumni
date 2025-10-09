# 📧 Email Sending Guide - Payment Workflow

## ⚠️ **Important: Emails Are Queued, Not Sent**

Currently, the payment system **queues** emails in the database but **does not actually send them**. This is by design to allow you to implement your preferred email service.

---

## 🔍 **How to Verify Emails Are Being Queued**

### **1. Check Console Logs**
When you approve a user, look for this in your terminal:
```
[Payment Workflow] Payment link sent to user@email.com for registration approval
```

If you see this, the email was successfully queued!

### **2. Check Database**
Run this in Supabase SQL Editor:

```sql
-- View all queued emails
SELECT 
  id,
  email,
  subject,
  notification_type,
  created_at,
  sent_at,
  metadata->>'payment_link' as payment_link
FROM payment_notification_queue
WHERE sent_at IS NULL
ORDER BY created_at DESC;
```

### **3. Check User Payment Status**
```sql
SELECT 
  email,
  first_name,
  last_name,
  is_approved,
  payment_status,
  registration_payment_status
FROM profiles
WHERE email = 'test@example.com';
```

---

## 🎯 **Re-Approval Logic (Updated)**

### **New Behavior:**
When you disapprove and re-approve a user:

✅ **Will Send Email IF:**
- User has NOT completed payment (`payment_status != 'completed'`)
- User has NOT paid registration (`registration_payment_status != 'paid'`)

❌ **Will NOT Send Email IF:**
- User already paid (prevents duplicate payment requests)
- Console shows: `[Payment Workflow] User {id} already completed payment, skipping email`

### **Testing Re-Approval:**

1. **Approve a new user (first time)**
   - ✅ Email queued
   - payment_status → 'pending'

2. **Disapprove**
   - ❌ No email
   - payment_status stays 'pending'

3. **Re-approve (hasn't paid yet)**
   - ✅ New email queued (fresh token generated)
   - payment_status → 'pending'

4. **User pays**
   - payment_status → 'completed'
   - registration_payment_status → 'paid'

5. **Disapprove then re-approve (already paid)**
   - ❌ No email (user already paid!)
   - Console shows: "already completed payment, skipping email"

---

## 📬 **Manual Email Testing (Temporary Solution)**

### **Get Payment Link from Database:**
```sql
SELECT 
  email,
  subject,
  metadata->>'payment_link' as payment_link,
  metadata->>'amount' as amount,
  metadata->>'currency' as currency,
  created_at
FROM payment_notification_queue
WHERE sent_at IS NULL
  AND notification_type = 'payment_link'
ORDER BY created_at DESC
LIMIT 5;
```

### **Test the Payment Flow:**
1. Copy the `payment_link` from the query above
2. Open it in an incognito browser (no login required!)
3. Complete test payment with RazorPay
4. Verify account activation

---

## 🚀 **Implementing Actual Email Sending**

You have several options:

### **Option 1: SendGrid (Popular)**
**Pros:**
- Free tier: 100 emails/day
- Easy to set up
- Good documentation

**Setup:**
```bash
npm install @sendgrid/mail
```

Add to `.env.local`:
```env
SENDGRID_API_KEY=your_sendgrid_api_key
```

### **Option 2: AWS SES (Cost-Effective)**
**Pros:**
- Very cheap ($0.10 per 1,000 emails)
- Reliable
- Good for production

**Setup:**
```bash
npm install @aws-sdk/client-ses
```

### **Option 3: Resend (Modern)**
**Pros:**
- Developer-friendly
- Free tier: 3,000 emails/month
- Simple API

**Setup:**
```bash
npm install resend
```

---

## 🔨 **Creating Email Processor**

Want me to create an email processor? I can add:

### **Background Job Processor:**
```typescript
// lib/email-processor.ts
// Processes queued emails and marks them as sent
```

### **Cron Job (Optional):**
- Runs every 5 minutes
- Processes pending emails
- Updates `sent_at` timestamp

### **Manual Trigger API:**
```
POST /api/admin/process-emails
```
Admin can manually trigger email sending

---

## 🧪 **Quick Test Checklist**

- [ ] Approve a new user
- [ ] Check console for: `[Payment Workflow] Payment link sent...`
- [ ] Check `payment_notification_queue` table (should have 1 row)
- [ ] Check user's `payment_status` (should be 'pending')
- [ ] Get payment link from database
- [ ] Test payment link in incognito browser
- [ ] Complete test payment
- [ ] Verify `payment_status` → 'completed'
- [ ] Verify `is_active` → true

---

## 💡 **Current Workflow Summary**

```
Admin Approves User
        ↓
✅ Email Queued in Database
✅ Payment Token Generated (72hr expiry)
✅ User payment_status → 'pending'
✅ Console log confirmation
        ↓
❌ Email NOT Sent (requires email service)
        ↓
Manual/Automated Email Processor
        ↓
📧 Email Sent to User
        ↓
User Receives Email & Pays
        ↓
Account Activated!
```

---

## 🎯 **Next Steps**

1. **Verify emails are being queued** (check database)
2. **Test payment link manually** (get from database)
3. **Choose email service** (SendGrid/AWS SES/Resend)
4. **Let me know if you want me to implement the email sender!**

---

**Need help implementing email sending? Just ask and I'll add it!** 🚀

