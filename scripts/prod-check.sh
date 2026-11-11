#!/usr/bin/env bash
# Production-mode browser check (server must already be running on :3000)
set -u
for PAGE in / /admin; do
  agent-browser open "http://localhost:3000$PAGE" > /dev/null 2>&1
  sleep 5
  agent-browser console > /tmp/prod-console.txt 2>/dev/null
  HITS=$(grep -ciE 'error|hydrat|mismatch' /tmp/prod-console.txt)
  echo "$PAGE -> console error/hydration hits: $HITS (lines: $(wc -l < /tmp/prod-console.txt))"
done
agent-browser screenshot /tmp/render/prod-home.png > /dev/null 2>&1
agent-browser open "http://localhost:3000/admin" > /dev/null 2>&1
sleep 5
agent-browser screenshot /tmp/render/prod-admin.png > /dev/null 2>&1
echo "done"
