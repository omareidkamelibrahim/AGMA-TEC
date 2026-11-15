import { NextResponse } from "next/server";
import { db } from "@/lib/db";

/** GET /api/admin/badge — tiny payload for nav/topbar badges (60s client cache). */
export async function GET() {
  const unread = await db.contactMessage.count({ where: { status: "New" } });
  return NextResponse.json({ unread });
}
