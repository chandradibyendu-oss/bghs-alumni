# Email Setup Guide for BGHS Alumni

This guide will help you set up real email sending for the forgot password feature.

## 📧 **Option 1: SendGrid (Recommended)**

### Step 1: Create SendGrid Account
1. Go to [SendGrid.com](https://sendgrid.com)
2. Sign up for a free account (100 emails/day free)
3. Verify your email address

### Step 2: Get API Key
1. Go to **Settings** → **API Keys**
2. Click **Create API Key**
3. Choose **Restricted Access**
4. Give it a name: "BGHS Alumni"
5. Grant **Mail Send** permissions
6. Copy the API key

### Step 3: Configure Environment Variables
Add these to your `.env.local` file:

```bash
# Email Configuration
SENDGRID_API_KEY=your_sendgrid_api_key_here
FROM_EMAIL=noreply@bghs-alumni.com
```

### Step 4: Verify Sender Identity
1. Go to **Settings** → **Sender Authentication**
2. Choose **Single Sender Verification**
3. Add your email: `noreply@bghs-alumni.com`
4. Verify the email address

## 📧 **Option 2: AWS SES (Alternative)**

### Step 1: Create AWS Account
1. Go to [AWS Console](https://console.aws.amazon.com)
2. Navigate to **Simple Email Service (SES)**
3. Verify your email address

### Step 2: Get Credentials
1. Go to **IAM** → **Users**
2. Create a new user with SES permissions
3. Generate access keys

### Step 3: Configure Environment Variables
```bash
# AWS SES Configuration
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=us-east-1
FROM_EMAIL=noreply@bghs-alumni.com
```

## 🧪 **Testing Email Sending**

### Development Mode (Current)
- Emails are logged to console
- No real emails sent
- Perfect for testing

### Production Mode
- Real emails sent to inbox
- Requires API keys configured
- Ready for live users

## 🔧 **How It Works**

1. **Development**: Emails logged to console
2. **Production**: Real emails sent via SendGrid/AWS SES
3. **Automatic Detection**: System detects if API keys are present
4. **Fallback**: Always falls back to console logging if email fails

## 📱 **SMS Support (Optional)**

For SMS OTPs, you can also configure Twilio:

```bash
# SMS Configuration
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_PHONE_NUMBER=your_twilio_number
```

## 🚀 **Quick Start**

1. **For Testing**: Keep current setup (console logging)
2. **For Production**: Add SendGrid API key to `.env.local`
3. **Restart Server**: `npm run dev`
4. **Test**: Try forgot password feature

## 📞 **Support**

- SendGrid: [Documentation](https://docs.sendgrid.com)
- AWS SES: [Documentation](https://docs.aws.amazon.com/ses)
- Twilio: [Documentation](https://www.twilio.com/docs)

---

**Note**: The forgot password feature works perfectly in development mode. Real email sending is only needed for production deployment.
