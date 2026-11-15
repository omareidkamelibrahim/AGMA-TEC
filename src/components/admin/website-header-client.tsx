"use client";

/**
 * Dashboard → Website → Header & Navigation.
 * Products-page architecture: stat cards → toolbar → table → dialogs,
 * every change saved to the site config immediately (no save bar).
 */

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  ArrowDown,
  ArrowUp,
  Link2,
  Menu,
  MousePointerClick,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
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
  PageHeader,
  RowActions,
  StatCard,
  ToolbarPrimary,
  ToolbarSearch,
} from "./ui";
import { Field, isDirty, useSaveSiteConfig, useSiteConfig } from "./site-editor";
import type { HeaderConfig, NavLink } from "@/lib/site-config";

export function WebsiteHeaderClient() {
  const { data, isLoading } = useSiteConfig();
  const save = useSaveSiteConfig();
  const [state, setState] = useState<HeaderConfig | null>(null);

  /* links table state */
  const [search, setSearch] = useState("");
  const [linkOpen, setLinkOpen] = useState(false);
  const [linkEditing, setLinkEditing] = useState<number | null>(null);
  const [linkForm, setLinkForm] = useState<NavLink>({ label: "", href: "" });

  useEffect(() => {
    if (data) setState(data.header);
  }, [data]);

  const links = state?.links ?? [];

  const visibleLinks = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return links;
    return links.filter(
      (l) => l.label.toLowerCase().includes(q) || l.href.toLowerCase().includes(q),
    );
  }, [links, search]);

  if (isLoading || !state) {
    return <p className="text-sm text-muted-foreground">Loading site settings…</p>;
  }

  const persist = async (next: HeaderConfig, okMsg?: string) => {
    setState(next);
    await save("header", next, okMsg);
  };

  const openCreate = () => {
    setLinkEditing(null);
    setLinkForm({ label: "", href: "" });
    setLinkOpen(true);
  };

  const openEdit = (i: number) => {
    setLinkEditing(i);
    setLinkForm({ ...links[i] });
    setLinkOpen(true);
  };

  const saveLink = async () => {
    if (linkForm.label.trim().length < 2 || !linkForm.href.trim()) {
      toast.error("Label (2+ chars) and URL are required.");
      return;
    }
    const next = [...links];
    const link = { label: linkForm.label.trim(), href: linkForm.href.trim() };
    if (linkEditing === null) next.push(link);
    else next[linkEditing] = link;
    setLinkOpen(false);
    await persist(
      { ...state, links: next },
      linkEditing === null ? "Link added — live on the website." : "Link updated — live on the website.",
    );
  };

  const removeLink = async (i: number) => {
    if (!window.confirm(`Remove the "${links[i].label}" link from the navigation?`)) return;
    await persist({ ...state, links: links.filter((_, j) => j !== i) }, "Link removed.");
  };

  const moveLink = async (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= links.length) return;
    const next = [...links];
    [next[i], next[j]] = [next[j], next[i]];
    await persist({ ...state, links: next });
  };

  const ctaDirty = isDirty(state.cta, data?.cta);

  const saveCta = async () => {
    if (!state.cta.label.trim() || !state.cta.href.trim()) {
      toast.error("Button label and link are required.");
      return;
    }
    await persist({ ...state, cta: { ...state.cta } }, "CTA button saved — live on the website.");
  };

  return (
    <>
      <PageHeader
        title="Header & Navigation"
        description="The logo bar links and the call-to-action button shown on every page of the website."
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Navigation links" value={links.length} icon={Menu} tone="brand" />
        <StatCard
          label="CTA button"
          value={state.cta.label.trim() ? "On" : "Off"}
          icon={MousePointerClick}
          tone={state.cta.label.trim() ? "success" : "neutral"}
        />
        <StatCard label="CTA links to" value={state.cta.href || "—"} icon={Link2} tone="neutral" />
      </div>

      {/* toolbar — search left, action pills right */}
      <div className="mt-6 flex flex-col gap-3 lg:flex-row lg:items-center">
        <ToolbarSearch
          value={search}
          onChange={setSearch}
          placeholder="Search links…"
          label="Search navigation links"
        />
        <div className="flex flex-wrap items-center gap-2.5 lg:justify-end">
          <ToolbarPrimary icon={Plus} onClick={openCreate}>
            Add link
          </ToolbarPrimary>
        </div>
      </div>

      <div className="mt-4 overflow-hidden rounded-2xl border border-border bg-ink-850/85">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-sm">
            <thead>
              <tr className="border-b border-border/60 bg-ink-900/40">
                <th className="h-11 w-14 pl-5 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">#</th>
                <th className="h-11 px-4 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Label</th>
                <th className="h-11 px-4 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">URL</th>
                <th className="h-11 w-14 px-4" aria-label="Actions" />
              </tr>
            </thead>
            <tbody>
              {links.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-10">
                    <p className="text-center text-sm text-muted-foreground">
                      No navigation links yet — click “Add link” to create the first one.
                    </p>
                  </td>
                </tr>
              ) : visibleLinks.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-10">
                    <p className="text-center text-sm text-muted-foreground">No links match your search.</p>
                  </td>
                </tr>
              ) : (
                visibleLinks.map((l) => {
                  const i = links.indexOf(l);
                  return (
                    <tr key={`${l.label}-${l.href}-${i}`} className="border-b border-border/40 transition-colors last:border-0 hover:bg-brand-500/[0.04]">
                      <td className="pl-5 pr-1 font-mono text-[12px] text-muted-foreground">{i + 1}</td>
                      <td className="px-4 py-3 font-semibold text-foreground">{l.label}</td>
                      <td className="px-4 py-3 font-mono text-[12px] text-muted-foreground">{l.href}</td>
                      <td className="px-4 py-3">
                        <RowActions label={`Actions for ${l.label}`}>
                          <DropdownMenuItem onClick={() => openEdit(i)} className="gap-2">
                            <Pencil className="size-4" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => moveLink(i, -1)} disabled={i === 0} className="gap-2">
                            <ArrowUp className="size-4" /> Move up
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => moveLink(i, 1)} disabled={i === links.length - 1} className="gap-2">
                            <ArrowDown className="size-4" /> Move down
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="bg-border/60" />
                          <DropdownMenuItem
                            onClick={() => removeLink(i)}
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

      {/* ── CTA button ──────────────────────────────────────────── */}
      <section aria-label="Call-to-action button" className="mt-10">
        <h2 className="font-display text-lg font-semibold text-foreground">Call-to-action button</h2>
        <div className="mt-3 flex flex-col gap-4 rounded-2xl border border-border bg-ink-850/85 p-6 sm:p-8">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Button label"
              value={state.cta.label}
              onChange={(label) => setState({ ...state, cta: { ...state.cta, label } })}
            />
            <Field
              label="Button link"
              value={state.cta.href}
              onChange={(href) => setState({ ...state, cta: { ...state.cta, href } })}
              placeholder="/contact"
            />
          </div>
          <div className="flex justify-end">
            <Button onClick={saveCta} disabled={!ctaDirty} className={ctaDirty ? "" : "opacity-50"}>
              Save changes
            </Button>
          </div>
        </div>
      </section>

      {/* ---- Link dialog ---- */}
      <Dialog open={linkOpen} onOpenChange={setLinkOpen}>
        <DialogContent className="bg-ink-900 sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{linkEditing === null ? "Add a navigation link" : `Edit ${links[linkEditing]?.label ?? "link"}`}</DialogTitle>
            <DialogDescription>
              Links appear in the logo bar on every page of the website, in the order shown above.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <Field label="Label" value={linkForm.label} onChange={(label) => setLinkForm((f) => ({ ...f, label }))} placeholder="Our Products" />
            <Field label="URL" value={linkForm.href} onChange={(href) => setLinkForm((f) => ({ ...f, href }))} placeholder="/products" />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLinkOpen(false)}>Cancel</Button>
            <Button onClick={saveLink}>{linkEditing === null ? "Add link" : "Save changes"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
