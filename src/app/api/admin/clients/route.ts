import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";

const KINDS = ["client", "partner"] as const;

const logoSchema = z.object({
  name: z.string().min(2).max(120),
  kind: z.enum(KINDS),
  imageUrl: z
    .string()
    .regex(/^\/(clients|partners)\/[A-Za-z0-9._-]+\.(png|jpg|jpeg|svg|webp)$/,
      "Image path must point at /clients/ or /partners/, e.g. /clients/acme.png"),
  sortOrder: z.number().int().min(0).max(999),
  published: z.boolean(),
});

/** GET /api/admin/clients — all logos incl. unpublished, sorted. */
export async function GET() {
  const rows = await db.clientLogo.findMany({ orderBy: { sortOrder: "asc" } });
  return NextResponse.json({ rows });
}

/** POST /api/admin/clients — add a client or partner logo. */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = logoSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }
  const logo = await db.clientLogo.create({ data: parsed.data });
  return NextResponse.json({ logo }, { status: 201 });
}
