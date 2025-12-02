# Hero Section Image Dimension Analysis

## Current Hero Section Dimensions

### Viewport Dimensions:
- **Width**: 100vw (full viewport width)
- **Height**: 
  - Mobile: 60vh (60% of viewport height)
  - Small: 70vh
  - Medium: 75vh
  - Large: 80vh
  - XL: 85vh

### Example Calculations (1920x1080 Desktop):
- **Width**: 1920px
- **Height at 80vh**: ~864px
- **Aspect Ratio**: 1920:864 = **2.22:1** (approximately 16:7.2)

### Example Calculations (1366x768 Desktop):
- **Width**: 1366px
- **Height at 80vh**: ~614px
- **Aspect Ratio**: 1366:614 = **2.22:1**

## Required Image Aspect Ratio

### Recommended:
- **16:9** (1.78:1) - Standard widescreen
- **21:9** (2.33:1) - Ultra-wide
- **2:1** (2.0:1) - Wide format

### Current Hero Section:
- **~2.22:1** aspect ratio (very wide, landscape)

## Problem with Current Event Image

### Original Image (2x2 Collage):
- **Likely Aspect Ratio**: 1:1 (square) or 4:3 (portrait)
- **Problem**: Much taller than wide
- **Result**: When using `backgroundSize: 'cover'`, the image is cropped on top/bottom to fit the wide hero section

## Solutions

### Option 1: Crop/Resize Image to 16:9 (RECOMMENDED)
- **Target**: 1920x1080px (16:9 aspect ratio)
- **Action**: Crop the 2x2 collage to focus on the most important parts
- **Result**: Full image visible, no cropping in hero section

### Option 2: Use `backgroundSize: 'contain'`
- **Action**: Change CSS to show full image
- **Result**: Full image visible, but may have black bars on sides
- **Trade-off**: Shows full image but may look less polished

### Option 3: Create Hero-Specific Version
- **Action**: Create a separate 16:9 version of the event image
- **Resolution**: 1920x1080px minimum
- **Result**: Perfect fit, no cropping

## Recommended Image Specifications for Hero Section

### For Event Images:
- **Aspect Ratio**: 16:9 (1.78:1)
- **Resolution**: 1920x1080px minimum
- **Format**: JPEG or WebP
- **File Size**: < 500KB (optimized)
- **Focus**: Important content should be in center 60% of image (safe zone)

### For Regular Hero Images:
- **Aspect Ratio**: 16:9 or 21:9
- **Resolution**: 1920x1080px or 2560x1080px
- **Format**: JPEG or WebP
- **File Size**: < 500KB (optimized)

## Current Issue

The event image (2x2 collage) has a **square/portrait aspect ratio**, but the hero section requires a **wide landscape aspect ratio (16:9 or wider)**.

**Result**: The image is being cropped vertically to fit the wide container.

## Recommendation

1. **Crop the event image to 16:9 aspect ratio** (1920x1080px)
2. Focus on the most important parts of the collage
3. Or create a new hero-specific version that highlights key elements in a 16:9 format

