# Forgot Password Feature Setup Guide

## Overview

The BGHS Alumni website now includes a comprehensive forgot password feature that allows users to reset their passwords using OTP (One-Time Password) verification via email and/or phone number.

## Features

### ✅ **Implemented Features**

1. **Multi-step Password Reset Process**
   - Step 1: Enter email or phone number
   - Step 2: Verify OTP (6-digit code)
   - Step 3: Set new password

2. **Dual Channel OTP Delivery**
   - Email OTP with branded template
   - SMS OTP for mobile verification
   - Support for both email and phone simultaneously

3. **Security Features**
   - 6-digit OTP with 10-minute expiration
   - SHA-256 hashed OTP storage in database
   - One-time use OTPs (marked as used after password reset)
   - Rate limiting with 60-second cooldown for resend

4. **User Experience**
   - Clean, responsive UI with dual branding
   - Real-time validation and error handling
   - Loading states and success feedback
   - Automatic redirect after successful reset

## Database Schema

### Password Reset OTPs Table

```sql
CREATE TABLE password_reset_otps (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT,
  phone TEXT,
  otp_hash TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Indexes for Performance

```sql
CREATE INDEX idx_password_reset_otps_email ON password_reset_otps(email);
CREATE INDEX idx_password_reset_otps_phone ON password_reset_otps(phone);
CREATE INDEX idx_password_reset_otps_expires ON password_reset_otps(expires_at);
```

## API Endpoints

### 1. Send OTP
- **POST** `/api/auth/forgot-password`
- **Body**: `{ email?: string, phone?: string }`
- **Response**: `{ message: string, expires: number }`

### 2. Verify OTP
- **POST** `/api/auth/verify-otp`
- **Body**: `{ email?: string, phone?: string, otp: string }`
- **Response**: `{ message: string, verified: boolean }`

### 3. Reset Password
- **POST** `/api/auth/reset-password`
- **Body**: `{ email?: string, phone?: string, otp: string, newPassword: string }`
- **Response**: `{ message: string }`

## File Structure

```
app/
├── forgot-password/
│   └── page.tsx                 # Forgot password UI
├── api/auth/
│   ├── forgot-password/
│   │   └── route.ts            # Send OTP endpoint
│   ├── verify-otp/
│   │   └── route.ts            # Verify OTP endpoint
│   └── reset-password/
│       └── route.ts            # Reset password endpoint
└── login/
    └── page.tsx                # Updated with forgot password link

lib/
├── email-service.ts           # Email service utility
└── sms-service.ts             # SMS service utility

supabase-schema.sql            # Database schema with OTP table
```

## Development Setup

### 1. Database Setup

Run the following SQL in your Supabase SQL editor:

```sql
-- Password Reset OTPs Table
CREATE TABLE IF NOT EXISTS password_reset_otps (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT,
  phone TEXT,
  otp_hash TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_password_reset_otps_email ON password_reset_otps(email);
CREATE INDEX IF NOT EXISTS idx_password_reset_otps_phone ON password_reset_otps(phone);
CREATE INDEX IF NOT EXISTS idx_password_reset_otps_expires ON password_reset_otps(expires_at);

-- RLS Policies
ALTER TABLE password_reset_otps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow OTP insertion" ON password_reset_otps
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow OTP verification" ON password_reset_otps
  FOR SELECT USING (true);

CREATE POLICY "Allow OTP update" ON password_reset_otps
  FOR UPDATE USING (true);

-- Cleanup function
CREATE OR REPLACE FUNCTION cleanup_expired_otps()
RETURNS void AS $$
BEGIN
  DELETE FROM password_reset_otps 
  WHERE expires_at < NOW() OR used = TRUE;
END;
$$ LANGUAGE plpgsql;
```

### 2. Environment Variables

Add these to your `.env.local`:

```env
# Supabase (already configured)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Email Service (for production)
SENDGRID_API_KEY=your_sendgrid_api_key
SENDGRID_FROM_EMAIL=noreply@bghs-alumni.com

# SMS Service (for production)
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number
```

## Production Setup

### Email Service Integration

1. **SendGrid Setup**
   ```bash
   npm install @sendgrid/mail
   ```

2. **Update `lib/email-service.ts`**
   - Uncomment the SendGrid implementation
   - Add your SendGrid API key to environment variables

### SMS Service Integration

1. **Twilio Setup**
   ```bash
   npm install twilio
   ```

2. **Update `lib/sms-service.ts`**
   - Uncomment the Twilio implementation
   - Add your Twilio credentials to environment variables

## Testing

### Development Testing

1. **Start the development server**
   ```bash
   npm run dev
   ```

2. **Navigate to forgot password page**
   - Go to `/forgot-password`
   - Or click "Forgot your password?" on login page

3. **Test the flow**
   - Enter email or phone number
   - Check console for OTP (development mode)
   - Complete the password reset process

### Production Testing

1. **Set up email/SMS services**
2. **Test with real email/phone numbers**
3. **Verify OTP delivery and expiration**

## Security Considerations

### ✅ **Implemented Security Measures**

1. **OTP Security**
   - SHA-256 hashed storage
   - 10-minute expiration
   - One-time use only
   - Rate limiting

2. **Database Security**
   - Row Level Security (RLS) enabled
   - Proper indexing for performance
   - Automatic cleanup of expired OTPs

3. **API Security**
   - Input validation
   - Error handling without information leakage
   - Secure password requirements

### 🔒 **Additional Recommendations**

1. **Rate Limiting**
   - Implement API rate limiting (e.g., max 5 attempts per hour)
   - Add IP-based blocking for suspicious activity

2. **Monitoring**
   - Log failed password reset attempts
   - Monitor for unusual patterns

3. **Audit Trail**
   - Track password reset events
   - Store reset history for security analysis

## Troubleshooting

### Common Issues

1. **OTP not received**
   - Check console logs (development mode)
   - Verify email/phone format
   - Check spam folder

2. **Database errors**
   - Ensure OTP table exists
   - Check RLS policies
   - Verify service role key

3. **Email/SMS not sending**
   - Check service credentials
   - Verify API keys
   - Check service quotas

### Debug Mode

Enable debug logging by adding to your environment:

```env
DEBUG_PASSWORD_RESET=true
```

## Support

For issues or questions:
- Check the console logs for detailed error messages
- Verify all environment variables are set correctly
- Ensure database schema is properly applied

---

**Note**: This feature is production-ready but requires email/SMS service integration for full functionality. In development mode, OTPs are logged to the console for testing purposes.
