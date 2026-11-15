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


/** PATCH /api/admin/inquiries — bulk-update the status of selected rows. */
export async function PATCH(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const ids: unknown = body?.ids;
  if (!Array.isArray(ids) || ids.length === 0 || !ids.every((i) => typeof i === "string")) {
    return NextResponse.json({ error: "ids must be a non-empty array of strings" }, { status: 400 });
  }
  const status = body?.status;
  if (!['New', 'Handled'].includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }
  let updated = 0;
  const failed: string[] = [];
  for (const id of ids) {
    try {
      await db.contactMessage.update({ where: { id }, data: { status } });
      updated += 1;
    } catch {
      failed.push(id);
    }
  }
  return NextResponse.json({ ok: true, updated, failed });
}

/** DELETE /api/admin/inquiries?ids=a,b,c — bulk-delete selected rows. */
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
      await db.contactMessage.delete({ where: { id } });
      deleted += 1;
    } catch {
      failed.push(id);
    }
  }
  return NextResponse.json({ ok: true, deleted, failed });
}
