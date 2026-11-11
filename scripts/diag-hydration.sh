#!/usr/bin/env bash
# Focused diagnosis: full hydration error text + approve flow truth-check.
set -u
cd /home/z/my-project

lsof -ti:3000 2>/dev/null | xargs -r kill -9 2>/dev/null
pkill -9 -f "next dev" 2>/dev/null
pkill -9 -f "next-server" 2>/dev/null
sleep 1

bun dev > /tmp/dev.log 2>&1 &
DEV_PID=$!
code=""
for i in $(seq 1 90); do
  code=$(curl -s -o /dev/null -w "%{http_code}" -m 5 http://localhost:3000/admin 2>/dev/null)
  [ "$code" = "200" ] && break
  sleep 1
done
echo "== server up ($code) =="
sleep 2

agent-browser set viewport 1440 900 > /dev/null 2>&1
agent-browser open http://localhost:3000/admin > /dev/null 2>&1
agent-browser eval "localStorage.setItem('theme','dark')" > /dev/null 2>&1
agent-browser reload > /dev/null 2>&1
sleep 6

echo "===== FULL CONSOLE ====="
agent-browser console 2>/dev/null | tail -40
echo "===== END CONSOLE ====="

# pending count in DB before/after approving via UI
P0=$(curl -s "http://localhost:3000/api/admin/stats" | bun -e "const d=await new Response(Bun.stdin.stream()).text(); console.log(JSON.parse(d).pendingLeaves)")
agent-browser eval "document.querySelector('button[aria-label^=\"Approve\"]')?.click(); 'ok'" > /dev/null 2>&1
sleep 4
P1=$(curl -s "http://localhost:3000/api/admin/stats" | bun -e "const d=await new Response(Bun.stdin.stream()).text(); console.log(JSON.parse(d).pendingLeaves)")
echo "PENDING-COUNT: before=$P0 after=$P1"

kill -9 $DEV_PID 2>/dev/null
pkill -9 -f "next dev" 2>/dev/null
pkill -9 -f "next-server" 2>/dev/null
echo "done"
