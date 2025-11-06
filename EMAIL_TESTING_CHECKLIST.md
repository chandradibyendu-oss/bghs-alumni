# Email Testing Checklist - BGHS Alumni

## 📧 All Email Use Cases

This document lists all email functionality implemented in the BGHS Alumni system. Use this checklist to test each email feature.

---

## ✅ Email Types and Test Cases

### 1. **Password Reset OTP Email** ❌ No Reply-To
**Location:** `/forgot-password` page  
**Trigger:** User requests password reset via email  
**API:** `/api/auth/forgot-password`  
**Email Function:** `generateOTPEmail()`  
**Recipient:** User's email address  
**Subject:** `BGHS Alumni - Password Reset OTP`

**How to Test:**
1. Go to `/forgot-password`
2. Enter a valid email address
3. Click "Send OTP"
4. Check email inbox for OTP code
5. Verify email contains:
   - OTP code (6 digits)
   - Expiration time (10 minutes)
   - BGHS Alumni branding
   - No Reply-To header (as expected)

**Expected Result:**
- ✅ Email sent successfully
- ✅ OTP is displayed in email
- ✅ No Reply-To header (correct for OTP emails)

---

### 2. **Email Change Verification OTP** ❌ No Reply-To
**Location:** `/profile` page  
**Trigger:** User with placeholder email requests to change email  
**API:** `/api/profile/update-email`  
**Recipient:** New email address (for verification)  
**Subject:** `Verify Your New Email Address - BGHS Alumni`

**How to Test:**
1. Login with a user account that has a placeholder email (e.g., `BGHSA202500031@alumnibghs.org`)
2. Go to `/profile`
3. Click "Update Email" button (visible only for placeholder emails)
4. Enter new email address
5. Click "Send Verification Code"
6. Check the new email inbox for verification code
7. Verify email contains:
   - Verification code (6 digits)
   - Current email and new email
   - Expiration time (10 minutes)
   - No Reply-To header (as expected)

**Expected Result:**
- ✅ Email sent to new email address
- ✅ Verification code displayed
- ✅ No Reply-To header (correct for OTP emails)

---

### 3. **Registration OTP Email** ❌ No Reply-To
**Location:** `/register` page  
**Trigger:** User requests email verification during registration  
**API:** `/api/auth/send-otp`  
**Email Function:** `generateOTPEmail()`  
**Recipient:** User's email address  
**Subject:** `BGHS Alumni - Password Reset OTP` (same template as password reset)

**How to Test:**
1. Go to `/register`
2. Fill in registration form
3. Enter email address
4. Click "Send OTP" button (if available)
5. Check email inbox for OTP code

**Expected Result:**
- ✅ Email sent successfully
- ✅ OTP code in email
- ✅ No Reply-To header (correct for OTP emails)

---

### 4. **New Registration Notification Email** ✅ With Reply-To
**Location:** Admin workflow  
**Trigger:** After user completes registration and submits verification documents  
**API:** `/api/admin/process-pdf`  
**Email Function:** `generateRegistrationNotificationEmail()`  
**Recipient:** Admin email (from `ADMIN_EMAIL` env var or `admin@alumnibghs.org`)  
**Subject:** `New Alumni Registration - [Full Name] ([Year])`  
**Reply-To:** `admin@alumnibghs.org` (configurable via `REPLY_TO_EMAIL`)

**How to Test:**
1. Complete a new user registration with evidence documents
2. Submit the registration
3. Wait for PDF processing
4. Check admin email inbox for notification
5. Verify email contains:
   - User's full name and details
   - Batch year and class information
   - Verification method
   - Evidence file count
   - Reference count
   - PDF attachment with registration details
   - **Reply-To header set to admin email**

**Expected Result:**
- ✅ Email sent to admin
- ✅ PDF attachment included
- ✅ All user details displayed
- ✅ Reply-To header present (for admin to reply if needed)

---

### 5. **Payment Link Email** ✅ With Reply-To
**Location:** Admin workflow  
**Trigger:** Admin approves user registration and payment is required  
**API:** `/api/admin/users` (POST - when approving user)  
**Email Function:** `generatePaymentLinkEmail()`  
**Recipient:** User's email address  
**Subject:** `Registration Approved - Complete Payment of ₹[Amount]`  
**Reply-To:** `admin@alumnibghs.org` (configurable via `REPLY_TO_EMAIL`)

**How to Test:**
1. Login as admin
2. Go to `/admin/users`
3. Find a user with pending approval
4. Approve the user (if payment is mandatory in config)
5. Check user's email inbox for payment link email
6. Verify email contains:
   - Registration approved message
   - Payment amount and currency
   - Payment link button
   - Link expiry information
   - Benefits list
   - **Reply-To header set to admin email** (for payment support)

**Expected Result:**
- ✅ Email sent to user
- ✅ Payment link is clickable
- ✅ All payment details displayed
- ✅ Reply-To header present (for payment questions)

---

### 6. **Admin Password Reset Email** ❌ No Reply-To
**Location:** Admin workflow  
**Trigger:** Admin resets a user's password manually  
**API:** `/api/admin/reset-password`  
**Recipient:** User's email address  
**Subject:** `BGHS Alumni - Your password has been reset`

**How to Test:**
1. Login as admin
2. Go to `/admin/users`
3. Find a user
4. Reset their password (if this feature exists)
5. Check user's email inbox
6. Verify email contains:
   - Temporary password
   - Instructions to change password
   - No Reply-To header (as expected)

**Expected Result:**
- ✅ Email sent to user
- ✅ Temporary password displayed
- ✅ No Reply-To header (correct for automated emails)

---

## 📋 Summary Table

| Email Type | Reply-To? | Recipient | Trigger | Test Page |
|------------|-----------|-----------|---------|-----------|
| Password Reset OTP | ❌ No | User | Forgot password | `/forgot-password` |
| Email Change OTP | ❌ No | New Email | Profile update | `/profile` |
| Registration OTP | ❌ No | User | Registration | `/register` |
| Registration Notification | ✅ Yes | Admin | New registration | Admin workflow |
| Payment Link | ✅ Yes | User | Admin approval | `/admin/users` |
| Admin Password Reset | ❌ No | User | Admin action | `/admin/users` |

---

## 🔍 Testing Checklist

### Basic Email Functionality
- [ ] All emails are sent successfully
- [ ] Email content is correctly formatted
- [ ] BGHS Alumni branding is present
- [ ] Links (if any) are clickable and work
- [ ] Attachments (if any) are included and downloadable

### Reply-To Header Testing
- [ ] OTP emails have NO Reply-To header
- [ ] Payment link emails have Reply-To header
- [ ] Registration notification emails have Reply-To header
- [ ] Reply-To email is correct (`admin@alumnibghs.org` or configured value)

### Email Content Testing
- [ ] OTP codes are displayed correctly
- [ ] User names are personalized
- [ ] Payment amounts and links are correct
- [ ] Registration details are accurate
- [ ] Expiration times are mentioned

### Error Handling
- [ ] Invalid email addresses are handled gracefully
- [ ] Missing email addresses don't cause crashes
- [ ] API key errors are logged but don't break the app
- [ ] Development mode falls back to console logging

---

## 🧪 Quick Test Scenarios

### Scenario 1: Password Reset Flow
1. Go to `/forgot-password`
2. Enter email: `test@example.com`
3. Check email for OTP
4. Verify OTP works for password reset

### Scenario 2: Email Change Flow
1. Login with placeholder email account
2. Go to `/profile`
3. Click "Update Email"
4. Enter new email: `newemail@example.com`
5. Check new email for verification code
6. Verify code and complete email change

### Scenario 3: Payment Email Flow
1. As admin, approve a pending user
2. Check user's email for payment link
3. Verify payment link works
4. Test Reply-To by replying to email (should go to admin email)

### Scenario 4: Registration Notification Flow
1. Complete new user registration
2. Submit with evidence documents
3. Check admin email for notification
4. Verify PDF attachment is included
5. Test Reply-To by replying to email

---

## 📝 Notes

- **Development Mode:** If `BREVO_API_KEY` is not set, emails are logged to console instead of being sent
- **Reply-To Configuration:** Set `REPLY_TO_EMAIL` in `.env.local` to customize Reply-To address
- **Admin Email:** Set `ADMIN_EMAIL` in `.env.local` to receive registration notifications
- **From Email:** Set `FROM_EMAIL` in `.env.local` (default: `noreply@alumnibghs.org`)
- **Display Name:** Set `EMAIL_DISPLAY_NAME` in `.env.local` (default: `BGHS Alumni`)

---

## ✅ Success Criteria

All emails should:
1. ✅ Be sent successfully via Brevo API
2. ✅ Display correctly in email clients
3. ✅ Have correct Reply-To headers (where applicable)
4. ✅ Include all required information
5. ✅ Work in both development and production modes

---

**Last Updated:** After Brevo migration implementation

