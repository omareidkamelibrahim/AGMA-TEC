import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  employeeWhere,
  parseEmployeeQuery,
} from "@/lib/admin/query";

const EXPIRING_WINDOW_DAYS = 60;

/** GET /api/admin/employees — filtered, sorted, paginated employee list. */
export async function GET(req: NextRequest) {
  const query = parseEmployeeQuery(req.nextUrl.searchParams);
  const where = employeeWhere(query);

  const [rows, total] = await Promise.all([
    db.employee.findMany({
      where,
      orderBy: { [query.sort]: query.dir },
      skip: (query.page - 1) * query.pageSize,
      take: query.pageSize,
    }),
    db.employee.count({ where }),
  ]);

  return NextResponse.json({
    rows,
    total,
    page: query.page,
    pageSize: query.pageSize,
    pageCount: Math.max(1, Math.ceil(total / query.pageSize)),
  });
}

/** POST /api/admin/employees — create a new employee. */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const required = ["name", "department", "position", "status", "hireDate"] as const;
  for (const field of required) {
    if (!body[field] || typeof body[field] !== "string") {
      return NextResponse.json(
        { error: `Missing field: ${field}` },
        { status: 400 },
      );
    }
  }
  if (!["Active", "Probation", "Suspended", "Terminated"].includes(body.status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const hireDate = new Date(body.hireDate);
  if (Number.isNaN(hireDate.getTime())) {
    return NextResponse.json({ error: "Invalid hire date" }, { status: 400 });
  }
  const idExpiry = body.idExpiry ? new Date(body.idExpiry) : null;
  if (idExpiry && Number.isNaN(idExpiry.getTime())) {
    return NextResponse.json({ error: "Invalid ID expiry" }, { status: 400 });
  }

  // next sequential employee code (EMP-#####), ignoring gaps
  const last = await db.employee.findFirst({
    orderBy: { empCode: "desc" },
    select: { empCode: true },
  });
  const lastNum = last ? parseInt(last.empCode.replace(/\D/g, ""), 10) || 0 : 0;
  let empCode = `EMP-${String(lastNum + 1).padStart(5, "0")}`;
  // guarantee uniqueness even if the derived code collides
  for (let i = 2; (await db.employee.findUnique({ where: { empCode } })) !== null; i++) {
    empCode = `EMP-${String(lastNum + i).padStart(5, "0")}`;
  }

  const created = await db.employee.create({
    data: {
      empCode,
      name: String(body.name).trim(),
      department: body.department,
      position: body.position,
      status: body.status,
      hireDate,
      manager: body.manager ? String(body.manager).trim() : null,
      idNumber: body.idNumber ? String(body.idNumber).trim() : null,
      idExpiry,
      email: body.email ? String(body.email).trim() : null,
      phone: body.phone ? String(body.phone).trim() : null,
    },
  });

  return NextResponse.json({ employee: created }, { status: 201 });
}


/** PATCH /api/admin/employees — bulk-update the status of selected rows. */
export async function PATCH(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const ids: unknown = body?.ids;
  if (!Array.isArray(ids) || ids.length === 0 || !ids.every((i) => typeof i === "string")) {
    return NextResponse.json({ error: "ids must be a non-empty array of strings" }, { status: 400 });
  }
  const status = body?.status;
  if (!['Active', 'Probation', 'Suspended', 'Terminated'].includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }
  let updated = 0;
  const failed: string[] = [];
  for (const id of ids) {
    try {
      await db.employee.update({ where: { id }, data: { status } });
      updated += 1;
    } catch {
      failed.push(id);
    }
  }
  return NextResponse.json({ ok: true, updated, failed });
}

/** DELETE /api/admin/employees?ids=a,b,c — bulk-delete selected rows. */
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
      await db.employee.delete({ where: { id } });
      deleted += 1;
    } catch {
      failed.push(id);
    }
  }
  return NextResponse.json({ ok: true, deleted, failed });
}
