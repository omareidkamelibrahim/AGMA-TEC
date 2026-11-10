#!/usr/bin/env python3
"""Detect bead circles in AGMA logo mark: centers, radii, colors."""
from PIL import Image
import numpy as np
from scipy import ndimage

img = Image.open('/home/z/my-project/upload/Agma-Logo.jpg').convert('RGB')
a = np.asarray(img).astype(int)
h, w, _ = a.shape
r, g, b = a[..., 0], a[..., 1], a[..., 2]

# Blue mask: blue dominant, not white
mask = (b > 80) & (b - r > 30) & (g < 220)
print(f"blue pixels: {mask.sum()} of {h*w}")

# Label blobs
lab, n = ndimage.label(mask)
print(f"blobs found: {n}")
objs = ndimage.find_objects(lab)
blobs = []
for i, sl in enumerate(objs, 1):
    ys, xs = sl
    area = (lab[sl] == i).sum()
    if area < 30:
        continue
    bh = ys.stop - ys.start
    bw = xs.stop - xs.start
    # mean color of blob
    bm = lab[sl] == i
    mean_rgb = a[sl][bm].mean(axis=0).astype(int)
    # For circles: area vs bounding box tells if circle or fused pair
    fill = area / (bh * bw)
    blobs.append({
        'id': i, 'cx': (xs.start + xs.stop) / 2, 'cy': (ys.start + ys.stop) / 2,
        'w': bw, 'h': bh, 'area': area, 'fill': round(fill, 2),
        'rgb': tuple(mean_rgb), 'hex': '#{:02X}{:02X}{:02X}'.format(*mean_rgb.astype(int)),
        'bbox': (xs.start, ys.start, xs.stop, ys.stop),
    })

for bl in sorted(blobs, key=lambda x: (x['cy'], x['cx'])):
    print(f"id={bl['id']:2d} cx={bl['cx']:6.1f} cy={bl['cy']:6.1f} w={bl['w']:3d} h={bl['h']:3d} "
          f"area={bl['area']:6d} fill={bl['fill']:.2f} color={bl['hex']}")

# Erode fused blobs to isolate circle cores
print("\n--- Eroded analysis (to find circle cores inside fused shapes) ---")
er = ndimage.binary_erosion(mask, iterations=6)
lab2, n2 = ndimage.label(er)
objs2 = ndimage.find_objects(lab2)
for i, sl in enumerate(objs2, 1):
    ys, xs = sl
    area = (lab2[sl] == i).sum()
    if area < 40:
        continue
    bm = lab2[sl] == i
    mean_rgb = a[sl][bm].mean(axis=0).astype(int)
    print(f"core cx={(xs.start+xs.stop)/2:6.1f} cy={(ys.start+ys.stop)/2:6.1f} "
          f"w={xs.stop-xs.start:3d} h={ys.stop-ys.start:3d} "
          f"color={('{:02X}{:02X}{:02X}'.format(*mean_rgb))}")
