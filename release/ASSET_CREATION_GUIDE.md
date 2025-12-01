# Chrome Web Store Asset Specifications

## Required Visual Assets

Since automated image generation has reached quota limits, you'll need to create these assets manually using any design tool (Figma, Canva, Photoshop, etc.):

### 1. Extension Icons (3 sizes required)

**Design Specifications**:
- **Background**: Emerald green circle (#10B981 or similar)
- **Letter**: White "D" in bold sans-serif font (centered)
- **Badge**: Small orange circle with "Rs 5" in top-right (on 128px and 48px versions only)
- **Style**: Flat design, no shadows, clean edges

**Required Sizes**:
1. **icon-128.png** (128×128 pixels)
   - Full design with badge
   - Save to: `extension/assets/icon128.png`

2. **icon-48.png** (48×48 pixels)
   - Full design with badge
   - Save to: `extension/assets/icon48.png`

3. **icon-16.png** (16×16 pixels)
   - Simple design (just "D", no badge)
   - Save to: `extension/assets/icon16.png`

---

### 2. Promotional Screenshots (for Chrome Web Store)

**Screenshot 1: Cashback Widget (Primary)**
- **Size**: 1280×800 pixels
- **Content**: Show a Daraz product page with the cashback widget visible
- **Widget should show**: "Earn Rs. 5 Cashback" with green "Activate" button
- **Position**: Bottom-right corner of browser window
- **How to create**: 
  1. Load extension in Chrome
  2. Navigate to any Daraz.com.np product page
  3. Wait for widget to appear
  4. Capture screenshot at 1280×800 resolution
- **Save to**: `release/screenshot-1-widget-1280x800.png`

**Screenshot 2: Extension Popup**
- **Size**: 1280×800 pixels (but showing the 300×500 popup)
- **Content**: Extension popup showing balance and history
- **How to create**:
  1. Click extension icon in Chrome toolbar
  2. Popup shows balance, earnings, history
  3. Capture screenshot
- **Save to**: `release/screenshot-2-popup-1280x800.png`

**Screenshot 3: Confirmation Modal (Optional but recommended)**
- **Size**: 1280×800 pixels
- **Content**: Show the transparent disclosure modal
- **Modal should show**: "We earn Rs. 30, you get Rs. 5"
- **Save to**: `release/screenshot-3-modal-1280x800.png`

---

### 3. Promotional Tiles (Optional for better Store presence)

**Small Tile** (440×280 pixels)
- Extension icon + "Earn Rs. 5 Cashback" text
- Green gradient background
- Save to: `release/promo-tile-small-440x280.png`

**Large Tile** (920×680 pixels)
- Screenshot of widget + key benefit text
- "Transparent Cashback for Daraz Nepal"
- Save to: `release/promo-tile-large-920x680.png`

---

## Quick Creation Guide

### Option 1: Use Canva (Easiest)
1. Go to Canva.com
2. Create custom size documents for each asset
3. Use circle shapes, text, and simple graphics
4. Export as PNG at exact dimensions

### Option 2: Use Figma (Professional)
1. Create artboards at exact sizes
2. Design icon with vector shapes
3. Export at @1x resolution as PNG

### Option 3: Capture Real Screenshots (Best for screenshots)
1. Install extension in Chrome (Load unpacked)
2. Navigate to Daraz.com.np product page
3. Use Chrome DevTools to set viewport to 1280×800
4. Capture using screenshot tool
5. Edit/annotate if needed

---

## Asset Checklist

Before submitting to Chrome Web Store, ensure you have:

- [ ] icon16.png (16×16)
- [ ] icon48.png (48×48)
- [ ] icon128.png (128×128)
- [ ] At least 1 screenshot at 1280×800
- [ ] Privacy Policy hosted publicly
- [ ] manifest.json updated with privacy_policy URL

---

## Next Steps

1. **Create the 3 icons** using design tool (15 minutes)
2. **Capture 1-3 screenshots** from live extension (10 minutes)
3. **Save all files** to the locations specified above
4. **Update manifest.json** with actual Privacy Policy URL
5. **Package extension** as ZIP file
6. **Submit to Chrome Web Store**

Total time estimate: **30-45 minutes**
