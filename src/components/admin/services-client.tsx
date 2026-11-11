"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Eye,
  EyeOff,
  Globe,
  Pencil,
  Plus,
  Sparkles,
  Trash2,
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
import { iconFromName } from "@/lib/icon-map";
import { PageHeader, StatCard } from "./ui";
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

export function ServicesClient() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<ServiceRow | null>(null);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const { data, isLoading } = useQuery<{ rows: ServiceRow[] }>({
    queryKey: ["admin-services"],
    queryFn: async () => {
      const res = await fetch("/api/admin/services");
      if (!res.ok) throw new Error("Failed to load services");
      return res.json();
    },
  });
  const rows = data?.rows ?? [];

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
        actions={
          <Button className="gap-2" onClick={openCreate}>
            <Plus className="size-4" />
            New Service
          </Button>
        }
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

      <div className="mt-6 overflow-hidden rounded-2xl border border-border bg-ink-850/85">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead>
              <tr className="border-b border-border/60 bg-ink-900/40">
                {["Service", "Tags", "Order", "On site", "Actions"].map((h) => (
                  <th key={h} className="h-11 px-4 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={5} className="px-4 py-14 text-center text-sm text-muted-foreground">Loading services…</td></tr>
              ) : rows.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-14 text-center text-sm text-muted-foreground">No services yet — the site falls back to the built-in disciplines until one is created.</td></tr>
              ) : (
                rows.map((r) => {
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
                        <div className="flex items-center gap-1.5">
                          <Button variant="ghost" size="icon" className="size-8" onClick={() => openEdit(r)} aria-label={`Edit ${r.title}`}>
                            <Pencil className="size-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="size-8 text-red-500 hover:text-red-400" onClick={() => remove(r)} aria-label={`Delete ${r.title}`}>
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

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
