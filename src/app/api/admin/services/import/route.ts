/**
 * POST /api/admin/services/import — bulk-create services from CSV.
 * Headers: Title, Description, Icon, Tags (comma-separated), Sort Order, Published.
 * Rows whose title already exists are skipped.
 */
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { csvToObjects } from "@/lib/csv";
import { ICON_MAP } from "@/lib/icon-map";

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
    const title = o["Title"];
    const text = o["Description"];
    if (!title || !text) {
      errors.push(`${label}: Title and Description are required.`);
      continue;
    }
    if (text.length < 10) {
      errors.push(`${label}: Description needs at least 10 characters.`);
      continue;
    }
    if (await db.service.findFirst({ where: { title } })) {
      skipped++;
      continue;
    }
    const icon = o["Icon"] && o["Icon"] in ICON_MAP ? o["Icon"] : "Code2";
    const tags = (o["Tags"] || "")
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean)
      .slice(0, 8);
    await db.service.create({
      data: {
        title,
        text,
        icon,
        tagsJson: JSON.stringify(tags),
        sortOrder: Number(o["Sort Order"]) || 10,
        published: o["Published"] ? truthy(o["Published"]) : true,
      },
    });
    created++;
  }

  return NextResponse.json({ created, skipped, errors });
}
