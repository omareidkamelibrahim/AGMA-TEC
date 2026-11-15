/**
 * POST /api/admin/testimonials/import — bulk-create quotes from CSV.
 * Headers: Quote, Attribution, Sector, Initials, Sort Order, Published.
 * Initials are derived from the attribution when left empty.
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
    const quote = o["Quote"];
    const name = o["Attribution"];
    const org = o["Sector"];
    if (!quote || !name || !org) {
      errors.push(`${label}: Quote, Attribution and Sector are required.`);
      continue;
    }
    if (quote.length < 20) {
      errors.push(`${label}: Quote needs at least 20 characters.`);
      continue;
    }
    const dupe = await db.testimonial.findFirst({ where: { quote, name } });
    if (dupe) {
      skipped++;
      continue;
    }
    const initials =
      (o["Initials"] || name.trim().split(/\s+/).map((w) => w[0]).slice(0, 2).join("")).toUpperCase();
    await db.testimonial.create({
      data: {
        quote,
        name,
        org,
        initials: initials.slice(0, 4),
        sortOrder: Number(o["Sort Order"]) || 10,
        published: o["Published"] ? truthy(o["Published"]) : true,
      },
    });
    created++;
  }

  return NextResponse.json({ created, skipped, errors });
}
