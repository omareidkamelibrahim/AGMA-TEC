import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

/** PATCH /api/admin/leave/[id] — approve or reject a leave request. */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = await req.json().catch(() => null);
  const status = body?.status;
  if (!["Approved", "Rejected", "Pending"].includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const existing = await db.leaveRequest.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Request not found" }, { status: 404 });
  }

  const updated = await db.leaveRequest.update({
    where: { id },
    data: { status },
  });
  return NextResponse.json({ request: updated });
}
