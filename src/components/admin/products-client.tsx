"use client";

import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Download,
  Eye,
  EyeOff,
  Globe,
  Package,
  Pencil,
  Plus,
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { iconFromName } from "@/lib/icon-map";
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
import { ACCENT_OPTIONS, IconSelect, PublishedSwitch } from "./website-bits";

type Capability = { icon: string; label: string; text: string };

export type ProductRow = {
  id: string;
  slug: string;
  name: string;
  fullName: string;
  scope: string;
  description: string;
  icon: string;
  accent: string;
  image: string;
  sortOrder: number;
  published: boolean;
  capabilitiesJson: string;
  outcomesJson: string;
};

type FormState = {
  slug: string;
  name: string;
  fullName: string;
  scope: string;
  description: string;
  icon: string;
  accent: string;
  image: string;
  sortOrder: number;
  published: boolean;
  capabilities: Capability[];
  outcomes: string;
};

const EMPTY_FORM: FormState = {
  slug: "",
  name: "",
  fullName: "",
  scope: "",
  description: "",
  icon: "Boxes",
  accent: "from-brand-600",
  image: "",
  sortOrder: 10,
  published: true,
  capabilities: [],
  outcomes: "",
};

const IMPORT_TEMPLATE = `Name,Full Name,Slug,Scope,Description,Icon,Image,Sort Order,Published
AGMA ERP,Enterprise Resource Planning,agma-erp,Finance · HR · Inventory · Procurement,Run the whole business on one system.,Boxes,/products/agma-erp.png,10,yes
AGMA CAFM,Computer-Aided Facility Management,agma-cafm,Operations · Maintenance · Assets,Plan and track every facility task.,Building2,/products/agma-cafm.png,20,yes`;

function parse<T>(raw: string, fallback: T): T {
  try {
    return JSON.parse(raw) ?? fallback;
  } catch {
    return fallback;
  }
}

export function ProductsClient() {
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
    const res = await fetch("/api/admin/products", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: [...selected], ...payload }),
    });
    if (!res.ok) {
      toast.error("Bulk update failed.");
      return;
    }
    toast.success(okLabel);
    qc.invalidateQueries({ queryKey: ["admin-products"] });
    
    setSelected(new Set());
  };

  const bulkDelete = async () => {
    if (!window.confirm(`Delete ${selected.size} selected products? This cannot be undone.`)) return;
    const res = await fetch(`/api/admin/products?ids=${bulkIds()}`, { method: "DELETE" });
    if (!res.ok) {
      toast.error("Bulk delete failed.");
      return;
    }
    toast.success(`${selected.size} products deleted.`);
    qc.invalidateQueries({ queryKey: ["admin-products"] });
    
    setSelected(new Set());
  };
  const [editing, setEditing] = useState<ProductRow | null>(null);
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

  const { data, isLoading } = useQuery<{ rows: ProductRow[] }>({
    queryKey: ["admin-products"],
    queryFn: async () => {
      const res = await fetch("/api/admin/products");
      if (!res.ok) throw new Error("Failed to load products");
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
      return `${r.name} ${r.fullName} ${r.slug} ${r.scope}`.toLowerCase().includes(q);
    });
    const dir = sort.dir === "asc" ? 1 : -1;
    return [...filtered].sort((a, b) => {
      if (sort.field === "sortOrder" || sort.field === "caps") {
        const av =
          sort.field === "caps"
            ? parse<Capability[]>(a.capabilitiesJson, []).length
            : a.sortOrder;
        const bv =
          sort.field === "caps"
            ? parse<Capability[]>(b.capabilitiesJson, []).length
            : b.sortOrder;
        return (av - bv) * dir;
      }
      return String(a[sort.field as keyof ProductRow] ?? "").localeCompare(
        String(b[sort.field as keyof ProductRow] ?? ""),
      ) * dir;
    });
  }, [rows, search, filter, sort]);

  const openCreate = () => {
    setEditing(null);
    setForm({ ...EMPTY_FORM, sortOrder: rows.length + 1 });
    setOpen(true);
  };

  const openEdit = (row: ProductRow) => {
    setEditing(row);
    setForm({
      slug: row.slug,
      name: row.name,
      fullName: row.fullName,
      scope: row.scope,
      description: row.description,
      icon: row.icon,
      accent: row.accent,
      image: row.image,
      sortOrder: row.sortOrder,
      published: row.published,
      capabilities: parse<Capability[]>(row.capabilitiesJson, []),
      outcomes: parse<string[]>(row.outcomesJson, []).join("\n"),
    });
    setOpen(true);
  };

  const save = async () => {
    if (form.name.trim().length < 2 || form.fullName.trim().length < 2) {
      toast.error("Name and full name are required.");
      return;
    }
    if (!editing && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(form.slug)) {
      toast.error("Slug must be kebab-case, e.g. agma-erp.");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        fullName: form.fullName.trim(),
        scope: form.scope.trim(),
        description: form.description.trim(),
        icon: form.icon,
        accent: form.accent,
        image: form.image.trim(),
        sortOrder: Number(form.sortOrder) || 0,
        published: form.published,
        capabilities: form.capabilities,
        outcomes: form.outcomes
          .split("\n")
          .map((s) => s.trim())
          .filter(Boolean),
      };
      const res = await fetch(
        editing ? `/api/admin/products/${editing.id}` : "/api/admin/products",
        {
          method: editing ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? "Request failed");
      toast.success(editing ? "Product updated — live on the site." : "Product created.");
      setOpen(false);
      qc.invalidateQueries({ queryKey: ["admin-products"] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  const togglePublished = async (row: ProductRow) => {
    const res = await fetch(`/api/admin/products/${row.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ published: !row.published }),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => null);
      toast.error(body?.error ?? "Failed to update");
      return;
    }
    toast.success(row.published ? "Product hidden from the site." : "Product is live on the site.");
    qc.invalidateQueries({ queryKey: ["admin-products"] });
  };

  const remove = async (row: ProductRow) => {
    if (!window.confirm(`Delete ${row.name}? Its page /products/${row.slug} will stop working.`)) return;
    const res = await fetch(`/api/admin/products/${row.id}`, { method: "DELETE" });
    if (!res.ok) {
      toast.error("Failed to delete product.");
      return;
    }
    toast.success(`${row.name} deleted.`);
    qc.invalidateQueries({ queryKey: ["admin-products"] });
  };

  const setCap = (i: number, patch: Partial<Capability>) => {
    setForm((f) => ({
      ...f,
      capabilities: f.capabilities.map((c, idx) => (idx === i ? { ...c, ...patch } : c)),
    }));
  };

  const publishedCount = rows.filter((r) => r.published).length;

  return (
    <>
      <PageHeader
        title="Products"
        description="The AGMA product suite shown on the homepage, /products and every product page."
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Products" value={rows.length} icon={Package} tone="brand" />
        <StatCard label="Live on the site" value={publishedCount} icon={Globe} tone="success" />
        <StatCard
          label="Total capabilities listed"
          value={rows.reduce((acc, r) => acc + parse<Capability[]>(r.capabilitiesJson, []).length, 0)}
          icon={Plus}
          tone="neutral"
        />
      </div>

      {/* toolbar — search left, action pills right */}
      <div className="mt-6 flex flex-col gap-3 lg:flex-row lg:items-center">
        <ToolbarSearch
          value={search}
          onChange={setSearch}
          placeholder="Search product or slug…"
          label="Search products"
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
          <ToolbarPill icon={Download} href="/api/admin/products/export" download>
            Export
          </ToolbarPill>
          <ToolbarPrimary icon={Plus} onClick={openCreate}>
            New product
          </ToolbarPrimary>
        </div>
      </div>

      {selected.size > 0 && (
        <div className="mt-3">
          <SelectionChip
          count={selected.size}
          onClear={() => setSelected(new Set())}
          actions={[
            { label: "Publish", onClick: () => bulkUpdate({ published: true }, "Products published.") },
            { label: "Unpublish", onClick: () => bulkUpdate({ published: false }, "Products unpublished.") },
            { label: "Delete", danger: true, onClick: bulkDelete },
          ]}
        />
        </div>
      )}

      <div className="mt-4 overflow-hidden rounded-2xl border border-border bg-ink-850/85">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[880px] text-sm">
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
                <SortHeader label="Product" field="name" sort={sort.field} dir={sort.dir} onSort={onSort} />
                <SortHeader label="Scope" field="scope" sort={sort.field} dir={sort.dir} onSort={onSort} />
                <SortHeader label="Capabilities" field="caps" sort={sort.field} dir={sort.dir} onSort={onSort} />
                <SortHeader label="Order" field="sortOrder" sort={sort.field} dir={sort.dir} onSort={onSort} />
                <SortHeader label="On site" field="published" sort={sort.field} dir={sort.dir} onSort={onSort} />
                <th className="h-11 w-14 px-4" aria-label="Actions" />
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={7} className="px-4 py-14 text-center text-sm text-muted-foreground">Loading products…</td></tr>
              ) : visible.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-14 text-center text-sm text-muted-foreground">No products match your search or filter.</td></tr>
              ) : (
                visible.map((r) => {
                  const Icon = iconFromName(r.icon);
                  const caps = parse<Capability[]>(r.capabilitiesJson, []).length;
                  return (
                    <tr key={r.id} className="border-b border-border/40 transition-colors last:border-0 hover:bg-brand-500/[0.04]">
                      <td className="pl-5 pr-1 align-middle" onClick={(e) => e.stopPropagation()}>
                      <Checkbox checked={ selected.has(r.id) } onChange={(on) => toggleRow(r.id, on)} label={`Select ${r.name}`} />
                    </td>
                    <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-brand-500/25 bg-brand-500/10 text-brand-accent">
                            <Icon className="size-5" />
                          </span>
                          <div className="min-w-0">
                            <p className="font-semibold text-foreground">{r.name}</p>
                            <p className="truncate text-[12px] text-muted-foreground">
                              /products/{r.slug} · {r.fullName}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-[13px] text-muted-foreground">{r.scope}</td>
                      <td className="px-4 py-3 font-medium text-foreground">{caps}</td>
                      <td className="px-4 py-3 font-mono text-[12px] text-muted-foreground">{r.sortOrder}</td>
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={() => togglePublished(r)}
                          aria-label={r.published ? `Hide ${r.name} from the site` : `Publish ${r.name} to the site`}
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
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ---- CSV import ---- */}
      <ImportDialog
        open={importOpen}
        onOpenChange={setImportOpen}
        title="Import products"
        description="Upload a CSV with the same columns as the Export file. Existing slugs are skipped."
        resource="products"
        template={IMPORT_TEMPLATE}
        onImported={() => qc.invalidateQueries({ queryKey: ["admin-products"] })}
      />

      {/* ---- Editor dialog ---- */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto bg-ink-900 sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editing ? `Edit ${editing.name}` : "New product"}</DialogTitle>
            <DialogDescription>
              {editing
                ? "Changes appear on the homepage, /products and the product page immediately."
                : "The slug becomes the public URL: /products/<slug>."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="p-name">Name</Label>
              <Input id="p-name" className="bg-ink-900/60" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="AGMA ERP" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="p-slug">Slug {editing && <span className="text-muted-foreground">(fixed)</span>}</Label>
              <Input id="p-slug" className="bg-ink-900/60 font-mono text-[13px]" value={form.slug} disabled={!!editing} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))} placeholder="agma-erp" />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="p-full">Full title</Label>
              <Input id="p-full" className="bg-ink-900/60" value={form.fullName} onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))} placeholder="Enterprise Resource Planning" />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="p-scope">Scope line</Label>
              <Input id="p-scope" className="bg-ink-900/60" value={form.scope} onChange={(e) => setForm((f) => ({ ...f, scope: e.target.value }))} placeholder="Finance · HR · Inventory · Procurement" />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="p-desc">Description</Label>
              <Textarea id="p-desc" className="min-h-24 bg-ink-900/60" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="p-icon">Icon</Label>
              <IconSelect id="p-icon" value={form.icon} onChange={(icon) => setForm((f) => ({ ...f, icon }))} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="p-accent">Accent gradient</Label>
              <Select value={form.accent} onValueChange={(accent) => setForm((f) => ({ ...f, accent }))}>
                <SelectTrigger id="p-accent" className="w-full bg-ink-900/60"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-ink-900">
                  {ACCENT_OPTIONS.map((a) => (
                    <SelectItem key={a.value} value={a.value}>
                      <span className="flex items-center gap-2">
                        <span className={`h-3 w-8 rounded-full bg-gradient-to-r ${a.value} to-transparent`} />
                        {a.label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="p-image">Concept image path</Label>
              <Input id="p-image" className="bg-ink-900/60 font-mono text-[13px]" value={form.image} onChange={(e) => setForm((f) => ({ ...f, image: e.target.value }))} placeholder="/products/agma-erp.png" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="p-order">Display order</Label>
              <Input id="p-order" type="number" min={0} className="bg-ink-900/60" value={form.sortOrder} onChange={(e) => setForm((f) => ({ ...f, sortOrder: Number(e.target.value) }))} />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="p-outcomes">Value outcomes — one per line</Label>
              <Textarea id="p-outcomes" className="min-h-20 bg-ink-900/60" value={form.outcomes} onChange={(e) => setForm((f) => ({ ...f, outcomes: e.target.value }))} placeholder={"Centralized business operations\nStreamlined, automated workflows"} />
            </div>
          </div>

          {/* capabilities repeater */}
          <div className="rounded-xl border border-border/70 bg-ink-900/40 p-4">
            <div className="flex items-center justify-between">
              <Label>Capabilities</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-1.5"
                onClick={() =>
                  setForm((f) => ({
                    ...f,
                    capabilities: [...f.capabilities, { icon: "Boxes", label: "", text: "" }],
                  }))
                }
              >
                <Plus className="size-3.5" /> Add capability
              </Button>
            </div>
            <div className="mt-3 space-y-3">
              {form.capabilities.length === 0 && (
                <p className="text-[13px] text-muted-foreground">No capabilities yet — add what this product delivers.</p>
              )}
              {form.capabilities.map((c, i) => (
                <div key={i} className="grid gap-2 rounded-lg border border-border/60 bg-ink-850/60 p-3 sm:grid-cols-[130px_1fr_auto]">
                  <IconSelect value={c.icon} onChange={(icon) => setCap(i, { icon })} />
                  <div className="grid gap-2">
                    <Input className="bg-ink-900/60" value={c.label} onChange={(e) => setCap(i, { label: e.target.value })} placeholder="Capability title, e.g. Finance & Accounting" />
                    <Input className="bg-ink-900/60 text-[13px]" value={c.text} onChange={(e) => setCap(i, { text: e.target.value })} placeholder="One-line explanation" />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-8 text-red-500 hover:text-red-400"
                    aria-label={`Remove capability ${c.label || i + 1}`}
                    onClick={() => setForm((f) => ({ ...f, capabilities: f.capabilities.filter((_, idx) => idx !== i) }))}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <PublishedSwitch checked={form.published} onChange={(published) => setForm((f) => ({ ...f, published }))} />

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={save} disabled={saving}>
              {saving ? "Saving…" : editing ? "Save changes" : "Create product"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
