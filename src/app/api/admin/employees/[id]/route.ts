import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

const STATUSES = ["Active", "Probation", "Suspended", "Terminated"];

/** PATCH /api/admin/employees/[id] — update an employee. */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = await req.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const existing = await db.employee.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Employee not found" }, { status: 404 });
  }

  const data: Record<string, unknown> = {};
  if (body.name !== undefined) data.name = String(body.name).trim();
  if (body.department !== undefined) data.department = body.department;
  if (body.position !== undefined) data.position = body.position;
  if (body.status !== undefined) {
    if (!STATUSES.includes(body.status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }
    data.status = body.status;
  }
  if (body.hireDate !== undefined) {
    const d = new Date(body.hireDate);
    if (Number.isNaN(d.getTime())) {
      return NextResponse.json({ error: "Invalid hire date" }, { status: 400 });
    }
    data.hireDate = d;
  }
  if (body.idExpiry !== undefined) {
    if (!body.idExpiry) {
      data.idExpiry = null;
    } else {
      const d = new Date(body.idExpiry);
      if (Number.isNaN(d.getTime())) {
        return NextResponse.json({ error: "Invalid ID expiry" }, { status: 400 });
      }
      data.idExpiry = d;
    }
  }
  for (const field of ["manager", "idNumber", "email", "phone"] as const) {
    if (body[field] !== undefined) {
      data[field] = body[field] ? String(body[field]).trim() : null;
    }
  }

  const employee = await db.employee.update({ where: { id }, data });
  return NextResponse.json({ employee });
}

/** DELETE /api/admin/employees/[id] — remove an employee. */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const existing = await db.employee.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Employee not found" }, { status: 404 });
  }
  await db.employee.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
