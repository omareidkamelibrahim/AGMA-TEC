#!/usr/bin/env python3
"""Extract exact brand colors from the AGMA TEC logo."""
from PIL import Image
from collections import Counter

img = Image.open('/home/z/my-project/upload/Agma-Logo.jpg').convert('RGB')
w, h = img.size
print(f"Image size: {w}x{h}")

# Quantize to reduce JPEG noise, count colors
small = img.quantize(colors=32, method=Image.Quantize.MEDIANCUT).convert('RGB')
counts = Counter(small.getdata())

def hexc(rgb):
    return '#{:02X}{:02X}{:02X}'.format(*rgb)

def luminance(rgb):
    r, g, b = [x / 255 for x in rgb]
    def lin(c):
        return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4
    return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b)

total = w * h
print("\nTop colors (hex, share, luminance):")
for rgb, c in counts.most_common(20):
    share = c / total * 100
    lum = luminance(rgb)
    if share > 0.15:
        print(f"  {hexc(rgb)}  {share:5.2f}%  lum={lum:.3f}")

# Classify: ignore near-white / near-gray background
print("\nBlues / saturated colors only:")
blues = []
for rgb, c in counts.most_common(40):
    r, g, b = rgb
    share = c / total * 100
    is_white = r > 230 and g > 230 and b > 230
    is_gray = abs(r - g) < 12 and abs(g - b) < 12 and abs(r - b) < 12
    if not is_white and not is_gray and share > 0.3:
        blues.append((rgb, share))
        print(f"  {hexc(rgb)}  share={share:5.2f}%  RGB={rgb}")

# Sample specific regions: the logo mark occupies the upper middle area
print("\nRegion sampling (logo mark area):")
for name, (x0, y0, x1, y1) in {
    'mark_top_circle': (0.40, 0.05, 0.60, 0.25),
    'mark_mid':        (0.30, 0.25, 0.70, 0.45),
    'mark_bottom_left':(0.15, 0.45, 0.35, 0.65),
    'mark_bottom_right':(0.65, 0.45, 0.85, 0.65),
    'text_agmatec':    (0.15, 0.68, 0.85, 0.80),
    'tagline':         (0.05, 0.82, 0.95, 0.92),
}.items():
    region = img.crop((int(x0*w), int(y0*h), int(x1*w), int(y1*h)))
    reg = region.quantize(colors=8).convert('RGB')
    rc = Counter(reg.getdata())
    top = [f"{hexc(rgb)}({c})" for rgb, c in rc.most_common(4)]
    print(f"  {name}: {top}")
