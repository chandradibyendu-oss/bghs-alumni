# Hero Section Image Specifications

## Problem: Black Bars on Sides

The black bars appear because:
- **Hero section aspect ratio**: ~2.22:1 (very wide, landscape)
- **Current images**: Likely 1:1 (square) or 4:3 (portrait)
- **Result**: When using `backgroundSize: 'contain'`, images don't fill the width

## Recommended Image Dimensions

### Option 1: 16:9 Aspect Ratio (RECOMMENDED - Standard)
**Best for**: General use, easy to create, widely supported

- **Aspect Ratio**: 16:9 (1.78:1)
- **Recommended Resolutions**:
  - **Desktop**: 1920×1080px (Full HD)
  - **Large Desktop**: 2560×1440px (2K)
  - **Ultra-wide**: 3840×2160px (4K)
- **File Format**: JPEG or WebP
- **File Size**: < 500KB (optimized)
- **Note**: Will have slight black bars on very wide screens, but minimal

### Option 2: 21:9 Aspect Ratio (Ultra-Wide)
**Best for**: Perfect fit on wide screens, cinematic look

- **Aspect Ratio**: 21:9 (2.33:1)
- **Recommended Resolutions**:
  - **Standard**: 2560×1080px
  - **Large**: 3440×1440px
  - **Ultra**: 5120×2160px
- **File Format**: JPEG or WebP
- **File Size**: < 500KB (optimized)
- **Note**: Perfect fit for most screens, no black bars

### Option 3: 2:1 Aspect Ratio (Wide Format)
**Best for**: Balance between 16:9 and 21:9

- **Aspect Ratio**: 2:1 (2.0:1)
- **Recommended Resolutions**:
  - **Standard**: 1920×960px
  - **Large**: 2560×1280px
  - **Ultra**: 3840×1920px
- **File Format**: JPEG or WebP
- **File Size**: < 500KB (optimized)
- **Note**: Good compromise, minimal black bars

## Hero Section Actual Dimensions

### Desktop (1920×1080 screen):
- **Width**: 1920px (100vw)
- **Height**: ~864px (80vh)
- **Aspect Ratio**: 2.22:1

### Large Desktop (2560×1440 screen):
- **Width**: 2560px (100vw)
- **Height**: ~1152px (80vh)
- **Aspect Ratio**: 2.22:1

## Recommendation

**Use 16:9 (1920×1080px)** because:
1. ✅ Standard format, easy to create
2. ✅ Works well on most screens
3. ✅ Minimal black bars (only on very wide screens)
4. ✅ Widely supported by image editing tools
5. ✅ Good balance between quality and file size

## For Event Images (2x2 Collage)

If you want to use the 2x2 collage:
1. **Crop to 16:9**: Focus on the most important 2-3 photos
2. **Create new layout**: Rearrange photos in a 16:9 format
3. **Use single best photo**: Pick the most impactful image and crop to 16:9

## Image Preparation Tips

1. **Focus Area**: Important content should be in the center 60% (safe zone)
2. **Edges**: Avoid important content near edges (may be cropped on some screens)
3. **Compression**: Use 85-90% JPEG quality for best balance
4. **Testing**: Test on different screen sizes before finalizing

## Quick Reference

| Aspect Ratio | Resolution | Black Bars? | Recommendation |
|-------------|------------|-------------|----------------|
| 16:9 | 1920×1080 | Minimal | ⭐ Best Choice |
| 21:9 | 2560×1080 | None | Perfect fit |
| 2:1 | 1920×960 | Minimal | Good alternative |
| 1:1 | 1920×1920 | Large | ❌ Not recommended |
| 4:3 | 1920×1440 | Large | ❌ Not recommended |




