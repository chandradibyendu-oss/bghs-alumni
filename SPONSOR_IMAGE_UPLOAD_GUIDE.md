# Sponsor Image Upload Guide

## Overview

Event sponsors can now upload banner and logo images directly through the event creation/edit forms. Images are automatically optimized based on sponsor tier for best display quality.

## Image Upload Features

### ✅ **Direct Upload**
- Upload images directly from your computer
- No need to host images externally
- Automatic optimization and resizing

### ✅ **URL Alternative**
- Still supports external image URLs
- Use if you already have images hosted elsewhere

### ✅ **Live Preview**
- See uploaded images immediately
- Preview shows how images will appear

### ✅ **Tier-Based Optimization**
- Images automatically optimized for each sponsor tier
- Different dimensions for Platinum, Gold, Silver, and Bronze

## Recommended Image Dimensions

### **Platinum Sponsors** (Highest Visibility)
- **Banner/Poster**: 
  - **Recommended**: 1920x1080px (16:9 aspect ratio)
  - **Minimum**: 1600x900px
  - **Maximum File Size**: 5MB
  - **Format**: JPG, PNG, WebP
  - **Usage**: Large banner display on event page

### **Gold Sponsors** (High Visibility)
- **Banner/Poster**:
  - **Recommended**: 1200x900px (4:3 aspect ratio)
  - **Minimum**: 1000x750px
  - **Maximum File Size**: 5MB
  - **Format**: JPG, PNG, WebP
  - **Usage**: Medium banner display on event page

### **Silver/Bronze Sponsors** (Standard Visibility)
- **Logo**:
  - **Recommended**: 800x800px (Square, 1:1 aspect ratio)
  - **Minimum**: 600x600px
  - **Maximum File Size**: 5MB
  - **Format**: JPG, PNG, WebP (PNG recommended for logos with transparency)
  - **Usage**: Compact logo display in grid

## Image Specifications by Tier

### Platinum Tier
```
Banner Display:
- Aspect Ratio: 16:9 (wide)
- Display Size: Large (400x225px container)
- Recommended Upload: 1920x1080px
- Auto-optimized to: Max 1920x1080px, 85% quality
```

### Gold Tier
```
Banner Display:
- Aspect Ratio: 4:3 (medium)
- Display Size: Medium (300x225px container)
- Recommended Upload: 1200x900px
- Auto-optimized to: Max 1200x900px, 85% quality
```

### Silver/Bronze Tier
```
Logo Display:
- Aspect Ratio: 1:1 (square)
- Display Size: Small (120x120px container)
- Recommended Upload: 800x800px
- Auto-optimized to: Max 800x800px, 90% quality
```

## How to Upload Sponsor Images

### Step 1: Add Sponsor
1. Go to Event Creation/Edit page
2. Scroll to "Event Sponsors" section
3. Click "+ Add Sponsor"

### Step 2: Fill Sponsor Details
1. Enter Sponsor Name
2. Select Sponsor Tier (Platinum, Gold, Silver, or Bronze)

### Step 3: Upload Images

#### For Platinum/Gold Sponsors:
1. **Banner Upload** (Required for best display):
   - Click "Choose File" under "Banner/Poster"
   - Select your banner image (1920x1080px for Platinum, 1200x900px for Gold)
   - Wait for upload to complete
   - Preview will appear automatically

2. **Logo Upload** (Optional):
   - Click "Choose File" under "Logo"
   - Select your square logo (800x800px)
   - Preview will appear

#### For Silver/Bronze Sponsors:
1. **Logo Upload** (Required):
   - Click "Choose File" under "Logo"
   - Select your square logo (800x800px)
   - Preview will appear

2. **Banner Upload** (Optional):
   - Can upload banner if needed
   - Will be used as fallback

### Step 4: Alternative - Use URL
- If you prefer to use external URLs, enter them in the URL input fields
- Upload and URL options work together

## Image Optimization

### Automatic Optimization
- **Format**: All images converted to JPEG for web optimization
- **Quality**: 
  - Logos: 90% quality (preserves detail)
  - Banners: 85% quality (good balance)
- **Resizing**: Images automatically resized to recommended dimensions
- **Aspect Ratio**: Maintained during optimization

### Storage
- Images stored in Cloudflare R2
- Path: `events/sponsors/`
- Naming: `sponsor-{eventId}-{index}-{type}-{timestamp}.jpg`

## Best Practices

### 1. **Image Quality**
- Use high-resolution source images
- System will optimize automatically
- Better source = better output

### 2. **File Formats**
- **Logos**: PNG recommended (supports transparency)
- **Banners**: JPG recommended (smaller file size)
- Both formats supported

### 3. **File Size**
- Keep source files under 5MB
- System optimizes automatically
- Larger files may take longer to upload

### 4. **Aspect Ratios**
- **Platinum**: Use 16:9 (wide) banners
- **Gold**: Use 4:3 (medium) banners
- **Silver/Bronze**: Use 1:1 (square) logos

### 5. **Content Guidelines**
- Ensure text is readable at display size
- Keep important content in center
- Avoid placing critical info near edges

## Troubleshooting

### Upload Fails
- Check file size (must be < 5MB)
- Check file format (must be image file)
- Ensure you have admin/event_manager permissions

### Image Not Displaying
- Check if URL is correct
- Verify image is accessible
- Try re-uploading the image

### Image Looks Blurry
- Upload higher resolution source image
- Ensure aspect ratio matches recommendations
- Check if image was properly optimized

## Technical Details

### API Endpoint
- **Route**: `/api/events/upload-sponsor-image`
- **Method**: POST
- **Auth**: Requires admin/event_manager/content_creator role
- **Max Size**: 5MB per image
- **Formats**: All image types (JPG, PNG, WebP, etc.)

### Image Processing
- Uses Sharp library for optimization
- Automatic format conversion to JPEG
- Maintains aspect ratio
- Resizes to tier-specific dimensions

## Summary

| Tier | Image Type | Recommended Size | Aspect Ratio | Display Size |
|------|------------|------------------|--------------|--------------|
| Platinum | Banner | 1920x1080px | 16:9 | Large (400x225px) |
| Gold | Banner | 1200x900px | 4:3 | Medium (300x225px) |
| Silver | Logo | 800x800px | 1:1 | Small (120x120px) |
| Bronze | Logo | 800x800px | 1:1 | Small (120x120px) |

All images are automatically optimized for web performance while maintaining quality!


