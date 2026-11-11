import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";

const updateSchema = z.object({
  name: z.string().min(2).max(120).optional(),
  kind: z.enum(["client", "partner"]).optional(),
  imageUrl: z
    .string()
    .regex(/^\/(clients|partners)\/[A-Za-z0-9._-]+\.(png|jpg|jpeg|svg|webp)$/,
      "Image path must point at /clients/ or /partners/, e.g. /clients/acme.png")
    .optional(),
  sortOrder: z.number().int().min(0).max(999).optional(),
  published: z.boolean().optional(),
});

type Params = { params: Promise<{ id: string }> };

/** PATCH /api/admin/clients/[id] — update a logo entry. */
export async function PATCH(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const body = await req.json().catch(() => null);
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }
  const existing = await db.clientLogo.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Logo not found" }, { status: 404 });
  }
  const logo = await db.clientLogo.update({ where: { id }, data: parsed.data });
  return NextResponse.json({ logo });
}

/** DELETE /api/admin/clients/[id] — remove a logo entry. */
export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const existing = await db.clientLogo.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Logo not found" }, { status: 404 });
  }
  await db.clientLogo.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
