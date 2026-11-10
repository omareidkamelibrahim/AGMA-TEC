#!/usr/bin/env python3
"""ASCII render of logo mask to map exact neck topology."""
from PIL import Image
import numpy as np

img = Image.open('/home/z/my-project/upload/Agma-Logo.jpg').convert('RGB')
a = np.asarray(img).astype(int)
r, g, b = a[..., 0], a[..., 1], a[..., 2]
mask = (b > 70) & (b - r > 25) & (g < 225)

# Mark zone
m = mask[40:122, 55:150]
# Downsample: 2px per char horizontally, 3px per char vertically (chars are taller)
H, W = m.shape
for y in range(0, H, 3):
    line = ''
    for x in range(0, W, 2):
        block = m[y:y+3, x:x+2]
        frac = block.mean()
        line += '#' if frac > 0.5 else ('+' if frac > 0.2 else '.')
    print(f"{y+40:3d} {line}")

# Also scan rows finely around neck candidates
print("\n=== fine scans ===")
for y in [66, 68, 70, 74, 76, 92, 94, 96, 98, 100]:
    row = mask[y]
    runs = []
    in_run = False
    for x in range(len(row)):
        if row[x] and not in_run:
            start = x; in_run = True
        elif not row[x] and in_run:
            runs.append((start, x - 1)); in_run = False
    if in_run:
        runs.append((start, len(row) - 1))
    print(f"  y={y:3d}: {runs}")
