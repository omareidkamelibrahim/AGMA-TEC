#!/usr/bin/env bash
# Professional dashboard verification: API fields, console cleanliness,
# approve/reject interaction, dark+light+mobile screenshots.
set -u
cd /home/z/my-project

PASS=""; FAIL=""

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
if [ "$code" != "200" ]; then echo "SERVER FAILED ($code)"; tail -25 /tmp/dev.log; kill -9 $DEV_PID 2>/dev/null; exit 1; fi
echo "== server up =="
sleep 2

# 1. API contract ------------------------------------------------------------
API=$(curl -s http://localhost:3000/api/admin/stats)
echo "$API" | bun -e "
const d = await new Response(Bun.stdin.stream()).text();
const s = JSON.parse(d);
const checks = {
  headcountTrend12: Array.isArray(s.headcountTrend) && s.headcountTrend.length === 12,
  statusMix: Array.isArray(s.statusMix) && s.statusMix.length > 0,
  payrollTrend: Array.isArray(s.payrollTrend) && s.payrollTrend.length > 0,
  pendingLeaveItems: Array.isArray(s.pendingLeaveItems),
  hires30: typeof s.hires30 === 'number' && typeof s.hiresPrev30 === 'number',
  total: s.total > 0,
};
const ok = Object.values(checks).every(Boolean);
console.log(JSON.stringify({ ok, checks, sampleTrend: s.headcountTrend?.slice(-2), payroll: s.payrollTrend?.slice(-1) }));
" > /tmp/api-check.json 2>/dev/null
cat /tmp/api-check.json
grep -q '"ok":true' /tmp/api-check.json && PASS="$PASS | stats API has all new fields" || FAIL="$FAIL | stats API missing fields"

# 2. reset theme to dark, load /admin, console scan ---------------------------
agent-browser set viewport 1440 900 > /dev/null 2>&1
agent-browser open http://localhost:3000/admin > /dev/null 2>&1
agent-browser eval "localStorage.setItem('theme','dark')" > /dev/null 2>&1
agent-browser reload > /dev/null 2>&1
sleep 6
CONSOLE=$(agent-browser console 2>/dev/null)
if echo "$CONSOLE" | grep -qiE "hydrat|mismatch|Uncaught"; then
  FAIL="$FAIL | console errors on /admin"
  echo "$CONSOLE" | grep -iE "hydrat|mismatch|Uncaught" | head -5
else
  PASS="$PASS | /admin loads clean (no hydration/uncaught errors)"
fi

# 3. structure assertions ------------------------------------------------------
STRUCT=$(agent-browser eval "JSON.stringify({kpi: document.querySelectorAll('.card-lift').length, svgCharts: document.querySelectorAll('.recharts-surface').length, approveBtns: document.querySelectorAll('button[aria-label^=\"Approve\"]').length, donutCenter: document.querySelector('.pointer-events-none .font-display')?.textContent, exportLink: !!document.querySelector('a[href=\"/api/admin/employees/export\"]'), heads: [...document.querySelectorAll('h2')].map(h=>h.textContent)})" 2>/dev/null | tr -d '\n')
echo "STRUCT: $STRUCT"
echo "$STRUCT" | grep -q '"approveBtns":[1-9]' && PASS="$PASS | inline approval buttons rendered" || FAIL="$FAIL | no approval buttons"
echo "$STRUCT" | grep -q '"svgCharts":[3-9]' && PASS="$PASS | 3+ recharts surfaces (area/donut/bars)" || FAIL="$FAIL | charts missing: $STRUCT"

# 4. approve flow ---------------------------------------------------------------
BEFORE=$(agent-browser eval "document.querySelectorAll('button[aria-label^=\"Approve\"]').length" 2>/dev/null)
agent-browser eval "document.querySelector('button[aria-label^=\"Approve\"]')?.click(); 'clicked'" > /dev/null 2>&1
sleep 3
TOAST=$(agent-browser eval "JSON.stringify({toast: !!document.querySelector('[data-sonner-toast]'), toastText: document.querySelector('[data-sonner-toast]')?.textContent, after: document.querySelectorAll('button[aria-label^=\"Approve\"]').length})" 2>/dev/null | tr -d '\n')
echo "APPROVE: before=$BEFORE -> $TOAST"
echo "$TOAST" | grep -q '"toast":true' && PASS="$PASS | toast confirmation shown" || FAIL="$FAIL | no toast after approve"
AFTER=$(echo "$TOAST" | grep -o '"after":[0-9]*' | grep -o '[0-9]*')
[ "$AFTER" -lt "$BEFORE" ] 2>/dev/null && PASS="$PASS | queue shrinks after approval ($BEFORE→$AFTER)" || FAIL="$FAIL | queue did not shrink ($BEFORE→$AFTER)"

# 5. reject flow ------------------------------------------------------------------
agent-browser eval "document.querySelector('button[aria-label^=\"Reject\"]')?.click(); 'clicked'" > /dev/null 2>&1
sleep 3
REJ=$(agent-browser eval "document.querySelectorAll('button[aria-label^=\"Approve\"]').length" 2>/dev/null)
[ "$REJ" -lt "$AFTER" ] 2>/dev/null && PASS="$PASS | reject also removes row ($AFTER→$REJ)" || FAIL="$FAIL | reject did not remove row ($AFTER→$REJ)"

# 6. screenshots: dark desktop, light desktop, mobile dark -------------------------
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
