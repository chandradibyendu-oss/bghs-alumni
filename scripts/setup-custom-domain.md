# 🚀 Cloudflare R2 Custom Domain Setup Guide

## Current Status
✅ R2 bucket created: `bghs-gallery`  
✅ Images uploading successfully to R2  
❌ Custom domain not configured properly  
❌ Images not displaying in gallery  

## Step 1: Configure R2 Bucket Public Access

1. **Go to Cloudflare Dashboard**
   - Visit: https://dash.cloudflare.com
   - Navigate to **R2 Object Storage**

2. **Select Your Bucket**
   - Click on `bghs-gallery`

3. **Enable Public Access**
   - Go to **Settings** tab
   - Scroll to **Public access**
   - Click **"Allow Access"**
   - This enables public read access to your bucket

## Step 2: Set Up Custom Domain

### Option A: Use Existing Domain (alumnibghs.org)

1. **In R2 Bucket Settings**
   - Go to **Settings** → **Public access**
   - Under **"Custom domains"**, click **"Connect Domain"**
   - Enter: `alumnibghs.org`
   - Click **"Continue"**

2. **Configure DNS Records**
   Cloudflare will show you DNS records to add:
   ```
   Type: CNAME
   Name: @ (or alumnibghs.org)
   Target: pub-12011e6d961a440ad2d8f07187ee8319.r2.dev
   ```

3. **Add DNS Record in Cloudflare**
   - Go to **DNS** → **Records**
   - Add the CNAME record shown above
   - Wait 5-10 minutes for propagation

### Option B: Use Subdomain (Recommended)

1. **Create Subdomain**
   - Use: `r2.alumnibghs.org` or `cdn.alumnibghs.org`
   - This is safer and doesn't conflict with your main domain

2. **Add DNS Record**
   ```
   Type: CNAME
   Name: r2 (or cdn)
   Target: pub-12011e6d961a440ad2d8f07187ee8319.r2.dev
   ```

## Step 3: Update Environment Variables

Update your `.env.local` file:

```env
# For subdomain approach (RECOMMENDED)
CLOUDFLARE_R2_CUSTOM_DOMAIN=r2.alumnibghs.org

# OR for root domain approach
# CLOUDFLARE_R2_CUSTOM_DOMAIN=alumnibghs.org
```

## Step 4: Test the Setup

1. **Restart your server**
   ```bash
   npm run build
   npx next start -p 3001
   ```

2. **Upload a test image**
   - Go to http://localhost:3001/gallery/upload
   - Upload any image

3. **Check the URL**
   - Look in browser console for the generated URL
   - Try opening the URL directly in a new tab
   - Should show: `https://r2.alumnibghs.org/gallery/filename.jpg`

## Step 5: Verify Custom Domain

Run this test script:
```bash
node scripts/test-r2-urls.js
```

## Troubleshooting

### If images still don't show:

1. **Check DNS propagation**
   - Use: https://www.whatsmydns.net/
   - Look up your custom domain

2. **Check R2 bucket permissions**
   - Ensure "Allow Access" is enabled
   - Verify custom domain is connected

3. **Check browser console**
   - Look for 403, 404, or CORS errors
   - Check network tab for failed requests

### Common Issues:

- **403 Forbidden**: R2 bucket not public
- **404 Not Found**: Custom domain not configured
- **CORS Error**: Need to configure CORS policy in R2

## Expected Result

After setup, your images should be accessible at:
- `https://r2.alumnibghs.org/gallery/filename.jpg`
- And display properly in the gallery

## Next Steps

Once working:
1. Test image upload in gallery
2. Verify images display correctly
3. Test image viewer functionality
4. Ready for production deployment!
