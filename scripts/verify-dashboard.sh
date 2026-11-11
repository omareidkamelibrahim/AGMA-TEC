#!/usr/bin/env bash
# Final verification v2: per-page console isolation + fresh build cache.
set -u
cd /home/z/my-project

PASS=""; FAIL=""

lsof -ti:3000 2>/dev/null | xargs -r kill -9 2>/dev/null
pkill -9 -f "next dev" 2>/dev/null
pkill -9 -f "next-server" 2>/dev/null
sleep 1
rm -rf .next

bun dev > /tmp/dev.log 2>&1 &
DEV_PID=$!
code=""
for i in $(seq 1 120); do
  code=$(curl -s -o /dev/null -w "%{http_code}" -m 5 http://localhost:3000/admin 2>/dev/null)
  [ "$code" = "200" ] && break
  sleep 1
done
if [ "$code" != "200" ]; then echo "SERVER FAILED ($code)"; tail -25 /tmp/dev.log; kill -9 $DEV_PID 2>/dev/null; exit 1; fi
echo "== server up (fresh .next) =="
sleep 2

agent-browser set viewport 1440 900 > /dev/null 2>&1
agent-browser eval "localStorage.setItem('theme','dark')" > /dev/null 2>&1

# 1. hydration scan — clear console buffer BEFORE each navigation --------------
for PAGE in /admin /admin/employees /admin/leave /admin/payroll /; do
  agent-browser console --clear > /dev/null 2>&1
  agent-browser open "http://localhost:3000$PAGE" > /dev/null 2>&1
  sleep 6
  N=$(agent-browser console 2>/dev/null | grep -ciE "hydrat|mismatch")
  if [ "$N" -eq 0 ]; then
    PASS="$PASS | $PAGE hydration-clean"
  else
    FAIL="$FAIL | $PAGE has $N hydration messages"
    echo "--- $PAGE diff ---"
    agent-browser console 2>/dev/null | grep -iE -A12 "hydrat|mismatch" | head -30
  fi
done

# 2. dashboard structure (properly parsed) --------------------------------------
agent-browser console --clear > /dev/null 2>&1
agent-browser open http://localhost:3000/admin > /dev/null 2>&1
sleep 6
agent-browser eval "JSON.stringify({kpi: document.querySelectorAll('.card-lift').length, charts: document.querySelectorAll('.recharts-surface').length, approve: document.querySelectorAll('button[aria-label^=\"Approve\"]').length, donut: document.querySelector('.pointer-events-none .font-display')?.textContent, export: !!document.querySelector('a[href=\"/api/admin/employees/export\"]'), heads: document.querySelectorAll('h2').length})" 2>/dev/null | tr -d '\n' > /tmp/struct.txt
STRUCT_OK=$(bun -e "
const raw = require('fs').readFileSync('/tmp/struct.txt','utf8').replace(/\\\\\\\\/g, '');
const s = JSON.parse(raw);
console.log(String(s.kpi === 5 && s.charts >= 3 && s.approve >= 1 && !!s.donut && s.export === true && s.heads === 8));
" 2>/dev/null)
echo "STRUCT: $(cat /tmp/struct.txt) -> OK=$STRUCT_OK"
[ "$STRUCT_OK" = "true" ] && PASS="$PASS | dashboard structure complete" || FAIL="$FAIL | structure check failed"

# 3. approve flow ------------------------------------------------------------------
P0=$(curl -s http://localhost:3000/api/admin/stats | bun -e "const d=await new Response(Bun.stdin.stream()).text(); console.log(JSON.parse(d).pendingLeaves)")
agent-browser eval "document.querySelector('button[aria-label^=\"Approve\"]')?.click(); 'ok'" > /dev/null 2>&1
sleep 4
P1=$(curl -s http://localhost:3000/api/admin/stats | bun -e "const d=await new Response(Bun.stdin.stream()).text(); console.log(JSON.parse(d).pendingLeaves)")
echo "APPROVE: pending $P0 -> $P1"
[ "$P1" -lt "$P0" ] 2>/dev/null && PASS="$PASS | approve persists ($P0→$P1)" || FAIL="$FAIL | approve did not persist ($P0→$P1)"

# 4. screenshots ---------------------------------------------------------------------
agent-browser eval "window.scrollTo(0,0)" > /dev/null 2>&1
sleep 1
mkdir -p /tmp/render
agent-browser screenshot /tmp/render/dash-dark.png > /dev/null 2>&1
agent-browser eval "localStorage.setItem('theme','light'); location.reload(); 'ok'" > /dev/null 2>&1
sleep 6
agent-browser screenshot /tmp/render/dash-light.png > /dev/null 2>&1
agent-browser eval "localStorage.setItem('theme','dark'); location.reload(); 'ok'" > /dev/null 2>&1
sleep 5
agent-browser set viewport 390 844 > /dev/null 2>&1
agent-browser reload > /dev/null 2>&1
sleep 5
agent-browser screenshot /tmp/render/dash-mobile.png > /dev/null 2>&1

kill -9 $DEV_PID 2>/dev/null
pkill -9 -f "next dev" 2>/dev/null
pkill -9 -f "next-server" 2>/dev/null

echo ""
echo "================= RESULT ================="
echo "PASS:$PASS"
echo "FAIL:$FAIL"
