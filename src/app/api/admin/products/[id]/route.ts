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

const updateSchema = z.object({
  name: z.string().min(2).max(60).optional(),
  fullName: z.string().min(2).max(120).optional(),
  scope: z.string().min(2).max(160).optional(),
  description: z.string().min(10).max(1200).optional(),
  icon: z.string().refine((n) => n in ICON_MAP, "Unknown icon").optional(),
  accent: z.enum(ACCENTS).optional(),
  image: z.string().max(200).optional(),
  sortOrder: z.number().int().min(0).max(999).optional(),
  published: z.boolean().optional(),
  capabilities: z.array(capabilitySchema).max(12).optional(),
  outcomes: z.array(z.string().min(1).max(160)).max(10).optional(),
});

type Params = { params: Promise<{ id: string }> };

/** PATCH /api/admin/products/[id] — update a product (slug is immutable). */
export async function PATCH(
  req: NextRequest,
  { params }: Params,
) {
  const { id } = await params;
  const body = await req.json().catch(() => null);
  if (body && typeof body === "object" && "slug" in body) {
    return NextResponse.json(
      { error: "The slug is the product's URL and cannot be changed" },
      { status: 400 },
    );
  }
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }

  const existing = await db.product.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  const { capabilities, outcomes, ...fields } = parsed.data;
  const product = await db.product.update({
    where: { id },
    data: {
      ...fields,
      ...(capabilities !== undefined && {
        capabilitiesJson: JSON.stringify(capabilities),
      }),
      ...(outcomes !== undefined && { outcomesJson: JSON.stringify(outcomes) }),
    },
  });
  return NextResponse.json({ product });
}

/** DELETE /api/admin/products/[id] — remove a product from the site. */
export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const existing = await db.product.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }
  await db.product.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
