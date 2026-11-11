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
