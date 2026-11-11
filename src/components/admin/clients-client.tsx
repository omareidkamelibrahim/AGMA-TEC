"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Blocks,
  Building2,
  Eye,
  EyeOff,
  Image as ImageIcon,
  Pencil,
  Plus,
  Quote,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageHeader } from "./ui";
import { PublishedSwitch } from "./website-bits";

/* ================= Logos ================= */

export type LogoRow = {
  id: string;
  name: string;
  kind: string;
  imageUrl: string;
  sortOrder: number;
  published: boolean;
};

type LogoForm = {
  name: string;
  kind: string;
  imageUrl: string;
  sortOrder: number;
  published: boolean;
};

const EMPTY_LOGO: LogoForm = {
  name: "",
  kind: "client",
  imageUrl: "",
  sortOrder: 10,
  published: true,
};

/* ================= Testimonials ================= */

export type TestimonialRow = {
  id: string;
  quote: string;
  name: string;
  org: string;
  initials: string;
  sortOrder: number;
  published: boolean;
};

type QuoteForm = {
  quote: string;
  name: string;
  org: string;
  initials: string;
  sortOrder: number;
  published: boolean;
};

const EMPTY_QUOTE: QuoteForm = {
  quote: "",
  name: "",
  org: "",
  initials: "",
  sortOrder: 10,
  published: true,
};

export function ClientsClient() {
  const qc = useQueryClient();

  /* ---------- logos state ---------- */
  const [logoOpen, setLogoOpen] = useState(false);
  const [logoEditing, setLogoEditing] = useState<LogoRow | null>(null);
  const [logoForm, setLogoForm] = useState<LogoForm>(EMPTY_LOGO);

  /* ---------- quotes state ---------- */
  const [quoteOpen, setQuoteOpen] = useState(false);
  const [quoteEditing, setQuoteEditing] = useState<TestimonialRow | null>(null);
  const [quoteForm, setQuoteForm] = useState<QuoteForm>(EMPTY_QUOTE);

  const logos = useQuery<{ rows: LogoRow[] }>({
    queryKey: ["admin-clients"],
    queryFn: async () => {
      const res = await fetch("/api/admin/clients");
      if (!res.ok) throw new Error("Failed to load logos");
      return res.json();
    },
  });

  const quotes = useQuery<{ rows: TestimonialRow[] }>({
    queryKey: ["admin-testimonials"],
    queryFn: async () => {
      const res = await fetch("/api/admin/testimonials");
      if (!res.ok) throw new Error("Failed to load testimonials");
      return res.json();
    },
  });

  const invalidate = (key: string) => qc.invalidateQueries({ queryKey: [key] });

  /* ---------- logo actions ---------- */
  const saveLogo = async () => {
    if (logoForm.name.trim().length < 2 || !logoForm.imageUrl.trim()) {
      toast.error("Client name and image path are required.");
      return;
    }
    try {
      const res = await fetch(
        logoEditing ? `/api/admin/clients/${logoEditing.id}` : "/api/admin/clients",
        {
          method: logoEditing ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...logoForm, name: logoForm.name.trim(), imageUrl: logoForm.imageUrl.trim() }),
        },
      );
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? "Request failed");
      toast.success(logoEditing ? "Logo updated." : "Logo added — it appears on the site once live.");
      setLogoOpen(false);
      invalidate("admin-clients");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Something went wrong");
    }
  };

  const removeLogo = async (row: LogoRow) => {
    if (!window.confirm(`Remove the ${row.name} logo?`)) return;
    const res = await fetch(`/api/admin/clients/${row.id}`, { method: "DELETE" });
    if (!res.ok) {
      toast.error("Failed to remove logo.");
      return;
    }
    toast.success("Logo removed.");
    invalidate("admin-clients");
  };

  const toggleLogo = async (row: LogoRow) => {
    const res = await fetch(`/api/admin/clients/${row.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ published: !row.published }),
    });
    if (!res.ok) {
      toast.error("Failed to update.");
      return;
    }
    toast.success(row.published ? "Logo hidden." : "Logo is live.");
    invalidate("admin-clients");
  };

  /* ---------- quote actions ---------- */
  const saveQuote = async () => {
    if (quoteForm.quote.trim().length < 20 || quoteForm.name.trim().length < 2 || quoteForm.org.trim().length < 2) {
      toast.error("Quote (20+ chars), role and organization are required.");
      return;
    }
    try {
      const res = await fetch(
        quoteEditing ? `/api/admin/testimonials/${quoteEditing.id}` : "/api/admin/testimonials",
        {
          method: quoteEditing ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            quote: quoteForm.quote.trim(),
            name: quoteForm.name.trim(),
            org: quoteForm.org.trim(),
            initials: (quoteForm.initials.trim() || quoteForm.name.trim().slice(0, 2)).toUpperCase(),
            sortOrder: Number(quoteForm.sortOrder) || 0,
            published: quoteForm.published,
          }),
        },
      );
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? "Request failed");
      toast.success(quoteEditing ? "Testimonial updated." : "Testimonial added.");
      setQuoteOpen(false);
      invalidate("admin-testimonials");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Something went wrong");
    }
  };

  const removeQuote = async (row: TestimonialRow) => {
    if (!window.confirm(`Remove the quote from "${row.name}, ${row.org}"?`)) return;
    const res = await fetch(`/api/admin/testimonials/${row.id}`, { method: "DELETE" });
    if (!res.ok) {
      toast.error("Failed to remove testimonial.");
      return;
    }
    toast.success("Testimonial removed.");
    invalidate("admin-testimonials");
  };

  const toggleQuote = async (row: TestimonialRow) => {
    const res = await fetch(`/api/admin/testimonials/${row.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ published: !row.published }),
    });
    if (!res.ok) {
      toast.error("Failed to update.");
      return;
    }
    toast.success(row.published ? "Testimonial hidden." : "Testimonial is live.");
    invalidate("admin-testimonials");
  };

  const logoRows = logos.data?.rows ?? [];
  const quoteRows = quotes.data?.rows ?? [];

  const LiveChip = ({ on }: { on: boolean }) =>
    on ? (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-500">
        <Eye className="size-3.5" /> Live
      </span>
    ) : (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-ink-800/60 px-2.5 py-1 text-[11px] font-semibold text-muted-foreground">
        <EyeOff className="size-3.5" /> Hidden
      </span>
    );

  return (
    <>
      <PageHeader
        title="Clients & Testimonials"
        description="Client/partner logos and client quotes shown on /clients and the homepage. Only publish logos confirmed by the company."
      />

      {/* ── Logos ─────────────────────────────────────────────── */}
      <section aria-label="Client and partner logos">
        <div className="flex items-center justify-between gap-4">
          <h2 className="font-display text-lg font-semibold text-foreground">Logos</h2>
          <Button
            className="gap-2"
            onClick={() => {
              setLogoEditing(null);
              setLogoForm({ ...EMPTY_LOGO, sortOrder: logoRows.length + 1 });
              setLogoOpen(true);
            }}
          >
            <Plus className="size-4" /> Add Logo
          </Button>
        </div>
        <div className="mt-3 overflow-hidden rounded-2xl border border-border bg-ink-850/85">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] text-sm">
              <thead>
                <tr className="border-b border-border/60 bg-ink-900/40">
                  {["Logo", "Group", "Order", "On site", "Actions"].map((h) => (
                    <th key={h} className="h-11 px-4 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {logos.isLoading ? (
                  <tr><td colSpan={5} className="px-4 py-10 text-center text-sm text-muted-foreground">Loading…</td></tr>
                ) : logoRows.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-10">
                      <p className="text-center text-sm text-muted-foreground">
                        No logos yet — the site shows the standard "references available on request" panel. Drop files into{" "}
                        <code className="rounded bg-ink-900 px-1.5 py-0.5 font-mono text-[12px] text-brand-accent">/public/clients/</code>{" "}
                        or <code className="rounded bg-ink-900 px-1.5 py-0.5 font-mono text-[12px] text-brand-accent">/public/partners/</code>, then add them here.
                      </p>
                    </td>
                  </tr>
                ) : (
                  logoRows.map((r) => (
                    <tr key={r.id} className="border-b border-border/40 transition-colors last:border-0 hover:bg-brand-500/[0.04]">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <img src={r.imageUrl} alt="" className="h-9 w-16 rounded-lg border border-border/70 bg-white/95 object-contain p-1" />
                          <div>
                            <p className="font-semibold text-foreground">{r.name}</p>
                            <p className="font-mono text-[11px] text-muted-foreground">{r.imageUrl}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-ink-800/60 px-2.5 py-1 text-[11px] font-semibold text-muted-foreground">
                          {r.kind === "partner" ? <Blocks className="size-3.5" /> : <Building2 className="size-3.5" />}
                          {r.kind === "partner" ? "Partner" : "Client"}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono text-[12px] text-muted-foreground">{r.sortOrder}</td>
                      <td className="px-4 py-3">
                        <button type="button" onClick={() => toggleLogo(r)} className="inline-flex" aria-label={r.published ? `Hide ${r.name}` : `Publish ${r.name}`}>
                          <LiveChip on={r.published} />
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8"
                            aria-label={`Edit ${r.name}`}
                            onClick={() => {
                              setLogoEditing(r);
                              setLogoForm({ name: r.name, kind: r.kind, imageUrl: r.imageUrl, sortOrder: r.sortOrder, published: r.published });
                              setLogoOpen(true);
                            }}
                          >
                            <Pencil className="size-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="size-8 text-red-500 hover:text-red-400" onClick={() => removeLogo(r)} aria-label={`Remove ${r.name}`}>
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
      </section>

      {/* ── Testimonials ──────────────────────────────────────── */}
      <section aria-label="Client testimonials" className="mt-10">
        <div className="flex items-center justify-between gap-4">
          <h2 className="font-display text-lg font-semibold text-foreground">Testimonials</h2>
          <Button
            className="gap-2"
            onClick={() => {
              setQuoteEditing(null);
              setQuoteForm({ ...EMPTY_QUOTE, sortOrder: quoteRows.length + 1 });
              setQuoteOpen(true);
            }}
          >
            <Plus className="size-4" /> Add Testimonial
          </Button>
        </div>
        <div className="mt-3 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {quotes.isLoading && (
            <p className="text-sm text-muted-foreground">Loading…</p>
          )}
          {!quotes.isLoading && quoteRows.length === 0 && (
            <p className="text-sm text-muted-foreground">No testimonials yet — add verified client quotes with their approval.</p>
          )}
          {quoteRows.map((r) => (
            <article key={r.id} className="card-lift relative flex h-full flex-col rounded-2xl border border-border bg-ink-850/85 p-6">
              <div className="flex items-start justify-between gap-3">
                <Quote className="size-6 text-brand-500/60" />
                <button
                  type="button"
                  onClick={() => toggleQuote(r)}
                  aria-label={r.published ? `Hide quote from ${r.name}` : `Publish quote from ${r.name}`}
                >
                  <LiveChip on={r.published} />
                </button>
              </div>
              <blockquote className="mt-4 flex-1 text-[13.5px] leading-relaxed text-foreground/85">
                “{r.quote.length > 180 ? `${r.quote.slice(0, 180)}…` : r.quote}”
              </blockquote>
              <div className="mt-5 flex items-center justify-between gap-3 border-t border-border/60 pt-4">
                <div className="flex items-center gap-3">
                  <span className="flex size-9 items-center justify-center rounded-full border border-brand-500/30 bg-brand-500/12 font-display text-[12px] font-bold text-brand-accent">
                    {r.initials}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-[13px] font-semibold text-foreground">{r.name}</p>
                    <p className="truncate text-[12px] text-muted-foreground">{r.org}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8"
                    aria-label={`Edit quote from ${r.name}`}
                    onClick={() => {
                      setQuoteEditing(r);
                      setQuoteForm({ quote: r.quote, name: r.name, org: r.org, initials: r.initials, sortOrder: r.sortOrder, published: r.published });
                      setQuoteOpen(true);
                    }}
                  >
                    <Pencil className="size-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="size-8 text-red-500 hover:text-red-400" onClick={() => removeQuote(r)} aria-label={`Remove quote from ${r.name}`}>
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ---- Logo dialog ---- */}
      <Dialog open={logoOpen} onOpenChange={setLogoOpen}>
        <DialogContent className="bg-ink-900 sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{logoEditing ? `Edit ${logoEditing.name}` : "Add a logo"}</DialogTitle>
            <DialogDescription>
              The image file must already exist in /public (e.g. /public/clients/acme.png → path /clients/acme.png).
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="l-name">Client / partner name</Label>
              <Input id="l-name" className="bg-ink-900/60" value={logoForm.name} onChange={(e) => setLogoForm((f) => ({ ...f, name: e.target.value }))} placeholder="Acme Industrial Group" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="l-kind">Group</Label>
                <Select value={logoForm.kind} onValueChange={(kind) => setLogoForm((f) => ({ ...f, kind }))}>
                  <SelectTrigger id="l-kind" className="w-full bg-ink-900/60"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-ink-900">
                    <SelectItem value="client">Client</SelectItem>
                    <SelectItem value="partner">Technology partner</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="l-order">Display order</Label>
                <Input id="l-order" type="number" min={0} className="bg-ink-900/60" value={logoForm.sortOrder} onChange={(e) => setLogoForm((f) => ({ ...f, sortOrder: Number(e.target.value) }))} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="l-url">Image path</Label>
              <Input id="l-url" className="bg-ink-900/60 font-mono text-[13px]" value={logoForm.imageUrl} onChange={(e) => setLogoForm((f) => ({ ...f, imageUrl: e.target.value }))} placeholder="/clients/acme.png" />
              {logoForm.imageUrl.trim() && (
                <div className="mt-2 flex items-center gap-3 rounded-xl border border-border/70 bg-ink-900/60 p-3">
                  <img src={logoForm.imageUrl} alt="Preview" className="h-10 w-20 rounded-lg border border-border/70 bg-white/95 object-contain p-1" />
                  <p className="flex items-center gap-1.5 text-[12px] text-muted-foreground">
                    <ImageIcon className="size-3.5" /> Preview — if broken, the file is not in /public.
                  </p>
                </div>
              )}
            </div>
          </div>
          <PublishedSwitch checked={logoForm.published} onChange={(published) => setLogoForm((f) => ({ ...f, published }))} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setLogoOpen(false)}>Cancel</Button>
            <Button onClick={saveLogo}>{logoEditing ? "Save changes" : "Add logo"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ---- Testimonial dialog ---- */}
      <Dialog open={quoteOpen} onOpenChange={setQuoteOpen}>
        <DialogContent className="bg-ink-900 sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>{quoteEditing ? `Edit quote from ${quoteEditing.name}` : "Add a testimonial"}</DialogTitle>
            <DialogDescription>
              Publish only approved quotes. Role + sector keep the quote anonymized (e.g. "Head of IT, Manufacturing group").
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="q-quote">Quote</Label>
              <Textarea id="q-quote" className="min-h-28 bg-ink-900/60" value={quoteForm.quote} onChange={(e) => setQuoteForm((f) => ({ ...f, quote: e.target.value }))} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="q-name">Role / title</Label>
                <Input id="q-name" className="bg-ink-900/60" value={quoteForm.name} onChange={(e) => setQuoteForm((f) => ({ ...f, name: e.target.value }))} placeholder="Head of IT" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="q-org">Sector / organization</Label>
                <Input id="q-org" className="bg-ink-900/60" value={quoteForm.org} onChange={(e) => setQuoteForm((f) => ({ ...f, org: e.target.value }))} placeholder="Manufacturing group" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="q-initials">Initials (auto if empty)</Label>
                <Input id="q-initials" className="bg-ink-900/60" maxLength={4} value={quoteForm.initials} onChange={(e) => setQuoteForm((f) => ({ ...f, initials: e.target.value }))} placeholder="HI" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="q-order">Display order</Label>
                <Input id="q-order" type="number" min={0} className="bg-ink-900/60" value={quoteForm.sortOrder} onChange={(e) => setQuoteForm((f) => ({ ...f, sortOrder: Number(e.target.value) }))} />
              </div>
            </div>
          </div>
          <PublishedSwitch checked={quoteForm.published} onChange={(published) => setQuoteForm((f) => ({ ...f, published }))} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setQuoteOpen(false)}>Cancel</Button>
            <Button onClick={saveQuote}>{quoteEditing ? "Save changes" : "Add testimonial"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
