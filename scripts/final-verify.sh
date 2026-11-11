#!/usr/bin/env bash
# Final verification: console capture sanity + light-theme reload + mobile sheet smoke test.
set -u
cd /home/z/my-project

lsof -ti:3000 2>/dev/null | xargs -r kill -9 2>/dev/null
pkill -9 -f "next dev" 2>/dev/null
pkill -9 -f "next-server" 2>/dev/null
sleep 1

bun dev > /tmp/dev.log 2>&1 &
DEV_PID=$!
for i in $(seq 1 90); do
  code=$(curl -s -o /dev/null -w "%{http_code}" -m 5 http://localhost:3000/admin 2>/dev/null)
  [ "$code" = "200" ] && break
  sleep 1
done
echo "== server up =="
sleep 2

echo "-- [1] console capture sanity (desktop /admin) --"
agent-browser open "http://localhost:3000/admin" > /dev/null 2>&1
sleep 6
agent-browser console > /tmp/console-desk.txt 2>/dev/null
echo "console lines captured: $(wc -l < /tmp/console-desk.txt)"
echo "hydration/mismatch hits: $(grep -ciE 'hydrat|mismatch' /tmp/console-desk.txt)"

echo "-- [2] light theme reload (worst hydration case) --"
agent-browser eval "localStorage.setItem('theme','light'); 'set'" > /dev/null 2>&1
agent-browser open "http://localhost:3000/admin" > /dev/null 2>&1
sleep 6
agent-browser console > /tmp/console-light.txt 2>/dev/null
echo "console lines captured: $(wc -l < /tmp/console-light.txt)"
echo "hydration/mismatch hits: $(grep -ciE 'hydrat|mismatch' /tmp/console-light.txt)"

echo "-- [3] mobile viewport: hamburger appears after mount, sheet opens --"
agent-browser eval "window.localStorage.setItem('theme','dark'); window.resizeTo(390,844); 'ok'" > /dev/null 2>&1
agent-browser resize 390 844 > /dev/null 2>&1
agent-browser open "http://localhost:3000/admin" > /dev/null 2>&1
sleep 6
SNAP=$(agent-browser snapshot 2>/dev/null)
echo "$SNAP" | grep -q "Open navigation" && echo "hamburger visible: YES" || echo "hamburger visible: NO"
agent-browser snapshot -i > /tmp/snap.txt 2>/dev/null
REF=$(grep -oE 'ref=[A-Za-z0-9]+' <(echo "$SNAP") | head -1 | cut -d= -f2)
# click via role/label
agent-browser click "Open navigation" > /dev/null 2>&1 || agent-browser click "ref=$REF" > /dev/null 2>&1
sleep 2
agent-browser screenshot /tmp/render/mobile-sheet.png > /dev/null 2>&1
agent-browser snapshot 2>/dev/null | grep -q "Admin navigation\|Leave Requests" && echo "sheet opened: YES" || echo "sheet opened: NO"

kill -9 $DEV_PID 2>/dev/null
pkill -9 -f "next dev" 2>/dev/null
pkill -9 -f "next-server" 2>/dev/null
echo "done"
