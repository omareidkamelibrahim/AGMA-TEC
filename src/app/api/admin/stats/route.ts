import { NextResponse } from "next/server";
import { db } from "@/lib/db";

const DAY = 86400000;
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** GET /api/admin/stats — overview dashboard aggregates. */
export async function GET() {
  const now = new Date();
  const soon = new Date(now.getTime() + 60 * DAY);
  const since30 = new Date(now.getTime() - 30 * DAY);
  const since60 = new Date(now.getTime() - 60 * DAY);

  const [
    total, active, probation, suspended, expiringDocs, recentHires, expiring,
    deptGroups, pendingLeaves, hires30, hiresPrev30, hireDates, statusGroups,
    payrollRuns, pendingLeaveItems,
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

  return NextResponse.json({
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
  });
}
