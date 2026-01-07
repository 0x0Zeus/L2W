# App Icon and Favicon Setup Guide

## Required Image Files

To use your project logo as the app icon and favicon, you need to create the following image files:

### 1. Main App Icon
- **File**: `assets/images/icon.png`
- **Size**: 1024x1024 pixels
- **Format**: PNG with transparency
- **Usage**: iOS app icon and general app icon

### 2. Android Adaptive Icons
- **File**: `assets/images/android-icon-foreground.png`
- **Size**: 1024x1024 pixels
- **Format**: PNG with transparency
- **Note**: Should be centered in a safe zone (inner 66% of the image)

- **File**: `assets/images/android-icon-background.png`
- **Size**: 1024x1024 pixels
- **Format**: PNG (can be solid color or pattern)

- **File**: `assets/images/android-icon-monochrome.png` (optional)
- **Size**: 1024x1024 pixels
- **Format**: PNG with transparency

### 3. Web Favicon
- **File**: `assets/images/favicon.png`
- **Size**: 32x32 or 48x48 pixels (larger sizes like 192x192 or 512x512 also work)
- **Format**: PNG or ICO

### 4. Splash Screen Icon
- **File**: `assets/images/splash-icon.png`
- **Size**: Recommended 200x200 pixels
- **Format**: PNG with transparency

## Steps to Set Up

1. **Prepare your logo image** (high resolution, preferably 1024x1024 or larger)

2. **Create the icon files**:
   - Use an image editor (Photoshop, GIMP, Figma, or online tools like https://www.favicon-generator.org/)
   - Resize and export each file according to the specifications above

3. **Place files in `assets/images/` directory**

4. **The app.json is already configured** to use these files - no code changes needed!

5. **For web favicon**, you may also want to add multiple sizes. You can create:
   - `favicon-16x16.png`
   - `favicon-32x32.png`
   - `favicon-192x192.png`
   - `favicon-512x512.png`

## Quick Setup with Online Tools

1. **For App Icons**: Use https://www.appicon.co/ or https://www.makeappicon.com/
   - Upload your 1024x1024 logo
   - Download the generated icons
   - Extract and place in `assets/images/`

2. **For Favicon**: Use https://www.favicon-generator.org/ or https://realfavicongenerator.net/
   - Upload your logo
   - Download generated favicons
   - Place in `assets/images/`

## After Adding Files

1. Restart your Expo development server
2. For mobile: Rebuild the app (icons are embedded at build time)
3. For web: The favicon will update automatically

