"use client";

import { useEffect, useState } from "react";
import { ArrowDown, ArrowUp, Eye, EyeOff } from "lucide-react";
import { PageHeader } from "./ui";
import { Field, SaveBar, isDirty, useSaveSiteConfig, useSiteConfig } from "./site-editor";
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

/** Dashboard → Website → Home Sections: copy editors + section order/visibility. */
export function WebsiteSectionsClient() {
  const { data, isLoading } = useSiteConfig();
  const save = useSaveSiteConfig();
  const [hero, setHero] = useState<HeroConfig | null>(null);
  const [about, setAbout] = useState<AboutConfig | null>(null);
  const [cta, setCta] = useState<CtaConfig | null>(null);
  const [sections, setSections] = useState<SectionsConfig | null>(null);

  useEffect(() => {
    if (data) {
      setHero(data.hero);
      setAbout(data.about);
      setCta(data.cta);
      setSections(data.sections);
    }
  }, [data]);

  if (isLoading || !hero || !about || !cta || !sections) {
    return <p className="text-sm text-muted-foreground">Loading site settings…</p>;
  }

  const dirty =
    isDirty(hero, data?.hero) ||
    isDirty(about, data?.about) ||
    isDirty(cta, data?.cta) ||
    isDirty(sections, data?.sections);

  const moveSection = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= sections.order.length) return;
    const order = [...sections.order];
    [order[i], order[j]] = [order[j], order[i]];
    setSections({ ...sections, order: order as SectionsConfig["order"] });
  };

  const setHeading = (key: string, patch: Partial<SectionHeadingCfg>) =>
    setSections({
      ...sections,
      headings: { ...sections.headings, [key]: { ...sections.headings[key]!, ...patch } },
    });

  async function onSave() {
    // sequential upserts on the same row — no parallel write races
    if (isDirty(hero, data?.hero)) {
      if (!(await save("hero", hero))) return;
    }
    if (isDirty(about, data?.about)) {
      if (!(await save("about", about))) return;
    }
    if (isDirty(cta, data?.cta)) {
      if (!(await save("cta", cta))) return;
    }
    if (isDirty(sections, data?.sections)) {
      if (!(await save("sections", sections))) return;
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title="Home Sections"
        description="Hero, About and CTA copy, plus which sections appear on the home page and in what order."
      />

      <div className="flex flex-col gap-6">
        {/* Hero */}
        <Card title="Hero banner">
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
        </Card>

        {/* About */}
        <Card title="About section">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Eyebrow" value={about.eyebrow} onChange={(eyebrow) => setAbout({ ...about, eyebrow })} />
          </div>
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
        </Card>

        {/* CTA band */}
        <Card title="Call-to-action band">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Eyebrow" value={cta.eyebrow} onChange={(eyebrow) => setCta({ ...cta, eyebrow })} />
          </div>
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
        </Card>

        {/* Sections order + visibility */}
        <Card title="Sections on the home page" hint="Reorder with the arrows; the eye hides a section from the website.">
          <div className="flex flex-col gap-2.5">
            {sections.order.map((key, i) => {
              const visible = sections.visible[key] !== false;
              const heading = sections.headings[key];
              return (
                <div key={key} className="rounded-xl border border-border/70 bg-ink-900/50 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <span className="flex size-7 items-center justify-center rounded-full bg-brand-500/15 text-[11px] font-bold text-brand-accent">
                        {i + 1}
                      </span>
                      <span className="text-[13.5px] font-semibold text-foreground">
                        {SECTION_LABELS[key] ?? key}
                      </span>
                    </div>
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
                        disabled={i === sections.order.length - 1}
                        aria-label="Move down"
                        className="flex size-8 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:text-foreground disabled:opacity-30"
                      >
                        <ArrowDown className="size-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setSections({
                            ...sections,
                            visible: { ...sections.visible, [key]: !visible },
                          })
                        }
                        aria-label={visible ? "Hide section" : "Show section"}
                        className={`flex size-8 items-center justify-center rounded-full border transition-colors ${
                          visible
                            ? "border-brand-500/40 bg-brand-500/10 text-brand-accent"
                            : "border-border text-muted-foreground"
                        }`}
                      >
                        {visible ? <Eye className="size-3.5" /> : <EyeOff className="size-3.5" />}
                      </button>
                    </div>
                  </div>
                  {visible && HAS_HEADING.has(key) && heading && (
                    <div className="mt-4 grid gap-3 border-t border-border/50 pt-4 sm:grid-cols-2">
                      <Field label="Eyebrow" value={heading.eyebrow} onChange={(eyebrow) => setHeading(key, { eyebrow })} />
                      <div />
                      <Field label="Title (plain)" value={heading.title} onChange={(title) => setHeading(key, { title })} />
                      <Field label="Title (highlighted)" value={heading.titleAccent} onChange={(titleAccent) => setHeading(key, { titleAccent })} />
                      <div className="sm:col-span-2">
                        <Field label="Description" value={heading.description} onChange={(description) => setHeading(key, { description })} textarea rows={2} />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      <SaveBar dirty={dirty} onSave={onSave} />
    </div>
  );
}

function Card({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-4 rounded-2xl border border-border bg-ink-850/85 p-6 sm:p-8">
      <div>
        <h2 className="font-display text-lg font-semibold text-foreground">{title}</h2>
        {hint && <p className="mt-1 text-[12.5px] text-muted-foreground">{hint}</p>}
      </div>
      {children}
    </section>
  );
}
