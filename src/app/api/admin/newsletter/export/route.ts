import { NextResponse } from "next/server";
import { db } from "@/lib/db";

/** GET /api/admin/newsletter/export — subscribers as CSV. */
export async function GET() {
  const rows = await db.newsletterSubscriber.findMany({ orderBy: { createdAt: "desc" } });
  const header = "Subscribed,Email";
  const body = rows
    .map((r) => `${r.createdAt.toISOString()},${r.email}`)
    .join("\n");

  return new NextResponse(`${header}\n${body}`, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="agma-newsletter.csv"',
    },
  });
}
