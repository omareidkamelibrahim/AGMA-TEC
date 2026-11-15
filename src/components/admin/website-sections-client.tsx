"use client";

/**
 * Dashboard → Website → Home Sections.
 * Products-page architecture: stat cards → toolbar → table → dialogs.
 * The table manages section order + visibility; the Hero / About / CTA
 * copy each open in an edit dialog. Every change saves instantly.
 */

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  ArrowDown,
  ArrowUp,
  Eye,
  EyeOff,
  LayoutTemplate,
  Pencil,
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
  ToolbarPill,
  ToolbarSearch,
} from "./ui";
import { Field, useSaveSiteConfig, useSiteConfig } from "./site-editor";
import {
  PILLAR_ICONS,
  type AboutConfig,
  type CtaConfig,
  type HeroConfig,
  type SectionHeadingCfg,
  type SectionsConfig,
} from "@/lib/site-config";

const SECTION_LABELS: Record<string, string> = {
  hero: "Hero banner",
  about: "About",
  products: "Products",
  clients: "Clients & Partners",
  testimonials: "Testimonials",
  team: "Team",
  cta: "Call-to-action band",
};
const HAS_HEADING = new Set(["products", "clients", "testimonials", "team"]);

export function WebsiteSectionsClient() {
  const { data, isLoading } = useSiteConfig();
  const save = useSaveSiteConfig();
  const [hero, setHero] = useState<HeroConfig | null>(null);
  const [about, setAbout] = useState<AboutConfig | null>(null);
  const [cta, setCta] = useState<CtaConfig | null>(null);
  const [sections, setSections] = useState<SectionsConfig | null>(null);

  /* table + dialog state */
  const [search, setSearch] = useState("");
  const [headingKey, setHeadingKey] = useState<string | null>(null);
  const [headingForm, setHeadingForm] = useState<SectionHeadingCfg>({ eyebrow: "", title: "", titleAccent: "", description: "" });
  const [copyDialog, setCopyDialog] = useState<"hero" | "about" | "cta" | null>(null);

  useEffect(() => {
    if (data) {
      setHero(data.hero);
      setAbout(data.about);
      setCta(data.cta);
      setSections(data.sections);
    }
  }, [data]);

  const order = sections?.order ?? [];

  const visibleSections = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return order;
    return order.filter((k) => (SECTION_LABELS[k] ?? k).toLowerCase().includes(q));
  }, [order, search]);

  if (isLoading || !hero || !about || !cta || !sections) {
    return <p className="text-sm text-muted-foreground">Loading site settings…</p>;
  }

  const isVisible = (key: string) => sections.visible[key] !== false;

  const persistSections = async (next: SectionsConfig, okMsg = "Saved — the website updates immediately.") => {
    setSections(next);
    await save("sections", next, okMsg);
  };

  const moveSection = async (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= order.length) return;
    const next = [...order];
    [next[i], next[j]] = [next[j], next[i]];
    await persistSections({ ...sections, order: next as SectionsConfig["order"] });
  };

  const toggleVisible = async (key: string) => {
    const visible = isVisible(key);
    await persistSections(
      { ...sections, visible: { ...sections.visible, [key]: !visible } },
      visible ? "Section hidden from the website." : "Section is live on the website.",
    );
  };

  const openHeading = (key: string) => {
    setHeadingKey(key);
    setHeadingForm({ ...sections.headings[key]! });
  };

  const saveHeading = async () => {
    if (!headingKey) return;
    if (headingForm.title.trim().length < 2) {
      toast.error("Section title (2+ chars) is required.");
      return;
    }
    await persistSections(
      { ...sections, headings: { ...sections.headings, [headingKey]: headingForm } },
      "Section heading saved.",
    );
    setHeadingKey(null);
  };

  /* ---- hero / about / cta copy dialogs ---- */
  const saveCopy = async () => {
    if (copyDialog === "hero") {
      if (hero.title.trim().length < 2) {
        toast.error("Hero title is required.");
        return;
      }
      setCopyDialog(null);
      await save("hero", hero, "Hero banner saved.");
    } else if (copyDialog === "about") {
      if (about.title.trim().length < 2) {
        toast.error("About title is required.");
        return;
      }
      setCopyDialog(null);
      await save("about", about, "About section saved.");
    } else if (copyDialog === "cta") {
      if (cta.title.trim().length < 2) {
        toast.error("CTA title is required.");
        return;
      }
      setCopyDialog(null);
      await save("cta", cta, "Call-to-action band saved.");
    }
  };

  const chip = (on: boolean) =>
    on ? (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-500">
        <Eye className="size-3.5" /> Visible
      </span>
    ) : (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-ink-800/60 px-2.5 py-1 text-[11px] font-semibold text-muted-foreground">
        <EyeOff className="size-3.5" /> Hidden
      </span>
    );

  return (
    <>
      <PageHeader
        title="Home Sections"
        description="Hero, About and CTA copy, plus which sections appear on the home page and in what order."
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Home sections" value={order.length} icon={LayoutTemplate} tone="brand" />
        <StatCard
          label="Visible on the site"
          value={order.filter((k) => isVisible(k)).length}
          icon={Eye}
          tone="success"
        />
        <StatCard
          label="Hidden"
          value={order.filter((k) => !isVisible(k)).length}
          icon={EyeOff}
          tone="neutral"
        />
      </div>

      {/* toolbar — search */}
      <div className="mt-6 flex flex-col gap-3 lg:flex-row lg:items-center">
        <ToolbarSearch
          value={search}
          onChange={setSearch}
          placeholder="Search sections…"
          label="Search home sections"
        />
      </div>

      <div className="mt-4 overflow-hidden rounded-2xl border border-border bg-ink-850/85">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-border/60 bg-ink-900/40">
                <th className="h-11 w-14 pl-5 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">#</th>
                <th className="h-11 px-4 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Section</th>
                <th className="h-11 px-4 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">On site</th>
                <th className="h-11 w-28 px-4 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Order</th>
                <th className="h-11 w-14 px-4" aria-label="Actions" />
              </tr>
            </thead>
            <tbody>
              {order.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-10">
                    <p className="text-center text-sm text-muted-foreground">No sections configured.</p>
                  </td>
                </tr>
              ) : visibleSections.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-10">
                    <p className="text-center text-sm text-muted-foreground">No sections match your search.</p>
                  </td>
                </tr>
              ) : (
                visibleSections.map((key) => {
                  const i = order.indexOf(key);
                  const heading = sections.headings[key];
                  return (
                    <tr key={key} className="border-b border-border/40 transition-colors last:border-0 hover:bg-brand-500/[0.04]">
                      <td className="pl-5 pr-1 font-mono text-[12px] text-muted-foreground">{i + 1}</td>
                      <td className="px-4 py-3 font-semibold text-foreground">{SECTION_LABELS[key] ?? key}</td>
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={() => toggleVisible(key)}
                          className="inline-flex"
                          aria-label={isVisible(key) ? `Hide ${SECTION_LABELS[key] ?? key}` : `Show ${SECTION_LABELS[key] ?? key}`}
                        >
                          {chip(isVisible(key))}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => moveSection(i, -1)}
                            disabled={i === 0}
                            aria-label="Move up"
                            className="flex size-8 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:text-foreground disabled:opacity-30"
                          >
                            <ArrowUp className="size-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => moveSection(i, 1)}
                            disabled={i === order.length - 1}
                            aria-label="Move down"
                            className="flex size-8 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:text-foreground disabled:opacity-30"
                          >
                            <ArrowDown className="size-3.5" />
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <RowActions label={`Actions for ${SECTION_LABELS[key] ?? key}`}>
                          {HAS_HEADING.has(key) && heading && (
                            <DropdownMenuItem onClick={() => openHeading(key)} className="gap-2">
                              <Pencil className="size-4" /> Edit heading
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem onClick={() => toggleVisible(key)} className="gap-2">
                            {isVisible(key) ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                            {isVisible(key) ? "Hide from site" : "Publish to site"}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="bg-border/60" />
                          <DropdownMenuItem onClick={() => moveSection(i, -1)} disabled={i === 0} className="gap-2">
                            <ArrowUp className="size-4" /> Move up
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => moveSection(i, 1)} disabled={i === order.length - 1} className="gap-2">
                            <ArrowDown className="size-4" /> Move down
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

      {/* ── Hero banner ────────────────────────────────────────── */}
      <CopySection
        title="Hero banner"
        onEdit={() => setCopyDialog("hero")}
        description="Badge, headline and the two buttons at the top of the home page."
      />

      {/* ── About ──────────────────────────────────────────────── */}
      <CopySection
        title="About"
        onEdit={() => setCopyDialog("about")}
        description="Eyebrow, headline, intro paragraph and the four pillar cards."
      />

      {/* ── CTA band ───────────────────────────────────────────── */}
      <CopySection
        title="Call-to-action band"
        onEdit={() => setCopyDialog("cta")}
        description="The closing band with its two buttons."
      />

      {/* ---- Section heading dialog ---- */}
      <Dialog open={headingKey !== null} onOpenChange={(o) => !o && setHeadingKey(null)}>
        <DialogContent className="bg-ink-900 sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit heading — {headingKey ? SECTION_LABELS[headingKey] : ""}</DialogTitle>
            <DialogDescription>
              The eyebrow, title and description above the section grid on the home page.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <Field label="Eyebrow" value={headingForm.eyebrow} onChange={(eyebrow) => setHeadingForm((f) => ({ ...f, eyebrow }))} />
            <Field label="Title (plain)" value={headingForm.title} onChange={(title) => setHeadingForm((f) => ({ ...f, title }))} />
            <Field label="Title (highlighted)" value={headingForm.titleAccent} onChange={(titleAccent) => setHeadingForm((f) => ({ ...f, titleAccent }))} hint="Rendered in the brand gradient." />
            <Field label="Description" value={headingForm.description} onChange={(description) => setHeadingForm((f) => ({ ...f, description }))} textarea rows={2} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setHeadingKey(null)}>Cancel</Button>
            <Button onClick={saveHeading}>Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ---- Hero copy dialog ---- */}
      <Dialog open={copyDialog === "hero"} onOpenChange={(o) => !o && setCopyDialog(null)}>
        <DialogContent className="max-h-[85vh] overflow-y-auto bg-ink-900 sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Edit hero banner</DialogTitle>
            <DialogDescription>Changes appear on the home page immediately.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <Field label="Badge" value={hero.badge} onChange={(badge) => setHero({ ...hero, badge })} />
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Title (plain)" value={hero.title} onChange={(title) => setHero({ ...hero, title })} />
              <Field label="Title (highlighted)" value={hero.titleAccent} onChange={(titleAccent) => setHero({ ...hero, titleAccent })} hint="Rendered in the brand gradient." />
            </div>
            <Field label="Subtitle" value={hero.subtitle} onChange={(subtitle) => setHero({ ...hero, subtitle })} textarea rows={3} />
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Primary button" value={hero.primary.label} onChange={(label) => setHero({ ...hero, primary: { ...hero.primary, label } })} />
              <Field label="Primary link" value={hero.primary.href} onChange={(href) => setHero({ ...hero, primary: { ...hero.primary, href } })} />
              <Field label="Secondary button" value={hero.secondary.label} onChange={(label) => setHero({ ...hero, secondary: { ...hero.secondary, label } })} />
              <Field label="Secondary link" value={hero.secondary.href} onChange={(href) => setHero({ ...hero, secondary: { ...hero.secondary, href } })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCopyDialog(null)}>Cancel</Button>
            <Button onClick={saveCopy}>Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ---- About copy dialog ---- */}
      <Dialog open={copyDialog === "about"} onOpenChange={(o) => !o && setCopyDialog(null)}>
        <DialogContent className="max-h-[85vh] overflow-y-auto bg-ink-900 sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit about section</DialogTitle>
            <DialogDescription>Changes appear on the home page immediately.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <Field label="Eyebrow" value={about.eyebrow} onChange={(eyebrow) => setAbout({ ...about, eyebrow })} />
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Title (plain)" value={about.title} onChange={(title) => setAbout({ ...about, title })} />
              <Field label="Title (highlighted)" value={about.titleAccent} onChange={(titleAccent) => setAbout({ ...about, titleAccent })} />
            </div>
            <Field label="Intro paragraph" value={about.intro} onChange={(intro) => setAbout({ ...about, intro })} textarea rows={4} />
            <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
              The four cards
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              {about.pillars.map((p, i) => (
                <div key={i} className="rounded-xl border border-border/70 bg-ink-900/50 p-4">
                  <label className="block">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">Icon</span>
                    <select
                      value={p.icon}
                      onChange={(e) => {
                        const pillars = [...about.pillars];
                        pillars[i] = { ...p, icon: e.target.value };
                        setAbout({ ...about, pillars });
                      }}
                      className="mt-1 h-9 w-full rounded-lg border border-border bg-ink-900 px-2.5 text-[13px] text-foreground outline-none focus:border-brand-500/50"
                    >
                      {PILLAR_ICONS.map((name) => (
                        <option key={name} value={name}>{name}</option>
                      ))}
                    </select>
                  </label>
                  <div className="mt-3">
                    <Field
                      label="Title"
                      value={p.title}
                      onChange={(title) => {
                        const pillars = [...about.pillars];
                        pillars[i] = { ...p, title };
                        setAbout({ ...about, pillars });
                      }}
                    />
                  </div>
                  <div className="mt-3">
                    <Field
                      label="Text"
                      value={p.text}
                      onChange={(text) => {
                        const pillars = [...about.pillars];
                        pillars[i] = { ...p, text };
                        setAbout({ ...about, pillars });
                      }}
                      textarea
                      rows={4}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCopyDialog(null)}>Cancel</Button>
            <Button onClick={saveCopy}>Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ---- CTA band dialog ---- */}
      <Dialog open={copyDialog === "cta"} onOpenChange={(o) => !o && setCopyDialog(null)}>
        <DialogContent className="max-h-[85vh] overflow-y-auto bg-ink-900 sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Edit call-to-action band</DialogTitle>
            <DialogDescription>Changes appear on the home page immediately.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <Field label="Eyebrow" value={cta.eyebrow} onChange={(eyebrow) => setCta({ ...cta, eyebrow })} />
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Title (plain)" value={cta.title} onChange={(title) => setCta({ ...cta, title })} />
              <Field label="Title (highlighted)" value={cta.titleAccent} onChange={(titleAccent) => setCta({ ...cta, titleAccent })} />
            </div>
            <Field label="Description" value={cta.description} onChange={(description) => setCta({ ...cta, description })} textarea rows={2} />
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Primary button" value={cta.primary.label} onChange={(label) => setCta({ ...cta, primary: { ...cta.primary, label } })} />
              <Field label="Primary link" value={cta.primary.href} onChange={(href) => setCta({ ...cta, primary: { ...cta.primary, href } })} />
              <Field label="Secondary button" value={cta.secondary.label} onChange={(label) => setCta({ ...cta, secondary: { ...cta.secondary, label } })} />
              <Field label="Secondary link" value={cta.secondary.href} onChange={(href) => setCta({ ...cta, secondary: { ...cta.secondary, href } })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCopyDialog(null)}>Cancel</Button>
            <Button onClick={saveCopy}>Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

/** Products-style section header: title + description on the left, Edit pill on the right. */
function CopySection({
  title,
  description,
  onEdit,
}: {
  title: string;
  description: string;
  onEdit: () => void;
}) {
  return (
    <section aria-label={title} className="mt-10">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-lg font-semibold text-foreground">{title}</h2>
          <p className="mt-0.5 text-[13px] text-muted-foreground">{description}</p>
        </div>
        <ToolbarPill icon={Pencil} onClick={onEdit}>
          Edit
        </ToolbarPill>
      </div>
    </section>
  );
}
