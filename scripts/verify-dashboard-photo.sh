#!/bin/bash
# Visual + console verification of the new admin dashboard
set -e
cd /home/z/my-project
BASE=http://localhost:3000
mkdir -p /tmp/render

agent-browser open "$BASE/admin" >/dev/null 2>&1
agent-browser set viewport 1440 900 >/dev/null 2>&1
sleep 2.5
# scroll to trigger all reveal animations + chart renders
for y in 500 1000 1500 2000 2600; do
  agent-browser eval "window.scrollTo(0,$y)" >/dev/null 2>&1
  sleep 0.4
done
agent-browser eval "window.scrollTo(0,0)" >/dev/null 2>&1
sleep 3.5
agent-browser screenshot --full /tmp/render/admin-dark.png >/dev/null 2>&1
echo "=== console (admin, fresh session) ==="
agent-browser console 2>/dev/null | grep -iE "error|hydrat" | grep -viE "DialogContent|Fast Refresh|HMR|Download the React" || echo "(clean)"

# ── light theme ──
agent-browser click '[aria-label="Switch to light mode"]' >/dev/null 2>&1
sleep 0.8
agent-browser reload >/dev/null 2>&1
sleep 2
for y in 500 1000 1500 2000 2600; do
  agent-browser eval "window.scrollTo(0,$y)" >/dev/null 2>&1
  sleep 0.3
done
agent-browser eval "window.scrollTo(0,0)" >/dev/null 2>&1
sleep 3.2
agent-browser screenshot --full /tmp/render/admin-light.png >/dev/null 2>&1

# back to dark for the rest
agent-browser click '[aria-label="Switch to dark mode"]' >/dev/null 2>&1
sleep 0.6

# ── subpages (viewport shots) ──
for p in testimonials inquiries products services clients newsletter; do
  agent-browser open "$BASE/admin/$p" >/dev/null 2>&1
  sleep 1.6
  agent-browser screenshot /tmp/render/admin-$p.png >/dev/null 2>&1
done

echo "=== files ==="
ls -la /tmp/render/admin-*.png
