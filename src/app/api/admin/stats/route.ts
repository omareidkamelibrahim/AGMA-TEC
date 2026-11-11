import { NextResponse } from "next/server";
import { db } from "@/lib/db";

const DAY = 86400000;

/** GET /api/admin/stats — overview dashboard aggregates. */
export async function GET() {
  const soon = new Date(Date.now() + 60 * DAY);

  const [total, active, probation, suspended, expiringDocs, recentHires, expiring, deptGroups, pendingLeaves] =
    await Promise.all([
      db.employee.count(),
      db.employee.count({ where: { status: "Active" } }),
      db.employee.count({ where: { status: "Probation" } }),
      db.employee.count({ where: { status: "Suspended" } }),
      db.employee.count({
        where: { idExpiry: { not: null, lte: soon, gte: new Date() } },
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
        where: { idExpiry: { not: null, lte: soon, gte: new Date() } },
        orderBy: { idExpiry: "asc" },
        take: 8,
        select: {
          id: true, empCode: true, name: true, department: true,
          idExpiry: true, idNumber: true,
        },
      }),
      db.employee.groupBy({ by: ["department"], _count: true }),
      db.leaveRequest.count({ where: { status: "Pending" } }),
    ]);

  const departments = deptGroups
    .map((g) => ({ department: g.department, count: g._count }))
    .sort((a, b) => b.count - a.count);

  return NextResponse.json({
    total,
    active,
    probation,
    suspended,
    expiringDocs,
    pendingLeaves,
    departments,
    recentHires,
    expiring,
  });
}
