import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

/** GET /api/admin/payroll — payroll runs, newest first. */
export async function GET() {
  const [rows, activeEmployees] = await Promise.all([
    db.payrollRun.findMany({ orderBy: { period: "desc" } }),
    db.employee.count({ where: { status: { in: ["Active", "Probation"] } } }),
  ]);
  const totals = rows.reduce(
    (acc, r) => ({
      gross: acc.gross + r.gross,
      net: acc.net + r.net,
      paid: acc.paid + (r.status === "Paid" ? 1 : 0),
      draft: acc.draft + (r.status === "Draft" ? 1 : 0),
    }),
    { gross: 0, net: 0, paid: 0, draft: 0 },
  );
  return NextResponse.json({ rows, activeEmployees, totals });
}

/** POST /api/admin/payroll — create a new payroll run (Draft). */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const period = body?.period;
  if (!/^\d{4}-\d{2}$/.test(period ?? "")) {
    return NextResponse.json(
      { error: "Period must be in YYYY-MM format" },
      { status: 400 },
    );
  }

  const existing = await db.payrollRun.findUnique({
    where: { reference: `PR-${period}` },
  });
  if (existing) {
    return NextResponse.json(
      { error: `A run for period ${period} already exists` },
      { status: 409 },
    );
  }

  const employees = await db.employee.count({
    where: { status: { in: ["Active", "Probation"] } },
  });
  const gross = employees * 8200;
  const deductions = Math.round(gross * 0.11);

  const run = await db.payrollRun.create({
    data: {
      reference: `PR-${period}`,
      period,
      employees,
      gross,
      deductions,
      net: gross - deductions,
      status: "Draft",
    },
  });
  return NextResponse.json({ run }, { status: 201 });
}
