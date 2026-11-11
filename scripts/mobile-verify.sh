#!/usr/bin/env bash
# Mobile smoke test: hamburger appears after mount, sheet opens with nav links.
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

agent-browser set viewport 390 844 > /dev/null 2>&1
agent-browser open "http://localhost:3000/admin" > /dev/null 2>&1
sleep 6

echo "-- hydration on mobile viewport --"
agent-browser console > /tmp/console-mob.txt 2>/dev/null
echo "console lines: $(wc -l < /tmp/console-mob.txt), hydration/mismatch hits: $(grep -ciE 'hydrat|mismatch' /tmp/console-mob.txt)"

echo "-- hamburger + sheet interaction --"
if agent-browser click '[aria-label="Open navigation"]' > /dev/null 2>&1; then
  echo "clicked hamburger: YES"
else
  echo "clicked hamburger: NO"
fi
sleep 2
agent-browser screenshot /tmp/render/mobile-sheet2.png > /dev/null 2>&1
SNAP=$(agent-browser snapshot 2>/dev/null)
echo "sheet title present: $(echo "$SNAP" | grep -c 'Admin navigation')"
echo "Back to website in sheet: $(echo "$SNAP" | grep -c 'Back to website')"

agent-browser press Escape > /dev/null 2>&1
sleep 1
agent-browser screenshot /tmp/render/mobile-closed.png > /dev/null 2>&1

kill -9 $DEV_PID 2>/dev/null
pkill -9 -f "next dev" 2>/dev/null
pkill -9 -f "next-server" 2>/dev/null
echo "done"
