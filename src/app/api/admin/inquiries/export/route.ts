import { NextResponse } from "next/server";
import { db } from "@/lib/db";

function csvCell(value: string | null) {
  const v = value ?? "";
  return /[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v;
}

/** GET /api/admin/inquiries/export — contact inquiries as CSV. */
export async function GET() {
  const rows = await db.contactMessage.findMany({ orderBy: { createdAt: "desc" } });
  const header = "Received,Name,Email,Company,Interest,Status,Message";
  const body = rows
    .map((r) =>
      [
        r.createdAt.toISOString(),
        csvCell(r.name),
        csvCell(r.email),
        csvCell(r.company),
        csvCell(r.service),
        csvCell(r.status),
        csvCell(r.message.replace(/\s+/g, " ")),
      ].join(","),
    )
    .join("\n");

  return new NextResponse(`${header}\n${body}`, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="agma-inquiries.csv"',
    },
  });
}
