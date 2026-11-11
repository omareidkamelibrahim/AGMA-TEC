import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

/** DELETE /api/admin/numbering/[id] — remove a numbering series. */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const existing = await db.numberingSeries.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Series not found" }, { status: 404 });
  }
  await db.numberingSeries.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
