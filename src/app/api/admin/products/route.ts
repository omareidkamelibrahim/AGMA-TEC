import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { ICON_MAP } from "@/lib/icon-map";

const ACCENTS = ["from-brand-600", "from-brand-400", "from-brand-300"] as const;

const capabilitySchema = z.object({
  icon: z.string().refine((n) => n in ICON_MAP, "Unknown icon"),
  label: z.string().min(1).max(80),
  text: z.string().min(1).max(300),
});

const productSchema = z.object({
  slug: z
    .string()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be kebab-case, e.g. agma-erp")
    .max(60),
  name: z.string().min(2).max(60),
  fullName: z.string().min(2).max(120),
  scope: z.string().min(2).max(160),
  description: z.string().min(10).max(1200),
  icon: z.string().refine((n) => n in ICON_MAP, "Unknown icon"),
  accent: z.enum(ACCENTS),
  image: z.string().max(200),
  sortOrder: z.number().int().min(0).max(999),
  published: z.boolean(),
  capabilities: z.array(capabilitySchema).max(12),
  outcomes: z.array(z.string().min(1).max(160)).max(10),
});

/** GET /api/admin/products — all products incl. unpublished, sorted. */
export async function GET() {
  const rows = await db.product.findMany({ orderBy: { sortOrder: "asc" } });
  return NextResponse.json({ rows });
}

/** POST /api/admin/products — create a product. */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = productSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }

  const exists = await db.product.findUnique({ where: { slug: parsed.data.slug } });
  if (exists) {
    return NextResponse.json(
      { error: `A product with slug "${parsed.data.slug}" already exists` },
      { status: 409 },
    );
  }

  const { capabilities, outcomes, ...fields } = parsed.data;
  const product = await db.product.create({
    data: {
      ...fields,
      capabilitiesJson: JSON.stringify(capabilities),
      outcomesJson: JSON.stringify(outcomes),
    },
  });
  return NextResponse.json({ product }, { status: 201 });
}
