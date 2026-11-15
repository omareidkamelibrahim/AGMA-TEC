"use client";

import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Download,
  Eye,
  EyeOff,
  Globe,
  Pencil,
  Plus,
  Sparkles,
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
} from "./ui";
import { ImportDialog } from "./import-dialog";
import { IconSelect, PublishedSwitch } from "./website-bits";

export type ServiceRow = {
  id: string;
  title: string;
  text: string;
  icon: string;
  tagsJson: string;
  sortOrder: number;
  published: boolean;
};

type FormState = {
  title: string;
  text: string;
  icon: string;
  tags: string;
  sortOrder: number;
  published: boolean;
};

const EMPTY_FORM: FormState = {
  title: "",
  text: "",
  icon: "Code2",
  tags: "",
  sortOrder: 10,
  published: true,
};

const IMPORT_TEMPLATE = `Title,Description,Icon,Tags,Sort Order,Published
Custom Software Development,Bespoke web platforms and internal systems built to your workflows.,Code2,"Web platforms, APIs",10,yes
Cloud & DevOps,Cloud architecture, migration and automation for reliable operations.,Cloud,"Cloud, Migration",20,yes`;

export function ServicesClient() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<ServiceRow | null>(null);
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

  const { data, isLoading } = useQuery<{ rows: ServiceRow[] }>({
    queryKey: ["admin-services"],
    queryFn: async () => {
      const res = await fetch("/api/admin/services");
      if (!res.ok) throw new Error("Failed to load services");
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
      return `${r.title} ${r.text}`.toLowerCase().includes(q);
    });
    const dir = sort.dir === "asc" ? 1 : -1;
    return [...filtered].sort((a, b) =>
      String(a[sort.field as keyof ServiceRow] ?? "").localeCompare(
        String(b[sort.field as keyof ServiceRow] ?? ""),
      ) * dir,
    );
  }, [rows, search, filter, sort]);

  const openCreate = () => {
    setEditing(null);
    setForm({ ...EMPTY_FORM, sortOrder: rows.length + 1 });
    setOpen(true);
  };

  const openEdit = (row: ServiceRow) => {
    setEditing(row);
    setForm({
      title: row.title,
      text: row.text,
      icon: row.icon,
      tags: (() => {
        try {
          return (JSON.parse(row.tagsJson) ?? []).join(", ");
        } catch {
          return "";
        }
      })(),
      sortOrder: row.sortOrder,
      published: row.published,
    });
    setOpen(true);
  };

  const save = async () => {
    if (form.title.trim().length < 2 || form.text.trim().length < 10) {
      toast.error("Title and a description of at least 10 characters are required.");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        title: form.title.trim(),
        text: form.text.trim(),
        icon: form.icon,
        tags: form.tags.split(",").map((s) => s.trim()).filter(Boolean),
        sortOrder: Number(form.sortOrder) || 0,
        published: form.published,
      };
      const res = await fetch(
        editing ? `/api/admin/services/${editing.id}` : "/api/admin/services",
        {
          method: editing ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? "Request failed");
      toast.success(editing ? "Service updated — live on the site." : "Service created.");
      setOpen(false);
      qc.invalidateQueries({ queryKey: ["admin-services"] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  const togglePublished = async (row: ServiceRow) => {
    const res = await fetch(`/api/admin/services/${row.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ published: !row.published }),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => null);
      toast.error(body?.error ?? "Failed to update");
      return;
    }
    toast.success(row.published ? "Service hidden from the site." : "Service is live on the site.");
    qc.invalidateQueries({ queryKey: ["admin-services"] });
  };

  const remove = async (row: ServiceRow) => {
    if (!window.confirm(`Delete "${row.title}" from the website?`)) return;
    const res = await fetch(`/api/admin/services/${row.id}`, { method: "DELETE" });
    if (!res.ok) {
      toast.error("Failed to delete service.");
      return;
    }
    toast.success("Service deleted.");
    qc.invalidateQueries({ queryKey: ["admin-services"] });
  };

  const publishedCount = rows.filter((r) => r.published).length;

  return (
    <>
      <PageHeader
        title="Services"
        description="The six service disciplines shown on /services and the homepage."
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Services" value={rows.length} icon={Sparkles} tone="brand" />
        <StatCard label="Live on the site" value={publishedCount} icon={Globe} tone="success" />
        <StatCard
          label="Tags listed"
          value={rows.reduce((acc, r) => {
            try {
              return acc + (JSON.parse(r.tagsJson) ?? []).length;
            } catch {
              return acc;
            }
          }, 0)}
          icon={Plus}
          tone="neutral"
        />
      </div>

      {/* toolbar — search left, action pills right */}
      <div className="mt-6 flex flex-col gap-3 lg:flex-row lg:items-center">
        <ToolbarSearch
          value={search}
          onChange={setSearch}
          placeholder="Search service…"
          label="Search services"
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
          <ToolbarPill icon={Download} href="/api/admin/services/export" download>
            Export
          </ToolbarPill>
          <ToolbarPrimary icon={Plus} onClick={openCreate}>
            New service
          </ToolbarPrimary>
        </div>
      </div>

      <div className="mt-4 overflow-hidden rounded-2xl border border-border bg-ink-850/85">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead>
              <tr className="border-b border-border/60 bg-ink-900/40">
                <SortHeader label="Service" field="title" sort={sort.field} dir={sort.dir} onSort={onSort} />
                <th className="h-11 px-4 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                  Tags
                </th>
                <SortHeader label="Order" field="sortOrder" sort={sort.field} dir={sort.dir} onSort={onSort} />
                <SortHeader label="On site" field="published" sort={sort.field} dir={sort.dir} onSort={onSort} />
                <th className="h-11 w-14 px-4" aria-label="Actions" />
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={4} className="px-4 py-14 text-center text-sm text-muted-foreground">Loading services…</td></tr>
              ) : visible.length === 0 ? (
                <tr><td colSpan={4} className="px-4 py-14 text-center text-sm text-muted-foreground">No services match your search or filter.</td></tr>
              ) : (
                visible.map((r) => {
                  const Icon = iconFromName(r.icon);
                  const tags = (() => {
                    try {
                      return (JSON.parse(r.tagsJson) ?? []) as string[];
                    } catch {
                      return [];
                    }
                  })();
                  return (
                    <tr key={r.id} className="border-b border-border/40 transition-colors last:border-0 hover:bg-brand-500/[0.04]">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-brand-500/25 bg-brand-500/10 text-brand-accent">
                            <Icon className="size-5" />
                          </span>
                          <div className="min-w-0 max-w-sm">
                            <p className="font-semibold text-foreground">{r.title}</p>
                            <p className="truncate text-[12px] text-muted-foreground">{r.text}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex max-w-56 flex-wrap gap-1.5">
                          {tags.map((t) => (
                            <span key={t} className="rounded-full border border-border/80 bg-ink-800/70 px-2.5 py-0.5 text-[11px] text-foreground/60">
                              {t}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3 font-mono text-[12px] text-muted-foreground">{r.sortOrder}</td>
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={() => togglePublished(r)}
                          aria-label={r.published ? `Hide ${r.title} from the site` : `Publish ${r.title} to the site`}
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
                        <RowActions label={`Actions for ${r.title}`}>
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
        title="Import services"
        description="Upload a CSV with the same columns as the Export file. Existing titles are skipped."
        resource="services"
        template={IMPORT_TEMPLATE}
        onImported={() => qc.invalidateQueries({ queryKey: ["admin-services"] })}
      />

      {/* ---- Editor dialog ---- */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-ink-900 sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>{editing ? `Edit ${editing.title}` : "New service"}</DialogTitle>
            <DialogDescription>
              Services appear as discipline cards on /services and the homepage.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="s-title">Title</Label>
              <Input id="s-title" className="bg-ink-900/60" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="Custom Software Development" />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="s-text">Description</Label>
              <Textarea id="s-text" className="min-h-24 bg-ink-900/60" value={form.text} onChange={(e) => setForm((f) => ({ ...f, text: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="s-icon">Icon</Label>
              <IconSelect id="s-icon" value={form.icon} onChange={(icon) => setForm((f) => ({ ...f, icon }))} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="s-order">Display order</Label>
              <Input id="s-order" type="number" min={0} className="bg-ink-900/60" value={form.sortOrder} onChange={(e) => setForm((f) => ({ ...f, sortOrder: Number(e.target.value) }))} />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="s-tags">Tags — comma separated</Label>
              <Input id="s-tags" className="bg-ink-900/60" value={form.tags} onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))} placeholder="Web platforms, System integration, APIs" />
            </div>
          </div>

          <PublishedSwitch checked={form.published} onChange={(published) => setForm((f) => ({ ...f, published }))} />

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={save} disabled={saving}>
              {saving ? "Saving…" : editing ? "Save changes" : "Create service"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
