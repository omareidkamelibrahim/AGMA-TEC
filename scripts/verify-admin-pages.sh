#!/usr/bin/env bash
# Browser verification of the 5 new admin pages + golden-path interaction.
set -u
cd /home/z/my-project

for PAGE in /admin/products /admin/services /admin/clients /admin/inquiries /admin/newsletter; do
  agent-browser open "http://localhost:3000$PAGE" > /dev/null 2>&1
  sleep 4
  agent-browser console > /tmp/console-check.txt 2>/dev/null
  HITS=$(grep -ciE 'error|hydrat|mismatch' /tmp/console-check.txt)
  NAME=$(echo "$PAGE" | tr '/' '-')
  agent-browser screenshot "/tmp/render/admin${NAME}.png" > /dev/null 2>&1
  echo "$PAGE -> console hits: $HITS"
done

echo "-- golden path: products page New Product dialog --"
agent-browser open "http://localhost:3000/admin/products" > /dev/null 2>&1
sleep 4
agent-browser click "New Product" > /dev/null 2>&1
sleep 1.5
agent-browser snapshot 2>/dev/null | grep -q "New product" && echo "dialog opened: YES" || echo "dialog opened: NO"
agent-browser screenshot /tmp/render/admin-products-dialog.png > /dev/null 2>&1
agent-browser press Escape > /dev/null 2>&1
echo "done"
