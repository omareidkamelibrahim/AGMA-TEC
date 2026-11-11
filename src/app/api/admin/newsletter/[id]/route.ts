import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

type Params = { params: Promise<{ id: string }> };

/** DELETE /api/admin/newsletter/[id] — remove a subscriber. */
export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const existing = await db.newsletterSubscriber.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Subscriber not found" }, { status: 404 });
  }
  await db.newsletterSubscriber.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
