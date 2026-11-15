#!/usr/bin/env python3
"""Add photo-style checkbox column + row selection to all admin list tables."""
import re

BASE = "/home/z/my-project/src/components/admin/"

CONFIG = {
    "employees-client.tsx": dict(
        list="rows", rowvar="e", label="e.name", indent=16,
        anchor='<SortHeader label="Code" field="empCode"',
        colspans=[(8, 9)], summary=True, chip_import=False,
    ),
    "leave-client.tsx": dict(
        list="rows", rowvar="l", label="l.employeeName", indent=16,
        anchor='{["Employee", "Type", "From", "To", "Days", "Reason", "Status", "Actions"].map',
        colspans=[(8, 9)], summary=True, chip_import=False,
    ),
    "payroll-client.tsx": dict(
        list="rows", rowvar="r", label="r.reference", indent=16,
        anchor='<SortHeader label="Reference" field="reference"',
        colspans=[(7, 8)], summary=False, chip_import=True,
    ),
    "inquiries-client.tsx": dict(
        list="visible", rowvar="r", label="r.name", indent=16,
        anchor='<SortHeader label="From" field="name"',
        colspans=[(6, 7)], summary=False, chip_import=True,
    ),
    "newsletter-client.tsx": dict(
        list="visible", rowvar="r", label="r.email", indent=16,
        anchor='<SortHeader label="Email" field="email"',
        colspans=[(3, 4)], summary=False, chip_import=True,
    ),
    "products-client.tsx": dict(
        list="visible", rowvar="r", label="r.name", indent=16,
        anchor='<SortHeader label="Product" field="name"',
        colspans=[(6, 7)], summary=False, chip_import=True,
    ),
    "services-client.tsx": dict(
        list="visible", rowvar="r", label="r.title", indent=16,
        anchor='<SortHeader label="Service" field="title"',
        colspans=[(4, 5)], summary=False, chip_import=True,
    ),
    "testimonials-client.tsx": dict(
        list="visible", rowvar="r", label="r.name", indent=16,
        anchor='<SortHeader label="Quote" field="quote"',
        colspans=[(6, 7)], summary=False, chip_import=True,
    ),
    "clients-client.tsx": dict(
        list="visibleLogos", rowvar="r", label="r.name", indent=18,
        anchor='<SortHeader label="Logo" field="name"',
        colspans=[(5, 6)], summary=False, chip_import=True,
    ),
}

for fname, c in CONFIG.items():
    p = BASE + fname
    src = open(p).read()
    if "photo-style row selection" in src:
        print(f"{fname}: already done, skipping")
        continue
    ind = " " * c["indent"]
    ind_td = " " * (c["indent"] + 4)
    ind_card = None

    # 1) ui imports
    names = "Checkbox" + (",\n  SelectionChip" if c["chip_import"] else "")
    assert '} from "./ui";' in src, f"{fname}: ui import not found"
    src = src.replace('} from "./ui";', f"  {names},\n}} from \"./ui\";", 1)

    # 2) selection state after useQueryClient
    anchor_qc = "const qc = useQueryClient();"
    assert anchor_qc in src, f"{fname}: qc anchor missing"
    state_block = (
        anchor_qc
        + "\n\n  /* photo-style row selection */\n"
        + "  const [selected, setSelected] = useState<Set<string>>(new Set());\n"
        + "  const toggleRow = (id: string, on: boolean) =>\n"
        + "    setSelected((s) => {\n"
        + "      const n = new Set(s);\n"
        + "      if (on) n.add(id);\n"
        + "      else n.delete(id);\n"
        + "      return n;\n"
        + "    });"
    )
    src = src.replace(anchor_qc, state_block, 1)

    # 3) select-all header cell before the first column anchor
    i = src.index(c["anchor"])
    src = src[:i] + (
        f'{ind}<th className="h-11 w-12 pl-5 pr-1 align-middle" aria-label="Select">\n'
        f'{ind}  <Checkbox\n'
        f'{ind}    checked={{ {c["list"]}.length > 0 && {c["list"]}.every((x) => selected.has(x.id)) }}\n'
        f'{ind}    indeterminate={{ selected.size > 0 && !{c["list"]}.every((x) => selected.has(x.id)) }}\n'
        f'{ind}    onChange={{(on) => setSelected(on ? new Set({c["list"]}.map((x) => x.id)) : new Set())}}\n'
        f'{ind}    label="Select all rows"\n'
        f'{ind}  />\n'
        f'{ind}</th>\n'
        + ind
    ) + src[i:]

    # 4) row checkbox cell before the first <td of the data row
    map_i = src.index(f'{c["list"]}.map(({c["rowvar"]})')
    td_i = src.index("<td className=", map_i)
    src = src[:td_i] + (
        f'<td className="pl-5 pr-1 align-middle" onClick={{(e) => e.stopPropagation()}}>\n'
        f'{ind_td}  <Checkbox checked={{ selected.has({c["rowvar"]}.id) }} onChange={{(on) => toggleRow({c["rowvar"]}.id, on)}} label={{`Select ${{{c["label"]}}}`}} />\n'
        f'{ind_td}</td>\n'
        + ind_td
    ) + src[td_i:]

    # 5) colSpan bumps
    for old, new in c["colspans"]:
        src = src.replace(f"colSpan={{{old}}}", f"colSpan={{{new}}}")

    # 6) selection chip display
    if c["summary"]:
        old = "onPage={setPage}\n        />"
        assert old in src, f"{fname}: TableSummary props not found"
        src = src.replace(
            old,
            "onPage={setPage}\n"
            "          selected={selected.size}\n"
            "          onClearSelection={() => setSelected(new Set())}\n"
            "        />",
            1,
        )
    else:
        m2 = re.search(r'( +)<div className="(?:mt-4 )?overflow-hidden rounded-2xl border border-border bg-ink-850/85">', src)
        assert m2, f"{fname}: table card not found"
        ind_card = m2.group(1)
        chip = (
            f'{ind_card}{{selected.size > 0 && (\n'
            f'{ind_card}  <div className="mt-3">\n'
            f'{ind_card}    <SelectionChip count={{selected.size}} onClear={{() => setSelected(new Set())}} />\n'
            f'{ind_card}  </div>\n'
            f'{ind_card})}}\n\n'
        )
        src = src[:m2.start()] + chip + src[m2.start():]

    open(p, "w").write(src)
    print(f"{fname}: done")
