# Step 3: RazorPay Test Account Setup

## 🎯 Objective
Set up a RazorPay test account and get API credentials for development.

**Time Required:** 15-20 minutes  
**Cost:** FREE (Test mode only)

---

## 📝 Step-by-Step Instructions

### **Part 1: Create RazorPay Account**

#### 1. Go to RazorPay Website
- Open: [https://razorpay.com](https://razorpay.com)
- Click **"Sign Up"** (top right)

#### 2. Sign Up with Details
Fill in the form:
- **Email:** Your work/personal email
- **Password:** Create a strong password
- **Company Name:** BGHS Alumni Association (or your school name)
- **Phone Number:** Your contact number

**Click "Sign Up"**

#### 3. Verify Email
- Check your email inbox
- Click the verification link
- You'll be redirected to RazorPay Dashboard

#### 4. Complete Basic Profile (Optional)
You can skip detailed KYC for now since we're using **Test Mode**
- Test mode doesn't require full verification
- You can complete KYC later when going live

---

### **Part 2: Get Test API Keys**

#### 1. Access Dashboard
After login, you'll see the RazorPay Dashboard

#### 2. Switch to Test Mode
- Look for a toggle at the top (usually says "Test Mode" or "Live Mode")
- **Make sure "Test Mode" is enabled** (it should be by default)
- Test mode has a different color (usually orange/yellow indicator)

#### 3. Navigate to API Keys
- In the left sidebar, click **"Settings"**
- Click **"API Keys"** under Settings
- OR directly go to: https://dashboard.razorpay.com/app/keys

#### 4. Generate Test Keys
You'll see two sections:
- **Test Keys** (for development)
- **Live Keys** (requires KYC - ignore for now)

Under **Test Keys** section:
- Click **"Generate Test Key"** (if not already generated)
- You'll see two keys appear:

**Key ID (Public Key):**
```
rzp_test_xxxxxxxxxxxxx
```
This starts with `rzp_test_` - this is your **PUBLIC** key
✅ Safe to use in frontend code

**Key Secret (Private Key):**
```
xxxxxxxxxxxxxxxxxxxxxxxx
```
This is your **SECRET** key
⚠️ **NEVER expose this in frontend or commit to Git!**

#### 5. Copy Your Keys
- Copy **Key ID** to a safe place (notepad)
- Copy **Key Secret** to a safe place (notepad)
- Keep this window open for now

---

### **Part 3: Configure Webhook (Optional for Now)**

We'll configure this later when building the webhook handler.
For now, you can **skip this section**.

---

### **Part 4: Add Keys to Your Project**

#### 1. Open Your Project
```bash
cd c:\apps\bghs-alumni-clean
```

#### 2. Edit .env.local File
```bash
# If .env.local doesn't exist, copy from env.example
copy env.example .env.local

# Then edit it
code .env.local
```

#### 3. Add RazorPay Configuration
Find or add these lines in `.env.local`:

```bash
# RazorPay Configuration (for payments)
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx        # REPLACE with your Key ID
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxxxxxx  # REPLACE with your Key Secret
RAZORPAY_WEBHOOK_SECRET=                       # Leave empty for now
RAZORPAY_MODE=test                             # Keep as 'test'

# Payment System Configuration
PAYMENT_RECEIPT_BUCKET=payment-receipts
PAYMENT_LINK_EXPIRY_HOURS=72
PAYMENT_ADMIN_EMAIL=admin@alumnibghs.org
PAYMENT_DEFAULT_CURRENCY=INR
```

**Replace the placeholder values with your actual keys!**

#### 4. Verify Other Required Variables

Make sure these are also set in your `.env.local`:

```bash
# Supabase (Should already be set)
NEXT_PUBLIC_SUPABASE_URL=your_actual_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_actual_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_actual_service_role_key

# Email (Should already be set)
SENDGRID_API_KEY=your_sendgrid_key_or_leave_empty
FROM_EMAIL=noreply@alumnibghs.org
ADMIN_EMAIL=admin@alumnibghs.org
```

#### 5. Save the File
- Save `.env.local`
- **Never commit this file to Git!**
- It should already be in `.gitignore`

---

### **Part 5: Verify Setup**

#### 1. Restart Development Server
```bash
# Stop the current server (Ctrl+C)
# Then restart
npm run dev
```

#### 2. Check if Variables are Loaded
We'll create a quick test script to verify.

---

## 🧪 Test Your Setup

I'll create a test API route next to verify your RazorPay credentials work.

---

## ✅ Checklist

Before proceeding, confirm:

- [ ] RazorPay account created
- [ ] Email verified
- [ ] Dashboard accessible
- [ ] Test Mode enabled
- [ ] Test API keys generated
- [ ] Key ID copied (starts with `rzp_test_`)
- [ ] Key Secret copied
- [ ] `.env.local` file updated with keys
- [ ] `.env.local` has all required variables
- [ ] Development server restarted

---

## 📸 What You Should See

### RazorPay Dashboard (Test Mode)
- Dashboard should show "Test Mode" indicator
- You should see "₹0" in test balance
- Settings → API Keys should show your test keys

### Your .env.local File
```bash
RAZORPAY_KEY_ID=rzp_test_abc123...  # Should start with rzp_test_
RAZORPAY_KEY_SECRET=xxx...           # Should be a long string
RAZORPAY_MODE=test                   # Should be 'test'
```

---

## 🚨 Common Issues

### Issue: Can't find API Keys section
**Solution:** Make sure you're in Test Mode (check toggle at top)

### Issue: No "Generate Test Key" button
**Solution:** Keys might already be generated - look for existing keys

### Issue: .env.local changes not working
**Solution:** 
1. Save the file
2. Restart dev server (stop with Ctrl+C, then `npm run dev`)
3. Environment variables are loaded on server start

### Issue: Getting "Test mode" but want live keys
**Solution:** 
- Don't worry about live keys yet
- Test mode is perfect for development
- Live mode requires full KYC (can do later)

---

## 🔐 Security Reminders

⚠️ **NEVER:**
- Commit `.env.local` to Git
- Share your Key Secret publicly
- Use live keys in development
- Expose Key Secret in frontend code

✅ **ALWAYS:**
- Keep `.env.local` in `.gitignore`
- Use test keys for development
- Use environment variables (never hardcode)
- Keep Key Secret on server-side only

---

## 📞 Next Steps

Once you've completed this checklist, reply with:

1. ✅ "RazorPay account created"
2. ✅ "Test keys copied and added to .env.local"
3. ✅ "Dev server restarted"

Then I'll create a test API route to verify the connection works!

---

## 🔗 Useful RazorPay Resources

- Dashboard: https://dashboard.razorpay.com
- Test Cards: https://razorpay.com/docs/payments/payments/test-card-details/
- API Docs: https://razorpay.com/docs/api/
- Test Mode Guide: https://razorpay.com/docs/payment-gateway/test-mode/

---

**Current Step:** 3A - RazorPay Setup  
**Status:** ⏳ In Progress  
**Next:** 3B - Test Connection
