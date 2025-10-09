# Payment System - Environment Configuration

## 📋 Overview

This document outlines the environment variables needed for the payment system integration with RazorPay.

## 🔐 Required Environment Variables

Add these to your `.env.local` file:

```bash
# ========================================
# RAZORPAY CONFIGURATION
# ========================================

# RazorPay API Keys (Get from RazorPay Dashboard)
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxx          # Public key (safe to expose to frontend)
RAZORPAY_KEY_SECRET=your_secret_key_here     # Secret key (NEVER expose to frontend)

# RazorPay Webhook Secret (for webhook signature verification)
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret_here

# RazorPay Mode (test or live)
RAZORPAY_MODE=test                            # Use 'test' for development, 'live' for production

# ========================================
# PAYMENT SYSTEM CONFIGURATION
# ========================================

# Payment Receipt Storage
PAYMENT_RECEIPT_BUCKET=payment-receipts       # Supabase Storage bucket name

# Payment Link Expiry (in hours)
PAYMENT_LINK_EXPIRY_HOURS=72                  # How long payment links remain valid

# Admin Email for Payment Notifications
PAYMENT_ADMIN_EMAIL=admin@alumnibghs.org      # Where to send admin payment notifications

# Currency (default is INR)
PAYMENT_DEFAULT_CURRENCY=INR

# ========================================
# EXISTING CONFIGURATION (ALREADY SET)
# ========================================

# Supabase (Already configured)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Email Service (Already configured)
SENDGRID_API_KEY=your_sendgrid_key
FROM_EMAIL=noreply@alumnibghs.org
ADMIN_EMAIL=admin@alumnibghs.org

# SMS Service (Already configured - optional)
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_PHONE_NUMBER=your_twilio_number
```

---

## 🔑 How to Get RazorPay Credentials

### Step 1: Create RazorPay Account

1. Go to [https://razorpay.com](https://razorpay.com)
2. Click "Sign Up" and create an account
3. Complete KYC verification (required for live mode)
4. Verify your email and phone number

### Step 2: Get API Keys (Test Mode)

1. Login to RazorPay Dashboard
2. Go to **Settings** → **API Keys**
3. Click **Generate Test Key** (for development)
4. Copy the **Key ID** (starts with `rzp_test_`)
5. Copy the **Key Secret** (keep this secure!)
6. Add to `.env.local`:
   ```bash
   RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx
   RAZORPAY_KEY_SECRET=your_secret_here
   RAZORPAY_MODE=test
   ```

### Step 3: Get Webhook Secret

1. Go to **Settings** → **Webhooks**
2. Click **Create New Webhook**
3. Add your webhook URL: `https://your-domain.com/api/payments/webhook`
4. Select events to track:
   - ✅ `payment.captured`
   - ✅ `payment.failed`
   - ✅ `order.paid`
   - ✅ `refund.created`
5. Click **Create Webhook**
6. Copy the **Webhook Secret**
7. Add to `.env.local`:
   ```bash
   RAZORPAY_WEBHOOK_SECRET=your_webhook_secret_here
   ```

### Step 4: Production Keys (Later)

Once you're ready for production:

1. Complete full KYC verification in RazorPay
2. Go to **Settings** → **API Keys**
3. Switch to **Live Mode**
4. Generate **Live API Keys** (starts with `rzp_live_`)
5. Update `.env.local`:
   ```bash
   RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxxx
   RAZORPAY_KEY_SECRET=your_live_secret
   RAZORPAY_MODE=live
   ```

---

## 🪣 Supabase Storage Setup for Receipts

### Create Storage Bucket

1. Go to Supabase Dashboard
2. Navigate to **Storage**
3. Click **New Bucket**
4. Name: `payment-receipts`
5. Make it **Private** (not public)
6. Click **Create**

### Set Storage Policies

Run this in Supabase SQL Editor:

```sql
-- Allow authenticated users to view their own receipts
CREATE POLICY "Users can view own receipts" ON storage.objects
FOR SELECT USING (
  bucket_id = 'payment-receipts' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow service role to upload receipts (system)
CREATE POLICY "Service can upload receipts" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'payment-receipts'
);

-- Allow admins to view all receipts
CREATE POLICY "Admins can view all receipts" ON storage.objects
FOR SELECT USING (
  bucket_id = 'payment-receipts' AND
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role IN ('super_admin', 'admin')
  )
);
```

---

## 🧪 Testing Configuration

### Verify Environment Variables

Create a test script to verify your configuration:

```bash
# Run this from your project root
npm run check-env
```

Or manually check in Node console:

```javascript
// Check if variables are loaded
console.log('RazorPay Key ID:', process.env.RAZORPAY_KEY_ID ? '✓ Set' : '✗ Missing');
console.log('RazorPay Secret:', process.env.RAZORPAY_KEY_SECRET ? '✓ Set' : '✗ Missing');
console.log('RazorPay Mode:', process.env.RAZORPAY_MODE || 'test');
console.log('Webhook Secret:', process.env.RAZORPAY_WEBHOOK_SECRET ? '✓ Set' : '✗ Missing');
```

### Test RazorPay Connection

Once API routes are built, test with:

```bash
curl -X POST http://localhost:3000/api/payments/test-connection
```

---

## 🔒 Security Best Practices

### ✅ DO:
- ✅ Store secrets in `.env.local` (never commit to Git)
- ✅ Use test keys during development
- ✅ Rotate keys periodically in production
- ✅ Use environment variables in Vercel/deployment platform
- ✅ Restrict webhook IP addresses (RazorPay settings)
- ✅ Validate webhook signatures
- ✅ Log all payment operations

### ❌ DON'T:
- ❌ Never commit `.env.local` to Git
- ❌ Never expose `RAZORPAY_KEY_SECRET` to frontend
- ❌ Never use live keys in development
- ❌ Never log sensitive data (card numbers, secrets)
- ❌ Never skip signature verification
- ❌ Never trust client-side payment status

---

## 📝 Environment Variables Checklist

Before proceeding to API development, ensure:

- [ ] `.env.local` file exists in project root
- [ ] RazorPay account created
- [ ] RazorPay test keys obtained
- [ ] RazorPay webhook configured
- [ ] Webhook secret obtained
- [ ] Supabase storage bucket created
- [ ] Storage policies configured
- [ ] All existing env variables still working
- [ ] Server restarted after adding new variables
- [ ] Variables verified with test script

---

## 🚀 Next Steps

After environment configuration is complete:

1. **Create Payment Service** - Business logic layer
2. **Create API Routes** - Payment endpoints
3. **Test with RazorPay Test Cards** - Verify integration
4. **Build UI Components** - Payment forms and checkout
5. **Integration Testing** - End-to-end flows

---

## 🔗 Useful Links

- [RazorPay Dashboard](https://dashboard.razorpay.com)
- [RazorPay API Documentation](https://razorpay.com/docs/api/)
- [RazorPay Test Cards](https://razorpay.com/docs/payments/payments/test-card-details/)
- [Webhook Documentation](https://razorpay.com/docs/webhooks/)
- [Supabase Storage](https://supabase.com/docs/guides/storage)

---

## 📞 Support

If you encounter issues:

1. Check RazorPay Dashboard logs
2. Verify webhook is receiving events
3. Check Supabase logs for errors
4. Review Next.js server logs
5. Test with RazorPay test cards first

---

**Status:** ⏳ Configuration Required  
**Last Updated:** October 8, 2024  
**Version:** 1.0
