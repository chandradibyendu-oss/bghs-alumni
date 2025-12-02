# Brevo Setup Checklist - Prerequisites Before Code Migration

## ⚠️ IMPORTANT: Complete These Steps in Brevo Dashboard BEFORE Code Implementation

Please complete all items in this checklist before proceeding with code changes. This ensures the migration will work immediately after deployment.

---

## ✅ Step 1: Generate API Key

**Location**: Brevo Dashboard → Settings → API Keys

1. Log into your Brevo account at https://app.brevo.com
2. Navigate to **Settings** → **API Keys** (or **SMTP & API** → **API Keys**)
3. Click **"Generate a new API key"** or **"Create API Key"**
4. **Name**: `BGHS Alumni Website` (or any descriptive name)
5. **Permissions**: Select **"Manage account"** or at minimum **"Send emails"** permission
6. **Copy the API key immediately** - You won't be able to see it again after closing the dialog
   - **Save it securely** - You'll need this for `BREVO_API_KEY` environment variable

**✅ Checklist Item 1**: [ ] API Key generated and copied

---

## ✅ Step 2: Verify Sender Email Address

**Location**: Brevo Dashboard → Senders & IP → Senders

**CRITICAL**: You must verify the sender email address (`FROM_EMAIL`) that will be used to send emails.

### Option A: Single Sender Verification (Recommended for Testing)

1. Go to **Senders & IP** → **Senders** in Brevo dashboard
2. Click **"Add a sender"** or **"Verify a sender"**
3. Enter the email address you want to use:
   - **Email**: `noreply@bghs-alumni.com` (or your FROM_EMAIL value)
   - **Name**: `BGHS Alumni` (optional)
   - **Company**: `BGHS Alumni Association` (optional)
4. Click **"Save"**
5. **Check your email inbox** for verification email from Brevo
6. **Click the verification link** in the email
7. Wait for status to change to **"Verified"** (usually instant, may take a few minutes)

### Option B: Domain Authentication (Recommended for Production)

If you own the domain, you can authenticate the entire domain:
1. Go to **Senders & IP** → **Domains**
2. Click **"Add a domain"**
3. Enter your domain: `bghs-alumni.com` (or `alumnibghs.org`)
4. Add DNS records as instructed by Brevo
5. Wait for DNS verification (can take up to 48 hours)

**Current FROM_EMAIL in your config**: `noreply@bghs-alumni.com` (from env.example)

**✅ Checklist Item 2**: [ ] Sender email address verified (status shows "Verified")

---

## ✅ Step 3: Test Email Sending (Optional but Recommended)

**Location**: Brevo Dashboard → Campaigns → Send a test email

1. Go to **Campaigns** or **Transactional** → **Send a test email**
2. Send a test email to your own email address
3. Verify you receive the email successfully
4. Check spam folder if needed

**Alternative**: We can test this after code implementation using the development mode.

**✅ Checklist Item 3**: [ ] Test email sent and received successfully (optional)

---

## ✅ Step 4: Check Account Limits

**Location**: Brevo Dashboard → Account

1. Navigate to **Account** or **Plan** section
2. Verify your free tier limits:
   - **Free Tier**: 300 emails/day
   - **Email sending**: Should be enabled
3. Check if there are any restrictions on your account
4. Note: Free tier should be sufficient for testing and initial production use

**✅ Checklist Item 4**: [ ] Account limits verified (300 emails/day free tier confirmed)

---

## ✅ Step 5: Prepare Environment Variables

**What you need before code deployment:**

1. **BREVO_API_KEY**: The API key from Step 1
2. **FROM_EMAIL**: The verified sender email from Step 2 (e.g., `noreply@bghs-alumni.com`)

**Where to add these:**
- `.env.local` file (for local development)
- Production environment variables (Vercel/deployment platform)

**✅ Checklist Item 5**: [ ] API key and FROM_EMAIL ready for environment variables

---

## 📋 Summary Checklist

Before proceeding with code implementation, ensure:

- [ ] **API Key Generated**: Have your Brevo API key copied and ready
- [ ] **Sender Email Verified**: `FROM_EMAIL` address is verified in Brevo dashboard
- [ ] **Account Active**: Brevo account is active and not restricted
- [ ] **Test Email Sent**: (Optional) Sent and received a test email successfully

---

## 🔍 Verification Steps in Brevo Dashboard

After completing the setup, verify in Brevo dashboard:

1. **API Key Status**: 
   - Settings → API Keys → Key should show "Active" status

2. **Sender Status**: 
   - Senders & IP → Senders → Email should show "Verified" status (green checkmark)

3. **Account Status**:
   - Account → Should show "Active" and no restrictions

---

## ⚠️ Common Issues to Watch For

### Issue 1: API Key Not Working
- **Solution**: Ensure API key has "Send emails" permission
- **Solution**: Regenerate API key if needed

### Issue 2: Sender Not Verified
- **Solution**: Check spam folder for verification email
- **Solution**: Manually request verification email again
- **Solution**: Ensure email address is correct

### Issue 3: Emails Going to Spam
- **Solution**: Verify sender email properly
- **Solution**: Set up SPF/DKIM records (domain authentication)
- **Solution**: Warm up your sending domain gradually

### Issue 4: API Rate Limits
- **Solution**: Free tier allows 300 emails/day
- **Solution**: Monitor usage in Brevo dashboard
- **Solution**: Upgrade plan if needed

---

## 📞 Brevo Support Resources

If you encounter issues:
- **Documentation**: https://developers.brevo.com/docs
- **API Reference**: https://developers.brevo.com/reference
- **Support**: Available in Brevo dashboard or via email

---

## ✅ Ready to Proceed?

Once you've completed all checklist items above, you're ready for code implementation. 

**Please confirm:**
1. ✅ API key generated
2. ✅ Sender email verified
3. ✅ Account is active

Then I can proceed with the code changes safely! 🚀

---

## 📝 Notes

- **Development Mode**: Even without API key, the code will work in development mode (console logging)
- **Gradual Migration**: We can keep SendGrid as backup during initial migration
- **Zero Downtime**: Code changes won't break existing functionality if API key is missing




