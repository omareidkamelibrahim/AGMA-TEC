#!/usr/bin/env bash
# Hydration verification for the admin ThemeToggle + ThemedToaster fixes.
# Starts a fresh dev server, runs the failing scenario (stored light theme),
# and scans the console for hydration errors. All in one tool call so the
# server cannot be reaped mid-run.
set -u
cd /home/z/my-project

PASS=""; FAIL=""

# 1. clean start -------------------------------------------------------------
(supervisorctl stop dev 2>/dev/null) || true
lsof -ti:3000 2>/dev/null | xargs -r kill -9 2>/dev/null
pkill -9 -f "next dev" 2>/dev/null
pkill -9 -f "next-server" 2>/dev/null
sleep 1
rm -rf .next
bun dev > /tmp/dev.log 2>&1 &
DEV_PID=$!

for i in $(seq 1 60); do
  code=$(curl -s -o /dev/null -w "%{http_code}" -m 5 http://localhost:3000/admin 2>/dev/null)
  [ "$code" = "200" ] && break
  sleep 1
done
if [ "$code" != "200" ]; then echo "SERVER FAILED TO START"; tail -20 /tmp/dev.log; kill -9 $DEV_PID 2>/dev/null; exit 1; fi
echo "== server up =="
sleep 2

# 2. reproduce failing scenario: stored light theme + hard reload ------------
agent-browser open http://localhost:3000/admin > /dev/null 2>&1
sleep 2
agent-browser eval "localStorage.setItem('theme','light')" > /dev/null 2>&1
agent-browser reload > /dev/null 2>&1
sleep 5

CONSOLE=$(agent-browser console 2>/dev/null)
if echo "$CONSOLE" | grep -qiE "hydrat|mismatch"; then
  FAIL="$FAIL | hydration error on /admin (light stored)"
  echo "$CONSOLE" | grep -iE "hydrat|mismatch" | head -5
else
  PASS="$PASS | /admin loads with stored light theme, zero hydration errors"
fi

# 3. toggle button state must match the stored (light) theme -----------------
STATE=$(agent-browser eval "const b=[...document.querySelectorAll('header button')].map(x=>({l:x.getAttribute('aria-label'),s:!!x.querySelector('.lucide-moon')})); JSON.stringify({btns:b, html:[...document.documentElement.classList], stored: localStorage.getItem('theme')})" 2>/dev/null | tr -d '\n')
echo "TOGGLE-STATE: $STATE"
echo "$STATE" | grep -q '"l":"Switch to dark mode"' && \
  PASS="$PASS | toggle shows Moon + 'Switch to dark mode' when light theme stored" || \
  FAIL="$FAIL | toggle state wrong: $STATE"

# 4. click the toggle -> theme flips to dark ---------------------------------
agent-browser eval "document.querySelector('header button[aria-label=\"Switch to dark mode\"]')?.click(); 'clicked'" > /dev/null 2>&1
sleep 2
AFTER=$(agent-browser eval "JSON.stringify({html:[...document.documentElement.classList], label: document.querySelector('header button[aria-label^=\"Switch\"]')?.getAttribute('aria-label'), moon: !!document.querySelector('header button[aria-label^=\"Switch\"] .lucide-moon')})" 2>/dev/null | tr -d '\n')
echo "AFTER-CLICK: $AFTER"
echo "$AFTER" | grep -q '"label":"Switch to light mode"' && echo "$AFTER" | grep -q '"html":\["dark"\]' && \
  PASS="$PASS | click flips to dark (html.dark, Sun icon, label updates)" || \
  FAIL="$FAIL | toggle click did not work: $AFTER"

# 5. back to light, then test homepage (ThemedToaster fix) --------------------
agent-browser eval "localStorage.setItem('theme','light')" > /dev/null 2>&1
agent-browser open http://localhost:3000/ > /dev/null 2>&1
agent-browser reload > /dev/null 2>&1
sleep 5
CONSOLE2=$(agent-browser console 2>/dev/null)
if echo "$CONSOLE2" | grep -qiE "hydrat|mismatch"; then
  FAIL="$FAIL | hydration error on / (light stored)"
  echo "$CONSOLE2" | grep -iE "hydrat|mismatch" | head -5
else
  PASS="$PASS | homepage / loads with stored light theme, zero hydration errors"
fi

# 6. /admin screenshot both themes for visual proof ---------------------------
agent-browser open http://localhost:3000/admin > /dev/null 2>&1
agent-browser reload > /dev/null 2>&1
sleep 4
mkdir -p /tmp/render
agent-browser screenshot /tmp/render/admin-light.png > /dev/null 2>&1
agent-browser eval "localStorage.setItem('theme','dark'); location.reload(); 'ok'" > /dev/null 2>&1
sleep 4
agent-browser screenshot /tmp/render/admin-dark.png > /dev/null 2>&1

# 7. teardown ------------------------------------------------------------------
kill -9 $DEV_PID 2>/dev/null
pkill -9 -f "next dev" 2>/dev/null
pkill -9 -f "next-server" 2>/dev/null

echo ""
echo "================= RESULT ================="
echo "PASS:$PASS"
echo "FAIL:$FAIL"
