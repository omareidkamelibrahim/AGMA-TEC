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


/** PATCH /api/admin/clients — bulk-publish / unpublish selected rows. */
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
      await db.clientLogo.update({ where: { id }, data: { published: body.published } });
      updated += 1;
    } catch {
      failed.push(id);
    }
  }
  return NextResponse.json({ ok: true, updated, failed });
}

/** DELETE /api/admin/clients?ids=a,b,c — bulk-delete selected rows. */
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
      await db.clientLogo.delete({ where: { id } });
      deleted += 1;
    } catch {
      failed.push(id);
    }
  }
  return NextResponse.json({ ok: true, deleted, failed });
}
