/**
 * POST /api/admin/clients/import — bulk-create client/partner logos from CSV.
 * Headers: Name, Group (client|partner), Image URL, Sort Order, Published.
 * Image URLs must point at /clients/ or /partners/ (files pre-uploaded to /public).
 * Rows whose name already exists are skipped.
 */
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { csvToObjects } from "@/lib/csv";

const MAX_ROWS = 200;
const truthy = (v: string) => ["yes", "true", "1", "y"].includes(v.toLowerCase());

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const csv = typeof body?.csv === "string" ? body.csv : null;
  if (!csv) {
    return NextResponse.json({ error: "Missing CSV payload." }, { status: 400 });
  }

  const objects = csvToObjects(csv);
  if (objects.length === 0) {
    return NextResponse.json({ error: "No data rows found under the header row." }, { status: 400 });
  }
  if (objects.length > MAX_ROWS) {
    return NextResponse.json({ error: `Too many rows — limit is ${MAX_ROWS} per import.` }, { status: 400 });
  }

  const errors: string[] = [];
  let created = 0;
  let skipped = 0;

  for (const [i, o] of objects.entries()) {
    const label = `Row ${i + 2}`;
    const name = o["Name"];
    const imageUrl = o["Image URL"];
    const kind = (o["Group"] || "client").toLowerCase();
    if (!name || !imageUrl) {
      errors.push(`${label}: Name and Image URL are required.`);
      continue;
    }
    if (kind !== "client" && kind !== "partner") {
      errors.push(`${label}: Group must be "client" or "partner".`);
      continue;
    }
    if (!/^\/(clients|partners)\/[A-Za-z0-9._-]+\.(png|jpg|jpeg|svg|webp)$/.test(imageUrl)) {
      errors.push(`${label}: "${imageUrl}" must be /clients/<file> or /partners/<file>.`);
      continue;
    }
    if (await db.clientLogo.findFirst({ where: { name } })) {
      skipped++;
      continue;
    }
    await db.clientLogo.create({
      data: {
        name,
        kind,
        imageUrl,
        sortOrder: Number(o["Sort Order"]) || 10,
        published: o["Published"] ? truthy(o["Published"]) : true,
      },
    });
    created++;
  }

  return NextResponse.json({ created, skipped, errors });
}
