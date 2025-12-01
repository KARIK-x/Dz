#!/usr/bin/env python3
"""
Generate simple placeholder icons for Chrome Extension
Creates 16x16, 48x48, and 128x128 PNG icons
"""

try:
    from PIL import Image, ImageDraw, ImageFont
    PIL_AVAILABLE = True
except ImportError:
    PIL_AVAILABLE = False

import os

def create_simple_icon(size, output_path):
    """Create a simple green circle icon with 'D' letter"""
    if not PIL_AVAILABLE:
        print(f"PIL not available, creating blank {size}x{size} placeholder")
        # Create minimal PNG manually (this won't work well, just fallback)
        return False
    
    # Create image with transparency
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # Draw green circle background
    margin = 2
    draw.ellipse([margin, margin, size-margin, size-margin], 
                 fill=(16, 185, 129, 255))  # Emerald green
    
    # Draw white 'D' letter
    font_size = int(size * 0.6)
    try:
        # Try to use a nice font
        font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", font_size)
    except:
        # Fallback to default
        font = ImageFont.load_default()
    
    # Center the text
    text = "D"
    bbox = draw.textbbox((0, 0), text, font=font)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]
    
    text_x = (size - text_width) // 2
    text_y = (size - text_height) // 2 - int(size * 0.05)  # Slight adjustment
    
    draw.text((text_x, text_y), text, fill=(255, 255, 255, 255), font=font)
    
    # Add orange badge for larger sizes
    if size >= 48:
        badge_size = int(size * 0.35)
        badge_x = size - badge_size - 2
        badge_y = 2
        draw.ellipse([badge_x, badge_y, badge_x + badge_size, badge_y + badge_size],
                     fill=(251, 146, 60, 255))  # Orange
        
        # Add Rs 5 text on badge
        if size >= 128:
            badge_font_size = int(badge_size * 0.35)
            try:
                badge_font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", badge_font_size)
            except:
                badge_font = ImageFont.load_default()
            
            badge_text = "Rs5"
            badge_bbox = draw.textbbox((0, 0), badge_text, font=badge_font)
            badge_text_width = badge_bbox[2] - badge_bbox[0]
            badge_text_height = badge_bbox[3] - badge_bbox[1]
            
            badge_text_x = badge_x + (badge_size - badge_text_width) // 2
            badge_text_y = badge_y + (badge_size - badge_text_height) // 2
            
            draw.text((badge_text_x, badge_text_y), badge_text, 
                     fill=(255, 255, 255, 255), font=badge_font)
    
    # Save
    img.save(output_path, 'PNG')
    print(f"✓ Created {size}x{size} icon: {output_path}")
    return True

def main():
    # Create icons directory
    icons_dir = "extension/assets"
    os.makedirs(icons_dir, exist_ok=True)
    
    # Create three icon sizes
    sizes = [
        (16, f"{icons_dir}/icon16.png"),
        (48, f"{icons_dir}/icon48.png"),
        (128, f"{icons_dir}/icon128.png")
    ]
    
    if not PIL_AVAILABLE:
        print("❌ PIL (Pillow) not installed. Install with: pip3 install pillow")
        print("Creating placeholder files instead...")
        for size, path in sizes:
            # Create empty file as placeholder
            with open(path, 'wb') as f:
                f.write(b'')
            print(f"⚠ Created empty placeholder: {path}")
        return False
    
    success = True
    for size, path in sizes:
        if not create_simple_icon(size, path):
            success = False
    
    if success:
        print("\n✅ All icons created successfully!")
    else:
        print("\n⚠ Some icons could not be created")
    
    return success

if __name__ == "__main__":
    main()
