"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Eye, EyeOff, Globe, MessageSquareQuote, Pencil, Plus, Quote, Trash2 } from "lucide-react";
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
import { PageHeader, StatCard } from "./ui";
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

export function TestimonialsClient() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<TestimonialRow | null>(null);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const { data, isLoading } = useQuery<{ rows: TestimonialRow[] }>({
    queryKey: ["admin-testimonials"],
    queryFn: async () => {
      const res = await fetch("/api/admin/testimonials");
      if (!res.ok) throw new Error("Failed to load testimonials");
      return res.json();
    },
  });
  const rows = data?.rows ?? [];

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
        actions={
          <Button className="gap-2" onClick={openCreate}>
            <Plus className="size-4" />
            New Testimonial
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Testimonials" value={rows.length} icon={MessageSquareQuote} tone="brand" />
        <StatCard label="Live on the site" value={publishedCount} icon={Globe} tone="success" />
        <StatCard label="Hidden" value={rows.length - publishedCount} icon={EyeOff} tone="neutral" />
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-border bg-ink-850/85">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead>
              <tr className="border-b border-border/60 bg-ink-900/40">
                {["Quote", "Attribution", "Sector", "Order", "On site", "Actions"].map((h) => (
                  <th key={h} className="h-11 px-4 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={6} className="px-4 py-14 text-center text-sm text-muted-foreground">Loading testimonials…</td></tr>
              ) : rows.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-14 text-center text-sm text-muted-foreground">No testimonials yet — the site falls back to the built-in quotes until one is created.</td></tr>
              ) : (
                rows.map((r) => (
                  <tr key={r.id} className="border-b border-border/40 transition-colors last:border-0 hover:bg-brand-500/[0.04]">
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
                      <div className="flex items-center gap-1.5">
                        <Button variant="ghost" size="icon" className="size-8" onClick={() => openEdit(r)} aria-label={`Edit quote from ${r.name}`}>
                          <Pencil className="size-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="size-8 text-red-500 hover:text-red-400" onClick={() => remove(r)} aria-label={`Delete quote from ${r.name}`}>
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

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
