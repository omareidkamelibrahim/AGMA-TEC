import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { ICON_MAP } from "@/lib/icon-map";

const updateSchema = z.object({
  title: z.string().min(2).max(120).optional(),
  text: z.string().min(10).max(600).optional(),
  icon: z.string().refine((n) => n in ICON_MAP, "Unknown icon").optional(),
  tags: z.array(z.string().min(1).max(60)).max(8).optional(),
  sortOrder: z.number().int().min(0).max(999).optional(),
  published: z.boolean().optional(),
});

type Params = { params: Promise<{ id: string }> };

/** PATCH /api/admin/services/[id] — update a service. */
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

  const existing = await db.service.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Service not found" }, { status: 404 });
  }

  const { tags, ...fields } = parsed.data;
  const service = await db.service.update({
    where: { id },
    data: {
      ...fields,
      ...(tags !== undefined && { tagsJson: JSON.stringify(tags) }),
    },
  });
  return NextResponse.json({ service });
}

/** DELETE /api/admin/services/[id] — remove a service from the site. */
export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const existing = await db.service.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Service not found" }, { status: 404 });
  }
  await db.service.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
