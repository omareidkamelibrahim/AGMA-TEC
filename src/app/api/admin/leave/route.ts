import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

/** GET /api/admin/leave — leave requests with search/status filter + pagination. */
export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const q = (sp.get("q") ?? "").trim();
  const status = sp.get("status") ?? "all";
  const page = Math.max(1, parseInt(sp.get("page") ?? "1", 10) || 1);
  const pageSize = Math.min(50, Math.max(5, parseInt(sp.get("pageSize") ?? "10", 10) || 10));

  const where: Record<string, unknown> = {};
  if (q) {
    where.OR = [
      { employeeName: { contains: q } },
      { empCode: { contains: q } },
      { department: { contains: q } },
    ];
  }
  if (status !== "all") where.status = status;

  const [rows, total] = await Promise.all([
    db.leaveRequest.findMany({
      where,
      orderBy: [{ status: "asc" }, { fromDate: "asc" }],
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    db.leaveRequest.count({ where }),
  ]);

  const counts = await db.leaveRequest.groupBy({ by: ["status"], _count: true });
  const byStatus = Object.fromEntries(
    counts.map((c) => [c.status, c._count]),
  );

  return NextResponse.json({
    rows,
    total,
    page,
    pageSize,
    pageCount: Math.max(1, Math.ceil(total / pageSize)),
    pending: byStatus.Pending ?? 0,
    approved: byStatus.Approved ?? 0,
    rejected: byStatus.Rejected ?? 0,
  });
}


/** PATCH /api/admin/leave — bulk-update the status of selected rows. */
export async function PATCH(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const ids: unknown = body?.ids;
  if (!Array.isArray(ids) || ids.length === 0 || !ids.every((i) => typeof i === "string")) {
    return NextResponse.json({ error: "ids must be a non-empty array of strings" }, { status: 400 });
  }
  const status = body?.status;
  if (!['Approved', 'Rejected', 'Pending'].includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }
  let updated = 0;
  const failed: string[] = [];
  for (const id of ids) {
    try {
      await db.leaveRequest.update({ where: { id }, data: { status } });
      updated += 1;
    } catch {
      failed.push(id);
    }
  }
  return NextResponse.json({ ok: true, updated, failed });
}

/** DELETE /api/admin/leave?ids=a,b,c — bulk-delete selected rows. */
export async function DELETE(req: NextRequest) {
  const ids = (req.nextUrl.searchParams.get("ids") ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  if (ids.length === 0) {
    return NextResponse.json({ error: "Provide ?ids=a,b,c" }, { status: 400 });
  }
  let deleted = 0;
  const failed: string[] = [];
  for (const id of ids) {
    try {
      await db.leaveRequest.delete({ where: { id } });
      deleted += 1;
    } catch {
      failed.push(id);
    }
  }
  return NextResponse.json({ ok: true, deleted, failed });
}
