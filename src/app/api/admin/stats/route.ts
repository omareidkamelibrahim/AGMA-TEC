import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

const DAY = 86400000;
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function dayKey(d: Date) {
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

/** GET /api/admin/stats — overview aggregates.
 *  scope=website → funnel/content dashboard (range: 7|30|90 days)
 *  default       → workforce snapshot (HR suite)
 */
export async function GET(req: NextRequest) {
  const scope = req.nextUrl.searchParams.get("scope") ?? "workforce";

  if (scope === "website") {
    return NextResponse.json(await websiteStats(req));
  }
  return NextResponse.json(await workforceStats());
}

/* ------------------------------------------------------------------ */
/* Website funnel + content dashboard                                  */
/* ------------------------------------------------------------------ */

async function websiteStats(req: NextRequest) {
  const rangeParam = Number(req.nextUrl.searchParams.get("range") ?? 30);
  const rangeDays = [7, 30, 90].includes(rangeParam) ? rangeParam : 30;

  const now = new Date();
  const since = new Date(now.getTime() - rangeDays * DAY);
  const prevSince = new Date(now.getTime() - 2 * rangeDays * DAY);

  const [
    products,
    services,
    testimonials,
    clients,
    messages,
    subscribers,
    latestInquiries,
    headcount,
    activeEmployees,
    pendingLeaves,
    expiringDocs,
    latestPayroll,
  ] = await Promise.all([
    db.product.findMany({
      select: { name: true, published: true, createdAt: true, updatedAt: true },
    }),
    db.service.findMany({
      select: { title: true, published: true, createdAt: true, updatedAt: true },
    }),
    db.testimonial.findMany({
      select: { name: true, published: true, createdAt: true, updatedAt: true },
    }),
    db.clientLogo.findMany({
      select: { name: true, kind: true, published: true, createdAt: true, updatedAt: true },
    }),
    db.contactMessage.findMany({
      select: {
        name: true, email: true, company: true, service: true,
        status: true, createdAt: true,
      },
    }),
    db.newsletterSubscriber.findMany({
      select: { email: true, createdAt: true },
    }),
    db.contactMessage.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true, name: true, email: true, company: true,
        service: true, status: true, createdAt: true,
      },
    }),
    db.employee.count(),
    db.employee.count({ where: { status: "Active" } }),
    db.leaveRequest.count({ where: { status: "Pending" } }),
    db.employee.count({
      where: { idExpiry: { not: null, lte: new Date(now.getTime() + 60 * DAY), gte: now } },
    }),
    db.payrollRun.findFirst({
      orderBy: { period: "desc" },
      select: { reference: true, period: true, net: true, status: true },
    }),
  ]);

  /* ---- daily series over the selected range ---- */
  const buckets = new Map<string, { inquiries: number; handled: number; subscribers: number }>();
  for (let i = rangeDays - 1; i >= 0; i--) {
    const d = new Date(now.getTime() - i * DAY);
    buckets.set(dayKey(d), { inquiries: 0, handled: 0, subscribers: 0 });
  }
  for (const m of messages) {
    if (m.createdAt < since) continue;
    const b = buckets.get(dayKey(m.createdAt));
    if (!b) continue;
    b.inquiries += 1;
    if (m.status === "Handled") b.handled += 1;
  }
  for (const s of subscribers) {
    if (s.createdAt < since) continue;
    const b = buckets.get(dayKey(s.createdAt));
    if (b) b.subscribers += 1;
  }
  const series = [...buckets.entries()].map(([key, v]) => {
    const [, m, d] = key.split("-").map(Number);
    return { key, label: `${d} ${MONTHS[m - 1]}`, ...v };
  });

  /* ---- cumulative content series over the same range (sparklines) ---- */
  const cumulate = (rows: { createdAt: Date }[]) =>
    series.map(({ key }) => {
      const [y, m, d] = key.split("-").map(Number);
      const end = new Date(y, m - 1, d, 23, 59, 59, 999);
      return rows.filter((r) => r.createdAt <= end).length;
    });

  const contentSpark = {
    products: cumulate(products),
    services: cumulate(services),
    testimonials: cumulate(testimonials),
    clients: cumulate(clients),
  };

  /* ---- KPI deltas (current period vs previous period) ---- */
  const inRange = (d: Date) => d >= since;
  const inPrev = (d: Date) => d >= prevSince && d < since;
  const inquiriesNow = messages.filter((m) => inRange(m.createdAt)).length;
  const inquiriesPrev = messages.filter((m) => inPrev(m.createdAt)).length;
  const subsNow = subscribers.filter((s) => inRange(s.createdAt)).length;
  const subsPrev = subscribers.filter((s) => inPrev(s.createdAt)).length;

  /* ---- breakdowns ---- */
  const interestCount = new Map<string, number>();
  for (const m of messages) {
    const key = m.service ?? "Product interest";
    interestCount.set(key, (interestCount.get(key) ?? 0) + 1);
  }
  const ranked = [...interestCount.entries()]
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count);

  const statusMix = ["New", "Handled"].map((status) => ({
    status,
    count: messages.filter((m) => m.status === status).length,
  }));

  const contentMix = [
    { type: "Products", count: products.length },
    { type: "Services", count: services.length },
    { type: "Testimonials", count: testimonials.length },
    { type: "Clients & partners", count: clients.length },
  ];

  /* ---- recent activity feed (union across content + funnel) ---- */
  const activity: { kind: string; title: string; sub: string; at: Date }[] = [
    ...messages
      .slice()
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, 4)
      .map((m) => ({
        kind: "inquiry",
        title: `New inquiry from ${m.name}${m.company ? ` · ${m.company}` : ""}`,
        sub: m.service ?? "Product interest",
        at: m.createdAt,
      })),
    ...subscribers
      .slice()
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, 3)
      .map((s) => ({ kind: "subscriber", title: `${s.email} subscribed`, sub: "Newsletter", at: s.createdAt })),
    ...products
      .slice()
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
      .slice(0, 2)
      .map((p) => ({ kind: "product", title: `${p.name} updated`, sub: `Product · ${p.published ? "live" : "hidden"}`, at: p.updatedAt })),
    ...services
      .slice()
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
      .slice(0, 2)
      .map((s) => ({ kind: "service", title: `${s.title} updated`, sub: `Service · ${s.published ? "live" : "hidden"}`, at: s.updatedAt })),
    ...testimonials
      .slice()
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
      .slice(0, 1)
      .map((t) => ({ kind: "testimonial", title: `Quote from ${t.name}`, sub: `Testimonial · ${t.published ? "live" : "hidden"}`, at: t.updatedAt })),
  ]
    .sort((a, b) => b.at.getTime() - a.at.getTime())
    .slice(0, 7);

  return {
    scope: "website" as const,
    rangeDays,
    kpis: {
      products: { count: products.length, published: products.filter((p) => p.published).length },
      services: { count: services.length, published: services.filter((s) => s.published).length },
      testimonials: { count: testimonials.length, published: testimonials.filter((t) => t.published).length },
      clients: { count: clients.length, published: clients.filter((c) => c.published).length },
      inquiries: {
        total: messages.length,
        unread: messages.filter((m) => m.status === "New").length,
        now: inquiriesNow,
        prev: inquiriesPrev,
      },
      subscribers: { total: subscribers.length, now: subsNow, prev: subsPrev },
    },
    series,
    contentSpark,
    byInterest: ranked.slice(0, 6),
    topInterest: ranked.slice(0, 5),
    statusMix,
    contentMix,
    latestInquiries,
    activity,
    workforce: {
      headcount,
      active: activeEmployees,
      pendingLeaves,
      expiringDocs,
      payroll: latestPayroll,
    },
  };
}

/* ------------------------------------------------------------------ */
/* Workforce snapshot (HR suite)                                       */
/* ------------------------------------------------------------------ */

async function workforceStats() {
  const now = new Date();
  const soon = new Date(now.getTime() + 60 * DAY);
  const since30 = new Date(now.getTime() - 30 * DAY);
  const since60 = new Date(now.getTime() - 60 * DAY);

  const [
    total, active, probation, suspended, expiringDocs, recentHires, expiring,
    deptGroups, pendingLeaves, hires30, hiresPrev30, hireDates, statusGroups,
    payrollRuns, pendingLeaveItems, inquiriesNew, inquiries30, subscribers,
  ] = await Promise.all([
    db.employee.count(),
    db.employee.count({ where: { status: "Active" } }),
    db.employee.count({ where: { status: "Probation" } }),
    db.employee.count({ where: { status: "Suspended" } }),
    db.employee.count({
      where: { idExpiry: { not: null, lte: soon, gte: now } },
    }),
    db.employee.findMany({
      orderBy: { hireDate: "desc" },
      take: 6,
      select: {
        id: true, empCode: true, name: true, department: true,
        position: true, hireDate: true, status: true,
      },
    }),
    db.employee.findMany({
      where: { idExpiry: { not: null, lte: soon, gte: now } },
      orderBy: { idExpiry: "asc" },
      take: 8,
      select: {
        id: true, empCode: true, name: true, department: true,
        idExpiry: true, idNumber: true,
      },
    }),
    db.employee.groupBy({ by: ["department"], _count: true }),
    db.leaveRequest.count({ where: { status: "Pending" } }),
    db.employee.count({ where: { hireDate: { gte: since30, lte: now } } }),
    db.employee.count({ where: { hireDate: { gte: since60, lt: since30 } } }),
    db.employee.findMany({
      where: { hireDate: { lte: now } },
      select: { hireDate: true },
    }),
    db.employee.groupBy({ by: ["status"], _count: true }),
    db.payrollRun.findMany({
      orderBy: { period: "desc" },
      take: 6,
      select: { reference: true, period: true, net: true, employees: true, status: true },
    }),
    db.leaveRequest.findMany({
      where: { status: "Pending" },
      orderBy: { createdAt: "asc" },
      take: 5,
      select: {
        id: true, employeeName: true, empCode: true, department: true,
        type: true, fromDate: true, toDate: true, days: true, createdAt: true,
      },
    }),
    db.contactMessage.count({ where: { status: "New" } }),
    db.contactMessage.count({ where: { createdAt: { gte: since30 } } }),
    db.newsletterSubscriber.count(),
  ]);

  // Cumulative headcount at the end of each of the last 12 months.
  const headcountTrend = Array.from({ length: 12 }, (_, i) => {
    const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59, 999);
    const count = hireDates.filter((h) => h.hireDate <= end).length;
    return {
      key: `${end.getFullYear()}-${end.getMonth() + 1}`,
      label: MONTHS[end.getMonth()],
      count,
    };
  });

  const departments = deptGroups
    .map((g) => ({ department: g.department, count: g._count }))
    .sort((a, b) => b.count - a.count);

  const statusMix = ["Active", "Probation", "Suspended", "Terminated"]
    .map((status) => ({
      status,
      count: statusGroups.find((g) => g.status === status)?._count ?? 0,
    }))
    .filter((s) => s.count > 0);

  const payrollTrend = payrollRuns
    .slice()
    .reverse()
    .map((r) => ({
      reference: r.reference,
      label: MONTHS[Number(r.period.slice(5, 7)) - 1] ?? r.period,
      net: r.net,
      employees: r.employees,
      status: r.status,
    }));

  return {
    total,
    active,
    probation,
    suspended,
    expiringDocs,
    pendingLeaves,
    hires30,
    hiresPrev30,
    departments,
    statusMix,
    headcountTrend,
    payrollTrend,
    recentHires,
    expiring,
    pendingLeaveItems,
    inquiriesNew,
    inquiries30,
    subscribers,
  };
}
