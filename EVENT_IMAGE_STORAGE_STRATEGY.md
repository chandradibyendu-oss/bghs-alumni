# Event Image Storage Strategy

## Overview
Event images are stored separately from gallery photos to maintain clear organization and prevent promotional images from appearing in the alumni photo gallery.

## Storage Location

### Cloudflare R2 Structure
```
bghs-gallery/
├── gallery/              # Alumni photo gallery (memories, events photos)
├── events/               # Event promotional/hero images (NEW)
├── evidence/             # Verification documents
└── registration-pdfs/    # Registration certificates
```

## Implementation Details

### 1. Storage Path
- **Folder**: `events/`
- **Naming**: `event-{eventId}-{timestamp}.jpg`
- **Optimization**: Automatically resized to max 1920x1080px, 85% JPEG quality

### 2. Features
- ✅ **Image Upload**: Direct upload from admin event form
- ✅ **URL Fallback**: Still supports external image URLs
- ✅ **Auto-Optimization**: Images are automatically optimized for web
- ✅ **Preview**: Live preview before saving
- ✅ **Separate from Gallery**: Event images don't appear in gallery

### 3. API Endpoint
- **Route**: `/api/events/upload-image`
- **Method**: POST
- **Auth**: Requires admin/event_manager/content_creator role
- **Max Size**: 10MB per image
- **Formats**: All image types (JPG, PNG, WebP, etc.)

### 4. Usage in Event Forms

#### Create Event (`/admin/events/new`)
- File upload input
- Image preview
- URL input (alternative)
- Both options available

#### Edit Event (`/admin/events/[id]/edit`)
- Same upload functionality
- Shows existing image
- Can replace or update

## Benefits

1. **Organization**: Clear separation between promotional and gallery images
2. **Performance**: Optimized images load faster
3. **Flexibility**: Supports both upload and external URLs
4. **User Experience**: Easy upload with preview
5. **Storage Efficiency**: Optimized file sizes reduce storage costs

## Image Specifications

- **Recommended Size**: 1920x1080px (16:9 aspect ratio)
- **Max Upload**: 10MB
- **Optimized Output**: Max 1920x1080px, 85% quality JPEG
- **Use Cases**: 
  - Hero section slides
  - Event card thumbnails
  - Event detail pages

## Gallery Exclusion

Event images are **NOT** shown in the gallery because:
- They are promotional/marketing materials
- Gallery is for alumni memories and event photos
- Different purpose and audience
- Maintains gallery quality and relevance

## Future Enhancements

- [ ] Image cropping tool
- [ ] Multiple image uploads per event
- [ ] Image CDN caching
- [ ] Automatic thumbnail generation
- [ ] Image alt text support


