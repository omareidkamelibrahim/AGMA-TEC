import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

function toCsv(rows: {
  name: string;
  email: string;
  company: string | null;
  service: string | null;
  message: string;
  status: string;
  createdAt: Date;
}[]): string {
  const esc = (v: string) => `"${v.replace(/"/g, '""')}"`;
  const lines = [
    ["Name", "Email", "Company", "Service", "Status", "Received", "Message"].join(","),
    ...rows.map((r) =>
      [
        esc(r.name),
        esc(r.email),
        esc(r.company ?? ""),
        esc(r.service ?? ""),
        esc(r.status),
        esc(r.createdAt.toISOString()),
        esc(r.message.replace(/\r?\n/g, " ")),
      ].join(","),
    ),
  ];
  return lines.join("\n");
}

/** GET /api/admin/inquiries — contact-form inbox (?format=csv for export). */
export async function GET(req: NextRequest) {
  const rows = await db.contactMessage.findMany({ orderBy: { createdAt: "desc" } });

  if (req.nextUrl.searchParams.get("format") === "csv") {
    return new NextResponse(toCsv(rows), {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="agma-inquiries.csv"',
      },
    });
  }

  const now = Date.now();
  const dayMs = 86_400_000;
  const stats = {
    total: rows.length,
    newCount: rows.filter((r) => r.status === "New").length,
    last30: rows.filter((r) => now - r.createdAt.getTime() <= 30 * dayMs).length,
  };
  return NextResponse.json({ rows, stats });
}
