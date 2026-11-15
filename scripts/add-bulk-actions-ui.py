#!/usr/bin/env python3
"""Wire bulk update/delete actions into the admin pages' selection bars."""
import re

BASE = "/home/z/my-project/src/components/admin/"

CONFIG = {
    "employees-client.tsx": dict(
        api="/api/admin/employees", key="employees",
        extra_invalidate='qc.invalidateQueries({ queryKey: ["admin-stats"] });',
        noun="employees",
        patch_actions=[
            ("Activate", '{ status: "Active" }', "Employees activated."),
            ("Suspend", '{ status: "Suspended" }', "Employees suspended."),
        ],
    ),
    "leave-client.tsx": dict(
        api="/api/admin/leave", key="leave", extra_invalidate="",
        noun="leave requests",
        patch_actions=[
            ("Approve", '{ status: "Approved" }', "Leave requests approved."),
            ("Reject", '{ status: "Rejected" }', "Leave requests rejected."),
        ],
    ),
    "inquiries-client.tsx": dict(
        api="/api/admin/inquiries", key="admin-inquiries", extra_invalidate="",
        noun="inquiries",
        patch_actions=[
            ("Mark handled", '{ status: "Handled" }', "Marked as handled."),
            ("Mark new", '{ status: "New" }', "Marked as new."),
        ],
    ),
    "newsletter-client.tsx": dict(
        api="/api/admin/newsletter", key="admin-newsletter", extra_invalidate="",
        noun="subscribers", patch_actions=[],
    ),
    "products-client.tsx": dict(
        api="/api/admin/products", key="admin-products", extra_invalidate="",
        noun="products",
        patch_actions=[
            ("Publish", "{ published: true }", "Products published."),
            ("Unpublish", "{ published: false }", "Products unpublished."),
        ],
    ),
    "services-client.tsx": dict(
        api="/api/admin/services", key="admin-services", extra_invalidate="",
        noun="services",
        patch_actions=[
            ("Publish", "{ published: true }", "Services published."),
            ("Unpublish", "{ published: false }", "Services unpublished."),
        ],
    ),
    "testimonials-client.tsx": dict(
        api="/api/admin/testimonials", key="admin-testimonials", extra_invalidate="",
        noun="testimonials",
        patch_actions=[
            ("Publish", "{ published: true }", "Testimonials published."),
            ("Unpublish", "{ published: false }", "Testimonials unpublished."),
        ],
    ),
    "clients-client.tsx": dict(
        api="/api/admin/clients", key="admin-clients", extra_invalidate="",
        noun="logos",
        patch_actions=[
            ("Publish", "{ published: true }", "Logos published."),
            ("Unpublish", "{ published: false }", "Logos unpublished."),
        ],
    ),
}

HANDLERS = '''
  const bulkIds = () => [...selected].join(",");

  const bulkUpdate = async (payload: Record<string, unknown>, okLabel: string) => {{
    const res = await fetch("{api}", {{
      method: "PATCH",
      headers: {{ "Content-Type": "application/json" }},
      body: JSON.stringify({{ ids: [...selected], ...payload }}),
    }});
    if (!res.ok) {{
      toast.error("Bulk update failed.");
      return;
    }}
    toast.success(okLabel);
    qc.invalidateQueries({{ queryKey: ["{key}"] }});
    {extra}
    setSelected(new Set());
  }};

  const bulkDelete = async () => {{
    if (!window.confirm(`Delete ${{selected.size}} selected {noun}? This cannot be undone.`)) return;
    const res = await fetch(`{api}?ids=${{bulkIds()}}`, {{ method: "DELETE" }});
    if (!res.ok) {{
      toast.error("Bulk delete failed.");
      return;
    }}
    toast.success(`${{selected.size}} {noun} deleted.`);
    qc.invalidateQueries({{ queryKey: ["{key}"] }});
    {extra}
    setSelected(new Set());
  }};
'''

for fname, c in CONFIG.items():
    p = BASE + fname
    src = open(p).read()
    if "bulkIds" in src:
        print(f"{fname}: already done, skipping")
        continue

    # 1) insert bulk handlers right after the selection state block
    marker = "/* photo-style row selection */"
    mi = src.index(marker)
    tail = "      return n;\n    });"
    ti = src.index(tail, mi)
    handlers = HANDLERS.format(api=c["api"], key=c["key"], noun=c["noun"],
                               extra=c["extra_invalidate"]).rstrip("\n")
    src = src[: ti + len(tail)] + "\n" + handlers + src[ti + len(tail):]

    # 2) build the actions array for the chip
    parts = [f'{{ label: "{label}", onClick: () => bulkUpdate({payload}, "{ok}") }}'
             for label, payload, ok in c["patch_actions"]]
    parts.append('{ label: "Delete", danger: true, onClick: bulkDelete }')

    # 3) wire into the chip: TableSummary pages vs plain SelectionChip pages
    if "onClearSelection={() => setSelected(new Set())}\n        />" in src:
        old = "onClearSelection={() => setSelected(new Set())}\n        />"
        actions_block = (
            "actions={[\n"
            + "".join("          " + p + ",\n" for p in parts)
            + "        ]}"
        )
        new = ("onClearSelection={() => setSelected(new Set())}\n"
               "          " + actions_block + "\n"
               "        />")
        assert src.count(old) == 1, f"{fname}: summary target not unique"
        src = src.replace(old, new, 1)
    else:
        old = '<SelectionChip count={selected.size} onClear={() => setSelected(new Set())} />'
        assert src.count(old) == 1, f"{fname}: chip target not unique"
        actions_block = (
            "actions={[\n"
            + "".join("            " + p + ",\n" for p in parts)
            + "          ]}"
        )
        new = ('<SelectionChip\n'
               '          count={selected.size}\n'
               '          onClear={() => setSelected(new Set())}\n'
               '          ' + actions_block + '\n'
               '        />')
        src = src.replace(old, new, 1)

    open(p, "w").write(src)
    print(f"{fname}: bulk actions wired")
