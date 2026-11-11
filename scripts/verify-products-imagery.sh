#!/bin/bash
# Visual + console verification of the expressive /products imagery
set -e
cd /home/z/my-project
BASE=http://localhost:3000

# ── Dark (default) ──
agent-browser open "$BASE/products" >/dev/null 2>&1
agent-browser set viewport 1440 900 >/dev/null 2>&1
sleep 1
# scroll through the page to trigger scroll reveals
for y in 600 1400 2200 3000 3800 4600; do
  agent-browser eval "window.scrollTo(0,$y)" >/dev/null 2>&1
  sleep 0.45
done
agent-browser eval "window.scrollTo(0,0)" >/dev/null 2>&1
sleep 0.8
agent-browser screenshot --full /tmp/render/prod-products-dark.png >/dev/null 2>&1

# ── Light ──
agent-browser click '[aria-label="Toggle dark / light mode"]' >/dev/null 2>&1
sleep 0.8
agent-browser reload >/dev/null 2>&1
sleep 1
for y in 600 1400 2200 3000 3800 4600; do
  agent-browser eval "window.scrollTo(0,$y)" >/dev/null 2>&1
  sleep 0.4
done
agent-browser eval "window.scrollTo(0,0)" >/dev/null 2>&1
sleep 0.8
agent-browser screenshot --full /tmp/render/prod-products-light.png >/dev/null 2>&1

# ── Detail page (back to dark) ──
agent-browser click '[aria-label="Toggle dark / light mode"]' >/dev/null 2>&1
sleep 0.5
agent-browser open "$BASE/products/agma-cafm" >/dev/null 2>&1
sleep 1
for y in 600 1400 2200 3000; do
  agent-browser eval "window.scrollTo(0,$y)" >/dev/null 2>&1
  sleep 0.4
done
agent-browser eval "window.scrollTo(0,0)" >/dev/null 2>&1
sleep 0.8
agent-browser screenshot --full /tmp/render/prod-detail-cafm.png >/dev/null 2>&1

# ── console (fresh page) ──
agent-browser open "$BASE/products" >/dev/null 2>&1
sleep 1.5
echo "=== fresh /products console ==="
agent-browser console 2>/dev/null | tail -6 || echo "(none)"
echo "=== files ==="
ls -la /tmp/render/prod-products-*.png /tmp/render/prod-detail-cafm.png
