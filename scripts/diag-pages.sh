#!/usr/bin/env bash
# Isolate the useId hydration shift: compare /admin vs /admin/employees vs /admin/payroll.
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

for PAGE in /admin /admin/employees /admin/payroll /admin/leave /; do
  agent-browser open "http://localhost:3000$PAGE" > /dev/null 2>&1
  sleep 5
  N=$(agent-browser console 2>/dev/null | grep -ciE "hydrat|mismatch")
  echo "$PAGE -> hydration-messages: $N"
done

kill -9 $DEV_PID 2>/dev/null
pkill -9 -f "next dev" 2>/dev/null
pkill -9 -f "next-server" 2>/dev/null
echo "done"
