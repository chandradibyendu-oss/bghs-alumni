# OneDrive API Integration Setup Guide

This guide will help you set up OneDrive API integration for your BGHS Alumni website.

## Prerequisites

- Microsoft 365 account with OneDrive access
- Azure account (free tier is sufficient)

## Step 1: Create Azure App Registration

### 1.1 Go to Azure Portal
1. Visit [Azure Portal](https://portal.azure.com)
2. Sign in with your Microsoft account
3. Go to "Azure Active Directory" → "App registrations"

### 1.2 Create New Registration
1. Click "New registration"
2. Fill in the details:
   - **Name**: `BGHS Alumni Gallery`
   - **Supported account types**: `Accounts in this organizational directory only`
   - **Redirect URI**: 
     - Type: `Web`
     - URI: `http://localhost:3000/api/auth/onedrive/callback` (for development)
     - Add another: `https://yourdomain.com/api/auth/onedrive/callback` (for production)

### 1.3 Note Important Values
After creation, note down:
- **Application (client) ID**
- **Directory (tenant) ID**

## Step 2: Configure API Permissions

### 2.1 Add Microsoft Graph Permissions
1. In your app registration, go to "API permissions"
2. Click "Add a permission"
3. Select "Microsoft Graph"
4. Choose "Application permissions"
5. Add these permissions:
   - `Files.ReadWrite` (for file operations)
   - `User.Read` (for user information)

### 2.2 Grant Admin Consent
1. Click "Grant admin consent for [Your Organization]"
2. Confirm the action

## Step 3: Create Client Secret

### 3.1 Generate Secret
1. Go to "Certificates & secrets"
2. Click "New client secret"
3. Add description: `BGHS Gallery Secret`
4. Choose expiration (recommend 24 months)
5. Click "Add"

### 3.2 Copy Secret Value
⚠️ **Important**: Copy the secret value immediately - you won't be able to see it again!

## Step 4: Configure Environment Variables

Add these to your `.env.local` file:

```bash
# OneDrive API Integration
MICROSOFT_CLIENT_ID=your_application_client_id_here
MICROSOFT_CLIENT_SECRET=your_client_secret_value_here
MICROSOFT_TENANT_ID=your_tenant_id_here
ONEDRIVE_REDIRECT_URI=http://localhost:3000/api/auth/onedrive/callback
```

## Step 5: Initial Authentication

### 5.1 Get Authentication URL
Visit: `http://localhost:3000/api/auth/onedrive`

This will redirect you to Microsoft login.

### 5.2 Complete Authentication
1. Sign in with your Microsoft account
2. Grant permissions to the app
3. You'll be redirected back with tokens

### 5.3 Save Tokens
Add the received tokens to your `.env.local`:

```bash
ONEDRIVE_ACCESS_TOKEN=your_access_token_here
ONEDRIVE_REFRESH_TOKEN=your_refresh_token_here
```

## Step 6: Test the Integration

### 6.1 Start Your Application
```bash
npm run dev
```

### 6.2 Test Upload
1. Go to `/gallery/upload`
2. Upload a test image
3. Check your OneDrive for the `BGHS-Gallery` folder

## Production Deployment

### For Vercel Deployment:

1. **Add Environment Variables** in Vercel dashboard:
   ```
   MICROSOFT_CLIENT_ID=your_client_id
   MICROSOFT_CLIENT_SECRET=your_client_secret
   MICROSOFT_TENANT_ID=your_tenant_id
   ONEDRIVE_REDIRECT_URI=https://yourdomain.com/api/auth/onedrive/callback
   ONEDRIVE_ACCESS_TOKEN=your_access_token
   ONEDRIVE_REFRESH_TOKEN=your_refresh_token
   ```

2. **Update Redirect URI** in Azure:
   - Add production URL to your app registration
   - Remove localhost URI if desired

### Token Management in Production

For production, consider implementing a more secure token storage:

1. **Store tokens in database** instead of environment variables
2. **Implement automatic token refresh**
3. **Use Azure Key Vault** for sensitive data

## File Structure in OneDrive

After successful setup, your OneDrive will have:

```
OneDrive/
└── BGHS-Gallery/
    ├── photo1.jpg
    ├── photo2.png
    └── thumbnails/
        ├── thumb_photo1.jpg
        └── thumb_photo2.jpg
```

## Troubleshooting

### Common Issues:

1. **"Insufficient privileges" error**:
   - Ensure admin consent was granted
   - Check API permissions are correctly configured

2. **"Invalid redirect URI"**:
   - Verify redirect URI matches exactly in Azure
   - Check for trailing slashes or HTTP vs HTTPS

3. **"Token expired"**:
   - The system will automatically refresh tokens
   - If persistent, re-authenticate via `/api/auth/onedrive`

4. **Upload failures**:
   - Check file size limits (max 50MB)
   - Verify OneDrive has sufficient storage space

### Debug Mode:

Add this to see detailed logs:
```bash
DEBUG=onedrive npm run dev
```

## Security Best Practices

1. **Never commit tokens** to version control
2. **Use environment variables** for all sensitive data
3. **Implement proper error handling** for token refresh
4. **Monitor API usage** in Azure dashboard
5. **Regularly rotate client secrets**

## Cost Considerations

- **Microsoft Graph API**: Free for reasonable usage
- **OneDrive Storage**: Included with Microsoft 365
- **No additional costs** for the API integration itself

## Support

If you encounter issues:
1. Check Azure App Registration logs
2. Review Microsoft Graph API documentation
3. Verify environment variables are correctly set
4. Test with a simple upload first

## Next Steps

After successful setup:
1. Test photo upload functionality
2. Verify thumbnails are generated correctly
3. Check photo approval workflow
4. Test on different devices and browsers
