"use client";

import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Copy, Download, Mail, Megaphone, Trash2, UserPlus } from "lucide-react";
import {
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  PageHeader,
  RowActions,
  SortHeader,
  StatCard,
  ToolbarPill,
  ToolbarSearch,
  fmtDate,
  Checkbox,
  SelectionChip,
} from "./ui";

type Subscriber = {
  id: string;
  email: string;
  createdAt: string;
};

type Payload = { rows: Subscriber[]; stats: { total: number; last30: number } };

export function NewsletterClient() {
  const qc = useQueryClient();

  /* photo-style row selection */
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const toggleRow = (id: string, on: boolean) =>
    setSelected((s) => {
      const n = new Set(s);
      if (on) n.add(id);
      else n.delete(id);
      return n;
    });

  const bulkIds = () => [...selected].join(",");

  const bulkUpdate = async (payload: Record<string, unknown>, okLabel: string) => {
    const res = await fetch("/api/admin/newsletter", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: [...selected], ...payload }),
    });
    if (!res.ok) {
      toast.error("Bulk update failed.");
      return;
    }
    toast.success(okLabel);
    qc.invalidateQueries({ queryKey: ["admin-newsletter"] });
    
    setSelected(new Set());
  };

  const bulkDelete = async () => {
    if (!window.confirm(`Delete ${selected.size} selected subscribers? This cannot be undone.`)) return;
    const res = await fetch(`/api/admin/newsletter?ids=${bulkIds()}`, { method: "DELETE" });
    if (!res.ok) {
      toast.error("Bulk delete failed.");
      return;
    }
    toast.success(`${selected.size} subscribers deleted.`);
    qc.invalidateQueries({ queryKey: ["admin-newsletter"] });
    
    setSelected(new Set());
  };
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<{ field: string; dir: "asc" | "desc" }>({
    field: "createdAt",
    dir: "desc",
  });

  const onSort = (field: string) => {
    setSort((s) =>
      s.field === field
        ? { field, dir: s.dir === "asc" ? "desc" : "asc" }
        : { field, dir: "asc" },
    );
  };

  const { data, isLoading } = useQuery<Payload>({
    queryKey: ["admin-newsletter"],
    queryFn: async () => {
      const res = await fetch("/api/admin/newsletter");
      if (!res.ok) throw new Error("Failed to load subscribers");
      return res.json();
    },
  });

  const remove = async (row: Subscriber) => {
    if (!window.confirm(`Unsubscribe ${row.email}?`)) return;
    const res = await fetch(`/api/admin/newsletter/${row.id}`, { method: "DELETE" });
    if (!res.ok) {
      toast.error("Failed to remove subscriber.");
      return;
    }
    toast.success(`${row.email} removed.`);
    qc.invalidateQueries({ queryKey: ["admin-newsletter"] });
  };

  const copyEmail = async (email: string) => {
    try {
      await navigator.clipboard.writeText(email);
      toast.success(`${email} copied.`);
    } catch {
      toast.error("Could not copy the email.");
    }
  };

  const rows = data?.rows ?? [];
  const stats = data?.stats;

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    const filtered = q
      ? rows.filter((r) => r.email.toLowerCase().includes(q))
      : rows;
    const dir = sort.dir === "asc" ? 1 : -1;
    return [...filtered].sort((a, b) => {
      if (sort.field === "createdAt") {
        return (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) * dir;
      }
      return a.email.localeCompare(b.email) * dir;
    });
  }, [rows, search, sort]);

  return (
    <>
      <PageHeader
        title="Newsletter"
        description="Visitors who subscribed through the website footer form."
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <StatCard label="Subscribers" value={stats?.total ?? "—"} icon={Megaphone} tone="brand" />
        <StatCard label="New — last 30 days" value={stats?.last30 ?? "—"} icon={UserPlus} tone="success" />
      </div>

      {/* toolbar — search left, export pill right */}
      <div className="mt-6 flex flex-col gap-3 lg:flex-row lg:items-center">
        <ToolbarSearch
          value={search}
          onChange={setSearch}
          placeholder="Search email…"
          label="Search subscribers"
        />
        <div className="flex flex-wrap items-center gap-2.5 lg:justify-end">
          <ToolbarPill icon={Download} href="/api/admin/newsletter?format=csv" download>
            Export
          </ToolbarPill>
        </div>
      </div>

      {selected.size > 0 && (
        <div className="mt-3">
          <SelectionChip
          count={selected.size}
          onClear={() => setSelected(new Set())}
          actions={[
            { label: "Delete", danger: true, onClick: bulkDelete },
          ]}
        />
        </div>
      )}

      <div className="mt-4 overflow-hidden rounded-2xl border border-border bg-ink-850/85">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-sm">
            <thead>
              <tr className="border-b border-border/60 bg-ink-900/40">
                                <th className="h-11 w-12 pl-5 pr-1 align-middle" aria-label="Select">
                  <Checkbox
                    checked={ visible.length > 0 && visible.every((x) => selected.has(x.id)) }
                    indeterminate={ selected.size > 0 && !visible.every((x) => selected.has(x.id)) }
                    onChange={(on) => setSelected(on ? new Set(visible.map((x) => x.id)) : new Set())}
                    label="Select all rows"
                  />
                </th>
                <SortHeader label="Email" field="email" sort={sort.field} dir={sort.dir} onSort={onSort} />
                <SortHeader label="Subscribed" field="createdAt" sort={sort.field} dir={sort.dir} onSort={onSort} />
                <th className="h-11 w-14 px-4" aria-label="Actions" />
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={4} className="px-4 py-14 text-center text-sm text-muted-foreground">Loading subscribers…</td></tr>
              ) : visible.length === 0 ? (
                <tr><td colSpan={4} className="px-4 py-14 text-center text-sm text-muted-foreground">No subscribers match your search.</td></tr>
              ) : (
                visible.map((r) => (
                  <tr key={r.id} className="border-b border-border/40 transition-colors last:border-0 hover:bg-brand-500/[0.04]">
                    <td className="pl-5 pr-1 align-middle" onClick={(e) => e.stopPropagation()}>
                      <Checkbox checked={ selected.has(r.id) } onChange={(on) => toggleRow(r.id, on)} label={`Select ${r.email}`} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <span className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-brand-500/25 bg-brand-500/10 text-brand-accent">
                          <Mail className="size-4" />
                        </span>
                        <span className="font-medium text-foreground">{r.email}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[13px] text-muted-foreground">{fmtDate(r.createdAt)}</td>
                    <td className="px-4 py-3">
                      <RowActions label={`Actions for ${r.email}`}>
                        <DropdownMenuItem onClick={() => copyEmail(r.email)} className="gap-2">
                          <Copy className="size-4" /> Copy email
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-border/60" />
                        <DropdownMenuItem
                          onClick={() => remove(r)}
                          className="gap-2 text-red-500 focus:text-red-500"
                        >
                          <Trash2 className="size-4" /> Unsubscribe
                        </DropdownMenuItem>
                      </RowActions>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

