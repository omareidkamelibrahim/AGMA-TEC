import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { ICON_MAP } from "@/lib/icon-map";

const serviceSchema = z.object({
  title: z.string().min(2).max(120),
  text: z.string().min(10).max(600),
  icon: z.string().refine((n) => n in ICON_MAP, "Unknown icon"),
  tags: z.array(z.string().min(1).max(60)).max(8),
  sortOrder: z.number().int().min(0).max(999),
  published: z.boolean(),
});

/** GET /api/admin/services — all services incl. unpublished, sorted. */
export async function GET() {
  const rows = await db.service.findMany({ orderBy: { sortOrder: "asc" } });
  return NextResponse.json({ rows });
}

/** POST /api/admin/services — create a service. */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = serviceSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }

  const { tags, ...fields } = parsed.data;
  const service = await db.service.create({
    data: { ...fields, tagsJson: JSON.stringify(tags) },
  });
  return NextResponse.json({ service }, { status: 201 });
}


/** PATCH /api/admin/services — bulk-publish / unpublish selected rows. */
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
      await db.service.update({ where: { id }, data: { published: body.published } });
      updated += 1;
    } catch {
      failed.push(id);
    }
  }
  return NextResponse.json({ ok: true, updated, failed });
}

/** DELETE /api/admin/services?ids=a,b,c — bulk-delete selected rows. */
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
      await db.service.delete({ where: { id } });
      deleted += 1;
    } catch {
      failed.push(id);
    }
  }
  return NextResponse.json({ ok: true, deleted, failed });
}
