#!/usr/bin/env python3
"""Generate AGMA TEC bead-mark SVG (faithful recreation from pixel analysis).

Beads (original logo px coords, r=10.8):
  A apex        (102.5, 58.5)   royal  #16417B
  B mid-right   (117.0, 83.0)   navy   #193865
  C bottom-right(132.5, 107.5)  dark   #183154
  D mid-left    (87.5, 84.0)    vivid  #084993
  E bottom-cnt  (102.5, 107.5)  royal2 #16407B
  F bottom-left (72.5, 108.5)   bright #1A51A0
Necks: A-B, B-C, D-E
"""
import math

R = 10.8
beads = {
    'A': (102.5, 58.5),
    'B': (117.0, 83.0),
    'C': (132.5, 107.5),
    'D': (87.5, 84.0),
    'E': (102.5, 107.5),
    'F': (72.5, 108.5),
}
pairs = [('A', 'B'), ('B', 'C'), ('D', 'E')]
W = 5.8  # neck half width

def neck_path(p1, p2, r=R, w=W):
    x1, y1 = p1
    x2, y2 = p2
    dx, dy = x2 - x1, y2 - y1
    L = math.hypot(dx, dy)
    ux, uy = dx / L, dy / L
    vx, vy = -uy, ux
    mx, my = (x1 + x2) / 2, (y1 + y2) / 2
    e1a = (x1 + vx * r, y1 + vy * r)
    e1b = (x1 - vx * r, y1 - vy * r)
    e2a = (x2 + vx * r, y2 + vy * r)
    e2b = (x2 - vx * r, y2 - vy * r)
    wa = (mx + vx * w, my + vy * w)
    wb = (mx - vx * w, my - vy * w)
    ca = (2 * wa[0] - (e1a[0] + e2a[0]) / 2, 2 * wa[1] - (e1a[1] + e2a[1]) / 2)
    cb = (2 * wb[0] - (e1b[0] + e2b[0]) / 2, 2 * wb[1] - (e1b[1] + e2b[1]) / 2)
    def f(p): return f"{p[0]:.2f} {p[1]:.2f}"
    return (f"M {f(e1a)} Q {f(ca)} {f(e2a)} "
            f"L {f(e2b)} Q {f(cb)} {f(e1b)} Z")

# normalize: translate(-60, -44) -> viewBox 0 0 85 79
def N(p):
    return (p[0] - 60.0, p[1] - 44.0)

beads_n = {k: N(v) for k, v in beads.items()}

def grad_id(a, b): return f"g{a}{b}"

def build(palette, opacity=1.0):
    """palette: dict bead->color; returns svg inner elements"""
    defs = []
    body = []
    for a, b in pairs:
        gid = grad_id(a, b)
        defs.append(
            f'    <linearGradient id="{gid}" x1="{beads_n[a][0]:.1f}" y1="{beads_n[a][1]:.1f}" '
            f'x2="{beads_n[b][0]:.1f}" y2="{beads_n[b][1]:.1f}" gradientUnits="userSpaceOnUse">\n'
            f'      <stop offset="0" stopColor="{palette[a]}"/>\n'
            f'      <stop offset="1" stopColor="{palette[b]}"/>\n'
            f'    </linearGradient>')
        d = neck_path(beads_n[a], beads_n[b])
        # translate coords in path string
        body.append(f'      <path d="{d}" fill="url(#{gid})" opacity="{opacity}"/>')
    for k, (x, y) in beads_n.items():
        body.append(f'      <circle cx="{x:.1f}" cy="{y:.1f}" r="{R}" fill="{palette[k]}"/>')
    return "\n".join(defs), "\n".join(body)

# Luminous palette for dark backgrounds (brighter brand blues, same luminance flow)
lum = {'A': '#3E7ED2', 'B': '#2E5FA8', 'C': '#234A85',
       'D': '#4D97E9', 'E': '#2E6BC4', 'F': '#5FA9F2'}
# Brand palette (original logo colors)
brand = {'A': '#16417B', 'B': '#193865', 'C': '#183154',
         'D': '#0C4C97', 'E': '#16407B', 'F': '#1A51A0'}

defs_l, body_l = build(lum)
svg_lum = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 85 79" fill="none">\n'
           f'  <defs>\n{defs_l}\n  </defs>\n{body_l}\n</svg>')

defs_b, body_b = build(brand)
svg_brand = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 85 79" fill="none">\n'
             f'  <defs>\n{defs_b}\n  </defs>\n{body_b}\n</svg>')

with open('/home/z/my-project/public/logo.svg', 'w') as f:
    f.write(svg_brand)

# Print both for use in React components
print("=== NECK PATHS (normalized coords) ===")
for a, b in pairs:
    print(f"{a}-{b}: {neck_path(beads[a], beads[b])}")
print("\n=== BEAD CENTERS (normalized) ===")
for k, (x, y) in beads_n.items():
    print(f"{k}: ({x:.1f}, {y:.1f})")
print("\n=== brand svg written to public/logo.svg ===")
print(svg_brand)
