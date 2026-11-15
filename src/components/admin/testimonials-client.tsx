"use client";

import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Download,
  Eye,
  EyeOff,
  Globe,
  MessageSquareQuote,
  Pencil,
  Plus,
  Quote,
  Trash2,
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  FiltersPill,
  PageHeader,
  RowActions,
  SortHeader,
  StatCard,
  ToolbarPill,
  ToolbarPrimary,
  ToolbarSearch,
  Checkbox,
  SelectionChip,
} from "./ui";
import { ImportDialog } from "./import-dialog";
import { PublishedSwitch } from "./website-bits";

export type TestimonialRow = {
  id: string;
  quote: string;
  name: string; // role/title shown publicly
  org: string; // sector description
  initials: string;
  sortOrder: number;
  published: boolean;
};

type FormState = {
  quote: string;
  name: string;
  org: string;
  initials: string;
  sortOrder: number;
  published: boolean;
};

const EMPTY_FORM: FormState = {
  quote: "",
  name: "",
  org: "",
  initials: "",
  sortOrder: 10,
  published: true,
};

const IMPORT_TEMPLATE = `Quote,Attribution,Sector,Initials,Sort Order,Published
AGMA delivered our ERP rollout on schedule and under budget.,CIO,Regional retail group,CIO,10,yes
Their facility management suite cut our response times in half.,Operations Director,Industrial manufacturing,OD,20,yes`;

export function TestimonialsClient() {
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
    const res = await fetch("/api/admin/testimonials", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: [...selected], ...payload }),
    });
    if (!res.ok) {
      toast.error("Bulk update failed.");
      return;
    }
    toast.success(okLabel);
    qc.invalidateQueries({ queryKey: ["admin-testimonials"] });
    
    setSelected(new Set());
  };

  const bulkDelete = async () => {
    if (!window.confirm(`Delete ${selected.size} selected testimonials? This cannot be undone.`)) return;
    const res = await fetch(`/api/admin/testimonials?ids=${bulkIds()}`, { method: "DELETE" });
    if (!res.ok) {
      toast.error("Bulk delete failed.");
      return;
    }
    toast.success(`${selected.size} testimonials deleted.`);
    qc.invalidateQueries({ queryKey: ["admin-testimonials"] });
    
    setSelected(new Set());
  };
  const [editing, setEditing] = useState<TestimonialRow | null>(null);
  const [open, setOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [sort, setSort] = useState<{ field: string; dir: "asc" | "desc" }>({
    field: "sortOrder",
    dir: "asc",
  });

  const onSort = (field: string) => {
    setSort((s) =>
      s.field === field
        ? { field, dir: s.dir === "asc" ? "desc" : "asc" }
        : { field, dir: "asc" },
    );
  };

  const { data, isLoading } = useQuery<{ rows: TestimonialRow[] }>({
    queryKey: ["admin-testimonials"],
    queryFn: async () => {
      const res = await fetch("/api/admin/testimonials");
      if (!res.ok) throw new Error("Failed to load testimonials");
      return res.json();
    },
  });
  const rows = data?.rows ?? [];

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    const filtered = rows.filter((r) => {
      if (filter === "live" && !r.published) return false;
      if (filter === "hidden" && r.published) return false;
      if (!q) return true;
      return `${r.quote} ${r.name} ${r.org}`.toLowerCase().includes(q);
    });
    const dir = sort.dir === "asc" ? 1 : -1;
    return [...filtered].sort((a, b) =>
      String(a[sort.field as keyof TestimonialRow] ?? "").localeCompare(
        String(b[sort.field as keyof TestimonialRow] ?? ""),
      ) * dir,
    );
  }, [rows, search, filter, sort]);

  const openCreate = () => {
    setEditing(null);
    setForm({ ...EMPTY_FORM, sortOrder: rows.length + 1 });
    setOpen(true);
  };

  const openEdit = (row: TestimonialRow) => {
    setEditing(row);
    setForm({
      quote: row.quote,
      name: row.name,
      org: row.org,
      initials: row.initials,
      sortOrder: row.sortOrder,
      published: row.published,
    });
    setOpen(true);
  };

  const save = async () => {
    if (form.quote.trim().length < 20 || form.name.trim().length < 2 || form.org.trim().length < 2) {
      toast.error("Quote needs 20+ characters; attribution and sector need 2+ each.");
      return;
    }
    setSaving(true);
    try {
      const initials =
        form.initials.trim() ||
        form.name
          .trim()
          .split(/\s+/)
          .map((w) => w[0])
          .slice(0, 2)
          .join("")
          .toUpperCase();
      const payload = {
        quote: form.quote.trim(),
        name: form.name.trim(),
        org: form.org.trim(),
        initials,
        sortOrder: Number(form.sortOrder) || 0,
        published: form.published,
      };
      const res = await fetch(
        editing ? `/api/admin/testimonials/${editing.id}` : "/api/admin/testimonials",
        {
          method: editing ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? "Request failed");
      toast.success(editing ? "Testimonial updated — live on the site." : "Testimonial created.");
      setOpen(false);
      qc.invalidateQueries({ queryKey: ["admin-testimonials"] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  const togglePublished = async (row: TestimonialRow) => {
    const res = await fetch(`/api/admin/testimonials/${row.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ published: !row.published }),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => null);
      toast.error(body?.error ?? "Failed to update");
      return;
    }
    toast.success(row.published ? "Testimonial hidden from the site." : "Testimonial is live on the site.");
    qc.invalidateQueries({ queryKey: ["admin-testimonials"] });
  };

  const remove = async (row: TestimonialRow) => {
    if (!window.confirm(`Delete the quote from "${row.name}"?`)) return;
    const res = await fetch(`/api/admin/testimonials/${row.id}`, { method: "DELETE" });
    if (!res.ok) {
      toast.error("Failed to delete testimonial.");
      return;
    }
    toast.success("Testimonial deleted.");
    qc.invalidateQueries({ queryKey: ["admin-testimonials"] });
  };

  const publishedCount = rows.filter((r) => r.published).length;

  return (
    <>
      <PageHeader
        title="Testimonials"
        description="Client quotes shown in the homepage slider and trust sections."
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Testimonials" value={rows.length} icon={MessageSquareQuote} tone="brand" />
        <StatCard label="Live on the site" value={publishedCount} icon={Globe} tone="success" />
        <StatCard label="Hidden" value={rows.length - publishedCount} icon={EyeOff} tone="neutral" />
      </div>

      {/* toolbar — search left, action pills right */}
      <div className="mt-6 flex flex-col gap-3 lg:flex-row lg:items-center">
        <ToolbarSearch
          value={search}
          onChange={setSearch}
          placeholder="Search quote or sector…"
          label="Search testimonials"
        />
        <div className="flex flex-wrap items-center gap-2.5 lg:justify-end">
          <ToolbarPill icon={Upload} onClick={() => setImportOpen(true)}>
            Import
          </ToolbarPill>
          <FiltersPill
            active={filter !== "all" ? 1 : 0}
            onClear={() => setFilter("all")}
          >
            <div className="space-y-1.5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">On site</p>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { v: "all", label: "All" },
                  { v: "live", label: "Live" },
                  { v: "hidden", label: "Hidden" },
                ].map((o) => (
                  <button
                    key={o.v}
                    type="button"
                    onClick={() => setFilter(o.v)}
                    className={
                      filter === o.v
                        ? "rounded-lg border border-brand-500 bg-brand-500/15 py-2 text-[12.5px] font-semibold text-brand-accent-bright"
                        : "rounded-lg border border-border py-2 text-[12.5px] font-medium text-muted-foreground transition-colors hover:border-brand-500/40 hover:text-foreground"
                    }
                  >
                    {o.label}
                  </button>
                ))}
              </div>
            </div>
          </FiltersPill>
          <ToolbarPill icon={Download} href="/api/admin/testimonials/export" download>
            Export
          </ToolbarPill>
          <ToolbarPrimary icon={Plus} onClick={openCreate}>
            New testimonial
          </ToolbarPrimary>
        </div>
      </div>

      {selected.size > 0 && (
        <div className="mt-3">
          <SelectionChip
          count={selected.size}
          onClear={() => setSelected(new Set())}
          actions={[
            { label: "Publish", onClick: () => bulkUpdate({ published: true }, "Testimonials published.") },
            { label: "Unpublish", onClick: () => bulkUpdate({ published: false }, "Testimonials unpublished.") },
            { label: "Delete", danger: true, onClick: bulkDelete },
          ]}
        />
        </div>
      )}

      <div className="mt-4 overflow-hidden rounded-2xl border border-border bg-ink-850/85">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
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
                <SortHeader label="Quote" field="quote" sort={sort.field} dir={sort.dir} onSort={onSort} />
                <SortHeader label="Attribution" field="name" sort={sort.field} dir={sort.dir} onSort={onSort} />
                <SortHeader label="Sector" field="org" sort={sort.field} dir={sort.dir} onSort={onSort} />
                <SortHeader label="Order" field="sortOrder" sort={sort.field} dir={sort.dir} onSort={onSort} />
                <SortHeader label="On site" field="published" sort={sort.field} dir={sort.dir} onSort={onSort} />
                <th className="h-11 w-14 px-4" aria-label="Actions" />
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={7} className="px-4 py-14 text-center text-sm text-muted-foreground">Loading testimonials…</td></tr>
              ) : visible.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-14 text-center text-sm text-muted-foreground">No testimonials match your search or filter.</td></tr>
              ) : (
                visible.map((r) => (
                  <tr key={r.id} className="border-b border-border/40 transition-colors last:border-0 hover:bg-brand-500/[0.04]">
                    <td className="pl-5 pr-1 align-middle" onClick={(e) => e.stopPropagation()}>
                      <Checkbox checked={ selected.has(r.id) } onChange={(on) => toggleRow(r.id, on)} label={`Select ${r.name}`} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex max-w-md items-start gap-3">
                        <span className="flex size-9 shrink-0 items-center justify-center rounded-full border border-brand-500/25 bg-brand-500/12 text-[11px] font-bold text-brand-accent-bright">
                          {r.initials || <Quote className="size-4" />}
                        </span>
                        <p className="line-clamp-2 text-[12.5px] leading-snug text-foreground/85">“{r.quote}”</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-medium text-foreground/90">{r.name}</td>
                    <td className="px-4 py-3 text-[12.5px] text-muted-foreground">{r.org}</td>
                    <td className="px-4 py-3 font-mono text-[12px] text-muted-foreground">{r.sortOrder}</td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => togglePublished(r)}
                        aria-label={r.published ? `Hide ${r.name}'s quote from the site` : `Publish ${r.name}'s quote to the site`}
                        className="inline-flex"
                      >
                        {r.published ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-500">
                            <Eye className="size-3.5" /> Live
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-ink-800/60 px-2.5 py-1 text-[11px] font-semibold text-muted-foreground">
                            <EyeOff className="size-3.5" /> Hidden
                          </span>
                        )}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <RowActions label={`Actions for ${r.name}`}>
                        <DropdownMenuItem onClick={() => openEdit(r)} className="gap-2">
                          <Pencil className="size-4" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => togglePublished(r)} className="gap-2">
                          {r.published ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                          {r.published ? "Hide from site" : "Publish to site"}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-border/60" />
                        <DropdownMenuItem
                          onClick={() => remove(r)}
                          className="gap-2 text-red-500 focus:text-red-500"
                        >
                          <Trash2 className="size-4" /> Delete
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

      {/* ---- CSV import ---- */}
      <ImportDialog
        open={importOpen}
        onOpenChange={setImportOpen}
        title="Import testimonials"
        description="Upload a CSV with the same columns as the Export file. Duplicate quotes are skipped."
        resource="testimonials"
        template={IMPORT_TEMPLATE}
        onImported={() => qc.invalidateQueries({ queryKey: ["admin-testimonials"] })}
      />

      {/* ---- Editor dialog ---- */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-ink-900 sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit testimonial" : "New testimonial"}</DialogTitle>
            <DialogDescription>
              Quotes appear in the homepage slider — keep them short and specific.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="t-quote">Quote</Label>
              <Textarea
                id="t-quote"
                className="min-h-24 bg-ink-900/60"
                value={form.quote}
                onChange={(e) => setForm((f) => ({ ...f, quote: e.target.value }))}
                placeholder="AGMA delivered our ERP rollout on schedule…"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="t-name">Attribution</Label>
              <Input id="t-name" className="bg-ink-900/60" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="CIO, regional retail group" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="t-org">Sector</Label>
              <Input id="t-org" className="bg-ink-900/60" value={form.org} onChange={(e) => setForm((f) => ({ ...f, org: e.target.value }))} placeholder="Regional retail group" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="t-initials">Initials — optional</Label>
              <Input id="t-initials" maxLength={4} className="bg-ink-900/60" value={form.initials} onChange={(e) => setForm((f) => ({ ...f, initials: e.target.value.toUpperCase() }))} placeholder="Auto from attribution" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="t-order">Display order</Label>
              <Input id="t-order" type="number" min={0} className="bg-ink-900/60" value={form.sortOrder} onChange={(e) => setForm((f) => ({ ...f, sortOrder: Number(e.target.value) }))} />
            </div>
          </div>

          <PublishedSwitch checked={form.published} onChange={(published) => setForm((f) => ({ ...f, published }))} />

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={save} disabled={saving}>
              {saving ? "Saving…" : editing ? "Save changes" : "Create testimonial"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
