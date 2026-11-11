#!/usr/bin/env bash
# End-to-end verification of the website-management dashboard.
set -u
cd /home/z/my-project

lsof -ti:3000 2>/dev/null | xargs -r kill -9 2>/dev/null
pkill -9 -f "standalone/server.js" 2>/dev/null
sleep 1

(setsid nohup bun run start > /tmp/prod-server.log 2>&1 &)
for i in $(seq 1 60); do
  code=$(curl -s -o /dev/null -w "%{http_code}" -m 5 http://localhost:3000/ 2>/dev/null)
  [ "$code" = "200" ] && break
  sleep 1
done
echo "== server up =="

echo "-- [1] HTTP status of all pages --"
for p in / /about /products /products/agma-erp /products/agma-cafm /products/agma-catering /services /clients /contact /admin /admin/products /admin/services /admin/clients /admin/inquiries /admin/newsletter; do
  echo "$p -> $(curl -s -o /dev/null -w '%{http_code}' -m 15 http://localhost:3000$p)"
done

echo "-- [2] public pages show DB content --"
echo "home AGMA ERP:        $(curl -s -m 15 http://localhost:3000/ | grep -c 'AGMA ERP')"
echo "products ERP:         $(curl -s -m 15 http://localhost:3000/products | grep -c 'AGMA ERP')"
echo "services disciplines: $(curl -s -m 15 http://localhost:3000/services | grep -c 'Custom Software Development')"
echo "clients testimonial:  $(curl -s -m 15 http://localhost:3000/clients | grep -c 'Managing Director')"
echo "erp page caps:        $(curl -s -m 15 http://localhost:3000/products/agma-erp | grep -c 'Finance & Accounting')"

echo "-- [3] CMS round-trip: create service -> appears on /services -> delete --"
CREATE=$(curl -s -m 15 -X POST http://localhost:3000/api/admin/services -H 'Content-Type: application/json' \
  -d '{"title":"ZZVERIFY TEMP","text":"Temporary verification service created by the e2e check.","icon":"Globe","tags":["verify"],"sortOrder":99,"published":true}')
ID=$(echo "$CREATE" | python3 -c "import sys,json; print(json.load(sys.stdin)['service']['id'])" 2>/dev/null)
echo "created id: $ID"
sleep 1
HIT=$(curl -s -m 15 http://localhost:3000/services | grep -c 'ZZVERIFY TEMP')
echo "visible on /services after create: $HIT (expect 1)"
UNPUB=$(curl -s -m 15 -X PATCH "http://localhost:3000/api/admin/services/$ID" -H 'Content-Type: application/json' -d '{"published":false}' > /dev/null; curl -s -m 15 http://localhost:3000/services | grep -c 'ZZVERIFY TEMP')
echo "visible after unpublish: $UNPUB (expect 0)"
curl -s -m 15 -X DELETE "http://localhost:3000/api/admin/services/$ID" > /dev/null
GONE=$(curl -s -m 15 http://localhost:3000/services | grep -c 'ZZVERIFY TEMP')
echo "visible after delete: $GONE (expect 0)"

echo "-- [4] contact form -> admin inbox round-trip --"
curl -s -m 15 -X POST http://localhost:3000/api/contact -H 'Content-Type: application/json' \
  -d '{"name":"ZZ Verify","email":"verify@example.com","company":"E2E","service":"Verification","message":"This is an automated end-to-end verification message."}' > /dev/null
sleep 1
MSGID=$(curl -s -m 15 http://localhost:3000/api/admin/inquiries | python3 -c "
import sys, json
d = json.load(sys.stdin)
row = next((r for r in d['rows'] if r['email'] == 'verify@example.com'), None)
print(row['id'] if row else 'NOT-FOUND')")
echo "inquiry in inbox: $MSGID"
curl -s -m 15 -X PATCH "http://localhost:3000/api/admin/inquiries/$MSGID" -H 'Content-Type: application/json' -d '{"status":"Handled"}' > /dev/null && echo "marked handled: OK"
curl -s -m 15 -X DELETE "http://localhost:3000/api/admin/inquiries/$MSGID" > /dev/null && echo "cleaned up: OK"

echo "-- [5] stats API has website fields --"
curl -s -m 15 http://localhost:3000/api/admin/stats | python3 -c "import sys,json; d=json.load(sys.stdin); print('inquiriesNew:', d.get('inquiriesNew'), '| inquiries30:', d.get('inquiries30'), '| subscribers:', d.get('subscribers'))"
echo "done"
