#!/usr/bin/env python3
"""Refined bead detection with multiple erosion levels."""
from PIL import Image
import numpy as np
from scipy import ndimage

img = Image.open('/home/z/my-project/upload/Agma-Logo.jpg').convert('RGB')
a = np.asarray(img).astype(int)
r, g, b = a[..., 0], a[..., 1], a[..., 2]
mask = (b > 70) & (b - r > 25) & (g < 225)

# Mark occupies roughly y 40..125, x 40..160 — restrict to mark zone
zone = np.zeros_like(mask)
zone[35:125, 30:170] = True
mask = mask & zone

for it in [3, 4, 5]:
    er = ndimage.binary_erosion(mask, iterations=it)
    lab, n = ndimage.label(er)
    objs = ndimage.find_objects(lab)
    print(f"\n=== erosion={it} ===")
    cores = []
    for i, sl in enumerate(objs, 1):
        ys, xs = sl
        area = (lab[sl] == i).sum()
        if area < 80:
            continue
        bm = lab[sl] == i
        mean_rgb = a[sl][bm].mean(axis=0).astype(int)
        cx, cy = (xs.start + xs.stop) / 2, (ys.start + ys.stop) / 2
        cores.append((cx, cy, xs.stop - xs.start, ys.stop - ys.start, '{:02X}{:02X}{:02X}'.format(*mean_rgb)))
    for c in sorted(cores, key=lambda x: (x[1], x[0])):
        print(f"  cx={c[0]:6.1f} cy={c[1]:6.1f} w={c[2]:3d} h={c[3]:3d} color=#{c[4]}")

# Also: check for very dark navy inclusion & measure circle diameters from row scans
print("\n=== horizontal scan rows through mark (runs of blue) ===")
for y in range(40, 126, 8):
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
