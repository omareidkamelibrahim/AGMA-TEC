"use client";

/**
 * Dashboard → Website → Footer.
 * Products-page architecture: stat cards → toolbar → tables → dialogs.
 * Link columns and socials are managed as tables with add/edit dialogs;
 * the brand paragraph, newsletter blurb, copyright and legal links keep
 * a compact form card. Every dialog saves instantly (no save bar).
 */

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  ArrowDown,
  ArrowUp,
  LayoutGrid,
  Link2,
  Pencil,
  Plus,
  Share2,
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
import { Field, LinkListEditor, isDirty, useSaveSiteConfig, useSiteConfig } from "./site-editor";
import { SOCIAL_ICONS, type FooterConfig, type NavLink } from "@/lib/site-config";

type ColumnForm = { title: string; links: NavLink[] };
type SocialForm = { icon: string; label: string; href: string };

export function WebsiteFooterClient() {
  const { data, isLoading } = useSiteConfig();
  const save = useSaveSiteConfig();
  const [state, setState] = useState<FooterConfig | null>(null);

  /* tables + dialogs state */
  const [search, setSearch] = useState("");
  const [colOpen, setColOpen] = useState(false);
  const [colEditing, setColEditing] = useState<number | null>(null);
  const [colForm, setColForm] = useState<ColumnForm>({ title: "", links: [] });
  const [socOpen, setSocOpen] = useState(false);
  const [socEditing, setSocEditing] = useState<number | null>(null);
  const [socForm, setSocForm] = useState<SocialForm>({ icon: "linkedin", label: "", href: "" });

  useEffect(() => {
    if (data) setState(data.footer);
  }, [data]);

  const columns = state?.columns ?? [];
  const socials = state?.socials ?? [];

  const q = search.trim().toLowerCase();
  const visibleColumns = useMemo(
    () => (q ? columns.filter((c) => c.title.toLowerCase().includes(q)) : columns),
    [columns, q],
  );
  const visibleSocials = useMemo(
    () => (q ? socials.filter((s) => s.label.toLowerCase().includes(q) || s.href.toLowerCase().includes(q)) : socials),
    [socials, q],
  );

  if (isLoading || !state) {
    return <p className="text-sm text-muted-foreground">Loading site settings…</p>;
  }

  const persist = async (next: FooterConfig, okMsg?: string) => {
    setState(next);
    await save("footer", next, okMsg);
  };

  /* ---- link columns ---- */
  const openColCreate = () => {
    setColEditing(null);
    setColForm({ title: "", links: [{ label: "", href: "" }] });
    setColOpen(true);
  };

  const openColEdit = (i: number) => {
    setColEditing(i);
    setColForm({ title: columns[i].title, links: columns[i].links.map((l) => ({ ...l })) });
    setColOpen(true);
  };

  const saveColumn = async () => {
    if (colForm.title.trim().length < 2) {
      toast.error("Column title (2+ chars) is required.");
      return;
    }
    const next = [...columns];
    const col = { title: colForm.title.trim(), links: colForm.links };
    if (colEditing === null) next.push(col);
    else next[colEditing] = col;
    setColOpen(false);
    await persist(
      { ...state, columns: next },
      colEditing === null ? "Column added — live on the website." : "Column updated — live on the website.",
    );
  };

  const removeColumn = async (i: number) => {
    if (!window.confirm(`Remove the "${columns[i].title}" column and its ${columns[i].links.length} links?`)) return;
    await persist({ ...state, columns: columns.filter((_, j) => j !== i) }, "Column removed.");
  };

  const moveColumn = async (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= columns.length) return;
    const next = [...columns];
    [next[i], next[j]] = [next[j], next[i]];
    await persist({ ...state, columns: next });
  };

  /* ---- socials ---- */
  const openSocCreate = () => {
    setSocEditing(null);
    setSocForm({ icon: "linkedin", label: "", href: "" });
    setSocOpen(true);
  };

  const openSocEdit = (i: number) => {
    setSocEditing(i);
    setSocForm({ ...socials[i] });
    setSocOpen(true);
  };

  const saveSocial = async () => {
    if (!socForm.label.trim() || !socForm.href.trim()) {
      toast.error("Label and URL are required.");
      return;
    }
    const next = [...socials];
    const social = { ...socForm, label: socForm.label.trim(), href: socForm.href.trim() };
    if (socEditing === null) next.push(social);
    else next[socEditing] = social;
    setSocOpen(false);
    await persist(
      { ...state, socials: next },
      socEditing === null ? "Social link added — live on the website." : "Social link updated — live on the website.",
    );
  };

  const removeSocial = async (i: number) => {
    if (!window.confirm(`Remove the "${socials[i].label || socials[i].icon}" social link?`)) return;
    await persist({ ...state, socials: socials.filter((_, j) => j !== i) }, "Social link removed.");
  };

  /* ---- brand & bottom bar card ---- */
  const bottom = {
    about: state.about,
    newsletterBlurb: state.newsletterBlurb,
    copyright: state.copyright,
    legalLinks: state.legalLinks,
  };
  const savedBottom = data?.footer && {
    about: data.footer.about,
    newsletterBlurb: data.footer.newsletterBlurb,
    copyright: data.footer.copyright,
    legalLinks: data.footer.legalLinks,
  };
  const bottomDirty = isDirty(bottom, savedBottom);

  const saveBottom = async () => {
    if (!state.copyright.trim()) {
      toast.error("Copyright line is required.");
      return;
    }
    await persist({ ...state, ...bottom }, "Footer bottom bar saved — live on the website.");
  };

  return (
    <>
      <PageHeader
        title="Footer"
        description="Everything below the divider on the website: brand text, link columns, socials, newsletter blurb and the bottom bar."
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Footer columns" value={columns.length} icon={LayoutGrid} tone="brand" />
        <StatCard
          label="Links in columns"
          value={columns.reduce((acc, c) => acc + c.links.length, 0)}
          icon={Link2}
          tone="success"
        />
        <StatCard label="Social links" value={socials.length} icon={Share2} tone="neutral" />
      </div>

      {/* toolbar — search left, action pills right */}
      <div className="mt-6 flex flex-col gap-3 lg:flex-row lg:items-center">
        <ToolbarSearch
          value={search}
          onChange={setSearch}
          placeholder="Search columns or socials…"
          label="Search footer content"
        />
        <div className="flex flex-wrap items-center gap-2.5 lg:justify-end">
          <ToolbarPrimary icon={Plus} onClick={openColCreate}>
            Add column
          </ToolbarPrimary>
        </div>
      </div>

      <div className="mt-4 overflow-hidden rounded-2xl border border-border bg-ink-850/85">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-sm">
            <thead>
              <tr className="border-b border-border/60 bg-ink-900/40">
                <th className="h-11 w-14 pl-5 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">#</th>
                <th className="h-11 px-4 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Column</th>
                <th className="h-11 px-4 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Links</th>
                <th className="h-11 w-14 px-4" aria-label="Actions" />
              </tr>
            </thead>
            <tbody>
              {columns.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-10">
                    <p className="text-center text-sm text-muted-foreground">
                      No footer columns yet — click “Add column” to create the first one.
                    </p>
                  </td>
                </tr>
              ) : visibleColumns.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-10">
                    <p className="text-center text-sm text-muted-foreground">No columns match your search.</p>
                  </td>
                </tr>
              ) : (
                visibleColumns.map((c) => {
                  const i = columns.indexOf(c);
                  return (
                    <tr key={`${c.title}-${i}`} className="border-b border-border/40 transition-colors last:border-0 hover:bg-brand-500/[0.04]">
                      <td className="pl-5 pr-1 font-mono text-[12px] text-muted-foreground">{i + 1}</td>
                      <td className="px-4 py-3 font-semibold text-foreground">{c.title}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1.5">
                          {c.links.map((l, li) => (
                            <span key={li} className="rounded-full border border-border bg-ink-800/60 px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
                              {l.label || <span className="italic opacity-60">untitled</span>}
                            </span>
                          ))}
                          {c.links.length === 0 && <span className="text-[12px] text-muted-foreground">—</span>}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <RowActions label={`Actions for ${c.title}`}>
                          <DropdownMenuItem onClick={() => openColEdit(i)} className="gap-2">
                            <Pencil className="size-4" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => moveColumn(i, -1)} disabled={i === 0} className="gap-2">
                            <ArrowUp className="size-4" /> Move up
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => moveColumn(i, 1)} disabled={i === columns.length - 1} className="gap-2">
                            <ArrowDown className="size-4" /> Move down
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="bg-border/60" />
                          <DropdownMenuItem
                            onClick={() => removeColumn(i)}
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

      {/* ── Social links ───────────────────────────────────────── */}
      <section aria-label="Social links" className="mt-10">
        <div className="flex items-center justify-between gap-4">
          <h2 className="font-display text-lg font-semibold text-foreground">Social links</h2>
          <Button
            className="gap-2"
            disabled={socials.length >= 6}
            onClick={openSocCreate}
          >
            <Plus className="size-4" /> Add social
          </Button>
        </div>
        <div className="mt-3 overflow-hidden rounded-2xl border border-border bg-ink-850/85">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] text-sm">
              <thead>
                <tr className="border-b border-border/60 bg-ink-900/40">
                  <th className="h-11 w-14 pl-5 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">#</th>
                  <th className="h-11 px-4 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Icon</th>
                  <th className="h-11 px-4 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Label</th>
                  <th className="h-11 px-4 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">URL</th>
                  <th className="h-11 w-14 px-4" aria-label="Actions" />
                </tr>
              </thead>
              <tbody>
                {socials.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-10">
                      <p className="text-center text-sm text-muted-foreground">No social links yet — add the first one above.</p>
                    </td>
                  </tr>
                ) : visibleSocials.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-10">
                      <p className="text-center text-sm text-muted-foreground">No social links match your search.</p>
                    </td>
                  </tr>
                ) : (
                  visibleSocials.map((s) => {
                    const i = socials.indexOf(s);
                    return (
                      <tr key={`${s.icon}-${s.href}-${i}`} className="border-b border-border/40 transition-colors last:border-0 hover:bg-brand-500/[0.04]">
                        <td className="pl-5 pr-1 font-mono text-[12px] text-muted-foreground">{i + 1}</td>
                        <td className="px-4 py-3">
                          <span className="rounded-full border border-border bg-ink-800/60 px-2.5 py-1 text-[11px] font-semibold text-muted-foreground">{s.icon}</span>
                        </td>
                        <td className="px-4 py-3 font-semibold text-foreground">{s.label || <span className="italic opacity-60">untitled</span>}</td>
                        <td className="px-4 py-3 font-mono text-[12px] text-muted-foreground">{s.href}</td>
                        <td className="px-4 py-3">
                          <RowActions label={`Actions for ${s.label || s.icon}`}>
                            <DropdownMenuItem onClick={() => openSocEdit(i)} className="gap-2">
                              <Pencil className="size-4" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-border/60" />
                            <DropdownMenuItem
                              onClick={() => removeSocial(i)}
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
      </section>

      {/* ── Brand & bottom bar ─────────────────────────────────── */}
      <section aria-label="Brand and bottom bar" className="mt-10">
        <h2 className="font-display text-lg font-semibold text-foreground">Brand & bottom bar</h2>
        <div className="mt-3 flex flex-col gap-6 rounded-2xl border border-border bg-ink-850/85 p-6 sm:p-8">
          <Field
            label="Brand paragraph"
            value={state.about}
            onChange={(about) => setState({ ...state, about })}
            textarea
            rows={4}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Newsletter blurb"
              value={state.newsletterBlurb}
              onChange={(newsletterBlurb) => setState({ ...state, newsletterBlurb })}
              textarea
              rows={2}
            />
            <Field
              label="Copyright line"
              value={state.copyright}
              onChange={(copyright) => setState({ ...state, copyright })}
              hint="{year} is replaced with the current year."
            />
          </div>
          <LinkListEditor
            label="Bottom-right legal links"
            links={state.legalLinks}
            onChange={(legalLinks) => setState({ ...state, legalLinks })}
            max={4}
          />
          <div className="flex justify-end">
            <Button onClick={saveBottom} disabled={!bottomDirty} className={bottomDirty ? "" : "opacity-50"}>
              Save changes
            </Button>
          </div>
        </div>
      </section>

      {/* ---- Column dialog ---- */}
      <Dialog open={colOpen} onOpenChange={setColOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto bg-ink-900 sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{colEditing === null ? "Add a footer column" : `Edit ${columns[colEditing]?.title ?? "column"}`}</DialogTitle>
            <DialogDescription>
              Columns render left-to-right in the order shown above.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <Field label="Column title" value={colForm.title} onChange={(title) => setColForm((f) => ({ ...f, title }))} placeholder="Company" />
            <LinkListEditor
              label="Links"
              links={colForm.links}
              onChange={(links) => setColForm((f) => ({ ...f, links }))}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setColOpen(false)}>Cancel</Button>
            <Button onClick={saveColumn}>{colEditing === null ? "Add column" : "Save changes"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ---- Social dialog ---- */}
      <Dialog open={socOpen} onOpenChange={setSocOpen}>
        <DialogContent className="bg-ink-900 sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{socEditing === null ? "Add a social link" : "Edit social link"}</DialogTitle>
            <DialogDescription>
              Shown as icon buttons in the footer brand row.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <label className="block">
              <span className="text-[12px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">Icon</span>
              <select
                value={socForm.icon}
                onChange={(e) => setSocForm((f) => ({ ...f, icon: e.target.value }))}
                aria-label="Social icon"
                className="mt-1.5 h-10 w-full rounded-xl border border-border bg-ink-900/60 px-2.5 text-[13px] text-foreground outline-none focus:border-brand-500/50"
              >
                {SOCIAL_ICONS.map((name) => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>
            </label>
            <Field label="Label" value={socForm.label} onChange={(label) => setSocForm((f) => ({ ...f, label }))} placeholder="LinkedIn" />
            <Field label="URL" value={socForm.href} onChange={(href) => setSocForm((f) => ({ ...f, href }))} placeholder="https://…" />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSocOpen(false)}>Cancel</Button>
            <Button onClick={saveSocial}>{socEditing === null ? "Add social" : "Save changes"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
