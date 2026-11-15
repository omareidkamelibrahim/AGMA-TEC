#!/usr/bin/env python3
"""Append bulk PATCH/DELETE handlers to the admin collection API routes."""
import sys

BASE = "/home/z/my-project/src/app/api/admin/"

# model name verified against each [id] route
CONFIG = {
    "inquiries": dict(model="contactMessage", kind="status", statuses=["New", "Handled"]),
    "employees": dict(model="employee", kind="status",
                      statuses=["Active", "Probation", "Suspended", "Terminated"]),
    "leave": dict(model="leaveRequest", kind="status", statuses=["Approved", "Rejected", "Pending"]),
    "newsletter": dict(model="newsletterSubscriber", kind=None),
    "products": dict(model="product", kind="published"),
    "services": dict(model="service", kind="published"),
    "testimonials": dict(model="testimonial", kind="published"),
    "clients": dict(model="clientLogo", kind="published"),
}

PATCH_STATUS = '''
/** PATCH /api/admin/{route} — bulk-update the status of selected rows. */
export async function PATCH(req: NextRequest) {{
  const body = await req.json().catch(() => null);
  const ids: unknown = body?.ids;
  if (!Array.isArray(ids) || ids.length === 0 || !ids.every((i) => typeof i === "string")) {{
    return NextResponse.json({{ error: "ids must be a non-empty array of strings" }}, {{ status: 400 }});
  }}
  const status = body?.status;
  if (!{statuses}.includes(status)) {{
    return NextResponse.json({{ error: "Invalid status" }}, {{ status: 400 }});
  }}
  let updated = 0;
  const failed: string[] = [];
  for (const id of ids) {{
    try {{
      await db.{model}.update({{ where: {{ id }}, data: {{ status }} }});
      updated += 1;
    }} catch {{
      failed.push(id);
    }}
  }}
  return NextResponse.json({{ ok: true, updated, failed }});
}}
'''

PATCH_PUBLISHED = '''
/** PATCH /api/admin/{route} — bulk-publish / unpublish selected rows. */
export async function PATCH(req: NextRequest) {{
  const body = await req.json().catch(() => null);
  const ids: unknown = body?.ids;
  if (!Array.isArray(ids) || ids.length === 0 || !ids.every((i) => typeof i === "string")) {{
    return NextResponse.json({{ error: "ids must be a non-empty array of strings" }}, {{ status: 400 }});
  }}
  if (typeof body?.published !== "boolean") {{
    return NextResponse.json({{ error: "published must be a boolean" }}, {{ status: 400 }});
  }}
  let updated = 0;
  const failed: string[] = [];
  for (const id of ids) {{
    try {{
      await db.{model}.update({{ where: {{ id }}, data: {{ published: body.published }} }});
      updated += 1;
    }} catch {{
      failed.push(id);
    }}
  }}
  return NextResponse.json({{ ok: true, updated, failed }});
}}
'''

DELETE_BULK = '''
/** DELETE /api/admin/{route}?ids=a,b,c — bulk-delete selected rows. */
export async function DELETE(req: NextRequest) {{
  const ids = (req.nextUrl.searchParams.get("ids") ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  if (ids.length === 0) {{
    return NextResponse.json({{ error: "Provide ?ids=a,b,c" }}, {{ status: 400 }});
  }}
  let deleted = 0;
  const failed: string[] = [];
  for (const id of ids) {{
    try {{
      await db.{model}.delete({{ where: {{ id }} }});
      deleted += 1;
    }} catch {{
      failed.push(id);
    }}
  }}
  return NextResponse.json({{ ok: true, deleted, failed }});
}}
'''

for route, c in CONFIG.items():
    p = BASE + route + "/route.ts"
    src = open(p).read()
    if "bulk-delete selected rows" in src or "bulk-update the status" in src or "bulk-publish" in src:
        print(f"{route}: already done, skipping")
        continue
    assert f"db.{c['model']}." in open(BASE + route + "/[id]/route.ts").read(), f"{route}: model mismatch"
    add = "\n"
    if c["kind"] == "status":
        add += PATCH_STATUS.format(route=route, model=c["model"], statuses=str(c["statuses"]))
    elif c["kind"] == "published":
        add += PATCH_PUBLISHED.format(route=route, model=c["model"])
    add += DELETE_BULK.format(route=route, model=c["model"])
    open(p, "a").write(add)
    print(f"{route}: bulk handlers added")
