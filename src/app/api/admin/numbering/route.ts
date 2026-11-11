import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

/** GET /api/admin/numbering — numbering series + integrity stats. */
export async function GET() {
  const rows = await db.numberingSeries.findMany({
    orderBy: { prefix: "asc" },
  });
  const configured = rows.filter((r) => r.padding > 0 && r.prefix).length;
  return NextResponse.json({
    rows,
    stats: {
      total: rows.length,
      configured,
      expected: rows.length,
      missing: rows.length - configured,
    },
  });
}

/** POST /api/admin/numbering — add a numbering series. */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const document = String(body?.document ?? "").trim();
  const prefix = String(body?.prefix ?? "").trim();
  const padding = parseInt(body?.padding ?? "5", 10);

  if (!document || !prefix) {
    return NextResponse.json(
      { error: "Document type and prefix are required" },
      { status: 400 },
    );
  }
  if (!/^[A-Z0-9_]+( - .+)?$/.test(document)) {
    return NextResponse.json(
      { error: "Document must look like TYPE - Label" },
      { status: 400 },
    );
  }
  if (!/^[A-Z0-9]+-$/.test(prefix)) {
    return NextResponse.json(
      { error: "Prefix must be uppercase letters/digits ending with '-'" },
      { status: 400 },
    );
  }
  if (!Number.isInteger(padding) || padding < 1 || padding > 12) {
    return NextResponse.json({ error: "Padding must be 1–12" }, { status: 400 });
  }
  const dup = await db.numberingSeries.findFirst({ where: { prefix } });
  if (dup) {
    return NextResponse.json(
      { error: `Prefix ${prefix} is already used by ${dup.document}` },
      { status: 409 },
    );
  }

  const series = await db.numberingSeries.create({
    data: {
      document,
      prefix,
      padding,
      dateToken: body?.dateToken ? String(body.dateToken) : null,
      scope: body?.scope ? String(body.scope) : null,
    },
  });
  return NextResponse.json({ series }, { status: 201 });
}
