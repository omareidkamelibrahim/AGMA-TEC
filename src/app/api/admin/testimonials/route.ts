import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";

const quoteSchema = z.object({
  quote: z.string().min(20).max(1000),
  name: z.string().min(2).max(120), // role/title shown publicly
  org: z.string().min(2).max(120), // sector description
  initials: z.string().min(1).max(4),
  sortOrder: z.number().int().min(0).max(999),
  published: z.boolean(),
});

/** GET /api/admin/testimonials — all quotes incl. unpublished, sorted. */
export async function GET() {
  const rows = await db.testimonial.findMany({ orderBy: { sortOrder: "asc" } });
  return NextResponse.json({ rows });
}

/** POST /api/admin/testimonials — add a client quote. */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = quoteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }
  const testimonial = await db.testimonial.create({ data: parsed.data });
  return NextResponse.json({ testimonial }, { status: 201 });
}


/** PATCH /api/admin/testimonials — bulk-publish / unpublish selected rows. */
export async function PATCH(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const ids: unknown = body?.ids;
  if (!Array.isArray(ids) || ids.length === 0 || !ids.every((i) => typeof i === "string")) {
    return NextResponse.json({ error: "ids must be a non-empty array of strings" }, { status: 400 });
  }
  if (typeof body?.published !== "boolean") {
    return NextResponse.json({ error: "published must be a boolean" }, { status: 400 });
  }
  let updated = 0;
  const failed: string[] = [];
  for (const id of ids) {
    try {
      await db.testimonial.update({ where: { id }, data: { published: body.published } });
      updated += 1;
    } catch {
      failed.push(id);
    }
  }
  return NextResponse.json({ ok: true, updated, failed });
}

/** DELETE /api/admin/testimonials?ids=a,b,c — bulk-delete selected rows. */
export async function DELETE(req: NextRequest) {
  const ids = (req.nextUrl.searchParams.get("ids") ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  if (ids.length === 0) {
    return NextResponse.json({ error: "Provide ?ids=a,b,c" }, { status: 400 });
  }
  let deleted = 0;
  const failed: string[] = [];
  for (const id of ids) {
    try {
      await db.testimonial.delete({ where: { id } });
      deleted += 1;
    } catch {
      failed.push(id);
    }
  }
  return NextResponse.json({ ok: true, deleted, failed });
}
