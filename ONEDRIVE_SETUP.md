# OneDrive Integration Setup

This guide explains how to set up OneDrive integration for storing gallery photos.

## Setup Options

### Option 1: OneDrive Desktop Sync (Recommended for Development)

1. **Install OneDrive Desktop App**
   - Download from: https://www.microsoft.com/en-us/microsoft-365/onedrive/download
   - Sign in with your Microsoft account

2. **Configure Sync Folder**
   - Choose a local folder (e.g., `C:\Users\YourName\OneDrive\BGHS-Gallery`)
   - Note the full path for environment variable

3. **Set Environment Variable**
   ```bash
   # Add to .env.local
   ONEDRIVE_SYNC_PATH=C:\Users\YourName\OneDrive\BGHS-Gallery
   ```

4. **How It Works**
   - Photos are uploaded to your local `public/uploads/gallery/` folder
   - Simultaneously copied to your OneDrive sync folder
   - OneDrive automatically syncs to the cloud
   - Access photos from any device with OneDrive

### Option 2: Microsoft Graph API (Production)

1. **Azure App Registration**
   - Go to Azure Portal → App registrations
   - Create new registration
   - Note Application (client) ID and Directory (tenant) ID

2. **Configure Permissions**
   - Add API permissions: Microsoft Graph
   - Required permissions:
     - `Files.ReadWrite` (for file operations)
     - `User.Read` (for user info)

3. **Create Client Secret**
   - Go to Certificates & secrets
   - Create new client secret
   - Note the secret value

4. **Environment Variables**
   ```bash
   # Add to .env.local
   MICROSOFT_CLIENT_ID=your-client-id
   MICROSOFT_CLIENT_SECRET=your-client-secret
   MICROSOFT_TENANT_ID=your-tenant-id
   ONEDRIVE_REDIRECT_URI=http://localhost:3000/auth/onedrive/callback
   ```

## File Structure

```
public/
  uploads/
    gallery/
      photo1.jpg          # Original photos
      thumbnails/
        thumb_photo1.jpg  # Auto-generated thumbnails

OneDrive/
  BGHS-Gallery/           # Synced copies (if using Option 1)
    photo1.jpg
    photo2.jpg
```

## Features

### Current Implementation
- ✅ **Local Storage**: Photos stored in `public/uploads/gallery/`
- ✅ **OneDrive Sync**: Automatic copy to OneDrive folder (if configured)
- ✅ **Thumbnails**: Auto-generated 300x300 thumbnails
- ✅ **Image Metadata**: Dimensions, file size, MIME type
- ✅ **Approval Workflow**: Photos require admin approval
- ✅ **Role-Based Access**: Upload permissions based on user roles

### Security Features
- ✅ **File Validation**: Only image files allowed
- ✅ **Size Limits**: Maximum 10MB per photo
- ✅ **Permission Checks**: Only authorized users can upload
- ✅ **Approval Process**: All uploads require admin approval

## Usage

1. **Upload Photos**
   - Navigate to Gallery → Upload Photo
   - Select image file (JPG, PNG, GIF)
   - Add title, description, and category
   - Submit for approval

2. **Admin Approval**
   - Go to Gallery page
   - Click approve button on pending photos
   - Photos become visible to public

3. **OneDrive Access**
   - Photos automatically sync to your OneDrive
   - Access from any device
   - Share folders with others if needed

## Troubleshooting

### Common Issues

1. **OneDrive Sync Not Working**
   - Check `ONEDRIVE_SYNC_PATH` environment variable
   - Ensure OneDrive desktop app is running
   - Verify folder permissions

2. **Upload Failures**
   - Check file size (max 10MB)
   - Verify file type (images only)
   - Ensure user has upload permissions

3. **Thumbnail Generation Issues**
   - Install Sharp: `npm install sharp`
   - Check image format compatibility

### File Permissions
Ensure your application has write permissions to:
- `public/uploads/gallery/`
- `public/uploads/gallery/thumbnails/`
- OneDrive sync folder (if configured)

## Production Considerations

For production deployment:

1. **Use Cloud Storage**: Consider migrating to Supabase Storage or AWS S3
2. **CDN**: Implement CDN for faster image delivery
3. **Image Optimization**: Add more image processing options
4. **Backup Strategy**: Implement automated backups
5. **Monitoring**: Add logging for upload failures

## Alternative Cloud Storage Options

If OneDrive doesn't meet your needs:

1. **Supabase Storage** (Recommended)
   - Built-in with your current setup
   - Global CDN included
   - Automatic image transformations

2. **AWS S3 + CloudFront**
   - Industry standard
   - Excellent performance
   - Requires AWS account

3. **Cloudinary**
   - Specialized for images
   - Advanced image processing
   - Easy integration
