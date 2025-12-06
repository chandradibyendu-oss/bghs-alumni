# Website Access Control Setup Guide

This guide explains how to restrict access to your website so only test members can access it before the formal launch.

## How It Works

The access control uses **HTTP Basic Authentication** - when someone tries to visit your website, they'll be prompted to enter a username (email) and password. Only users with the correct credentials can access the site.

## Setup Instructions

### Step 1: Enable Access Control

1. Go to your **Vercel Dashboard** → Select your project → **Settings** → **Environment Variables**

2. Add the following environment variables:

   ```
   ENABLE_ACCESS_CONTROL=true
   ACCESS_PASSWORD=your_secure_password_here
   ALLOWED_TEST_EMAILS=test1@example.com,test2@example.com,test3@example.com
   ```

   **Important:**
   - Replace `your_secure_password_here` with a strong password
   - Replace the email addresses with the actual test user emails (comma-separated, no spaces)
   - You can add as many test emails as needed

### Step 2: Deploy the Changes

After adding the environment variables:

1. **Redeploy your site** in Vercel (or push code changes to trigger auto-deployment)
2. The access control will be active immediately after deployment

### Step 3: Share Credentials with Test Users

Share with your test members:
- **Username**: Their email address (must match one in `ALLOWED_TEST_EMAILS`)
- **Password**: The password you set in `ACCESS_PASSWORD`

**Example:**
```
Username: john@example.com
Password: MySecureTestPassword123
```

## Configuration Options

### Option 1: Email Whitelist (Recommended)
Only specific emails can access:
```
ENABLE_ACCESS_CONTROL=true
ACCESS_PASSWORD=your_password
ALLOWED_TEST_EMAILS=user1@example.com,user2@example.com
```

### Option 2: Password Only
Anyone with the password can access (less secure):
```
ENABLE_ACCESS_CONTROL=true
ACCESS_PASSWORD=your_password
ALLOWED_TEST_EMAILS=
```
(Leave `ALLOWED_TEST_EMAILS` empty)

### Option 3: Disable Access Control
To allow public access:
```
ENABLE_ACCESS_CONTROL=false
```
(Or remove the environment variable)

## How Users Access the Site

1. User visits `www.alumnibghs.org`
2. Browser shows a login popup asking for username and password
3. User enters their email and password
4. If credentials match, they can access the site
5. Browser remembers credentials for that session

## Important Notes

- **Public APIs are excluded**: Authentication endpoints (`/api/auth/*`) remain accessible for login functionality
- **Static assets are excluded**: Images, CSS, and JavaScript files load normally
- **Session-based**: Once authenticated, users stay logged in for that browser session
- **Case-insensitive emails**: Email matching is case-insensitive
- **Multiple simultaneous access**: Multiple users can use the same email/password simultaneously - there's no limit on concurrent sessions
- **Best practice**: Assign unique emails to each test member for better tracking, but sharing credentials works too

## Disabling Access Control (After Launch)

When you're ready to launch publicly:

1. Go to Vercel Dashboard → Environment Variables
2. Set `ENABLE_ACCESS_CONTROL=false` (or delete the variable)
3. Redeploy your site

## Troubleshooting

### Users can't access the site
- Check that `ENABLE_ACCESS_CONTROL=true` is set
- Verify the password in `ACCESS_PASSWORD` matches what you shared
- Ensure test user emails are in `ALLOWED_TEST_EMAILS` (if using email whitelist)

### Access control not working
- Make sure you've redeployed after adding environment variables
- Check that environment variables are set for the correct environment (Production/Preview)
- Clear browser cache and try again

### Need to add more test users
- Update `ALLOWED_TEST_EMAILS` with comma-separated emails
- Redeploy the site
- Share the password with new test users

## Security Best Practices

1. **Use a strong password** - At least 12 characters with mix of letters, numbers, and symbols
2. **Limit test users** - Only add emails of people who need access
3. **Change password regularly** - Update `ACCESS_PASSWORD` periodically
4. **Remove access after testing** - Remove emails from `ALLOWED_TEST_EMAILS` when no longer needed
5. **Disable before launch** - Remember to disable access control before public launch

## Example Environment Variables

```env
# Enable access control
ENABLE_ACCESS_CONTROL=true

# Set a strong password
ACCESS_PASSWORD=BGHS_Test_2024_Secure!

# List of allowed test user emails
ALLOWED_TEST_EMAILS=admin@alumnibghs.org,testuser1@gmail.com,testuser2@example.com
```

---

**Note**: This is a simple access control mechanism for pre-launch testing. For production, consider implementing proper user authentication and role-based access control.

