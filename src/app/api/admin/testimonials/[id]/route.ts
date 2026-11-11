import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";

const updateSchema = z.object({
  quote: z.string().min(20).max(1000).optional(),
  name: z.string().min(2).max(120).optional(),
  org: z.string().min(2).max(120).optional(),
  initials: z.string().min(1).max(4).optional(),
  sortOrder: z.number().int().min(0).max(999).optional(),
  published: z.boolean().optional(),
});

type Params = { params: Promise<{ id: string }> };

/** PATCH /api/admin/testimonials/[id] — update a quote. */
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
  const existing = await db.testimonial.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Testimonial not found" }, { status: 404 });
  }
  const testimonial = await db.testimonial.update({ where: { id }, data: parsed.data });
  return NextResponse.json({ testimonial });
}

/** DELETE /api/admin/testimonials/[id] — remove a quote. */
export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const existing = await db.testimonial.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Testimonial not found" }, { status: 404 });
  }
  await db.testimonial.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
