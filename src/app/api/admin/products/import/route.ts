/**
 * POST /api/admin/products/import — bulk-create products from CSV.
 * Headers: Name, Full Name, Slug, Scope, Description, Icon, Image, Sort Order, Published.
 * Capabilities/outcomes are edited in the product dialog afterwards.
 * Rows whose slug already exists are skipped.
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
    const name = o["Name"];
    const fullName = o["Full Name"];
    const slug = (o["Slug"] || name || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
    if (!name || !fullName) {
      errors.push(`${label}: Name and Full Name are required.`);
      continue;
    }
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
      errors.push(`${label}: slug "${slug}" is not kebab-case.`);
      continue;
    }
    if (await db.product.findUnique({ where: { slug } })) {
      skipped++;
      continue;
    }
    const icon = o["Icon"] && o["Icon"] in ICON_MAP ? o["Icon"] : "Boxes";
    const sortOrder = Number(o["Sort Order"]) || 10;
    const image = o["Image"] || `/products/${slug}.png`;
    await db.product.create({
      data: {
        name,
        fullName,
        slug,
        scope: o["Scope"] || "",
        description: o["Description"] || "",
        icon,
        accent: "from-brand-600",
        image,
        sortOrder,
        published: o["Published"] ? truthy(o["Published"]) : true,
        capabilitiesJson: "[]",
        outcomesJson: "[]",
      },
    });
    created++;
  }

  return NextResponse.json({ created, skipped, errors });
}
