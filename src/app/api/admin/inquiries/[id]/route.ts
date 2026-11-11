import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

type Params = { params: Promise<{ id: string }> };

/** PATCH /api/admin/inquiries/[id] — mark an inquiry Handled or New. */
export async function PATCH(
  req: NextRequest,
  { params }: Params,
) {
  const { id } = await params;
  const body = await req.json().catch(() => null);
  const status = body?.status;
  if (!["New", "Handled"].includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const existing = await db.contactMessage.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Inquiry not found" }, { status: 404 });
  }

  const updated = await db.contactMessage.update({
    where: { id },
    data: { status },
  });
  return NextResponse.json({ inquiry: updated });
}

/** DELETE /api/admin/inquiries/[id] — delete an inquiry. */
export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const existing = await db.contactMessage.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Inquiry not found" }, { status: 404 });
  }
  await db.contactMessage.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
