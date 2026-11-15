import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

/** GET /api/admin/newsletter — subscribers (?format=csv for export). */
export async function GET(req: NextRequest) {
  const rows = await db.newsletterSubscriber.findMany({
    orderBy: { createdAt: "desc" },
  });

  if (req.nextUrl.searchParams.get("format") === "csv") {
    const esc = (v: string) => `"${v.replace(/"/g, '""')}"`;
    const csv = [
      ["Email", "Subscribed"].join(","),
      ...rows.map((r) => [esc(r.email), esc(r.createdAt.toISOString())].join(",")),
    ].join("\n");
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="agma-newsletter-subscribers.csv"',
      },
    });
  }

  const now = Date.now();
  const dayMs = 86_400_000;
  const stats = {
    total: rows.length,
    last30: rows.filter((r) => now - r.createdAt.getTime() <= 30 * dayMs).length,
  };
  return NextResponse.json({ rows, stats });
}


/** DELETE /api/admin/newsletter?ids=a,b,c — bulk-delete selected rows. */
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
      await db.newsletterSubscriber.delete({ where: { id } });
      deleted += 1;
    } catch {
      failed.push(id);
    }
  }
  return NextResponse.json({ ok: true, deleted, failed });
}
