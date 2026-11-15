"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { PageHeader } from "./ui";
import { Field, LinkListEditor, SaveBar, isDirty, useSaveSiteConfig, useSiteConfig } from "./site-editor";
import { SOCIAL_ICONS, type FooterConfig } from "@/lib/site-config";

/** Dashboard → Website → Footer. */
export function WebsiteFooterClient() {
  const { data, isLoading } = useSiteConfig();
  const save = useSaveSiteConfig();
  const [state, setState] = useState<FooterConfig | null>(null);

  useEffect(() => {
    if (data) setState(data.footer);
  }, [data]);

  if (isLoading || !state) {
    return <p className="text-sm text-muted-foreground">Loading site settings…</p>;
  }

  const dirty = isDirty(state, data?.footer);

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title="Footer"
        description="Everything below the divider on the website: brand text, link columns, socials, newsletter blurb and the bottom bar."
      />

      <div className="flex flex-col gap-8 rounded-2xl border border-border bg-ink-850/85 p-6 sm:p-8">
        <Field
          label="Brand paragraph"
          value={state.about}
          onChange={(about) => setState({ ...state, about })}
          textarea
          rows={4}
        />

        {state.columns.map((col, ci) => (
          <div key={ci} className="rounded-xl border border-border/70 bg-ink-900/50 p-4">
            <div className="mb-3">
              <Field
                label={`Column ${ci + 1} title`}
                value={col.title}
                onChange={(title) => {
                  const columns = [...state.columns];
                  columns[ci] = { ...col, title };
                  setState({ ...state, columns });
                }}
              />
            </div>
            <LinkListEditor
              label="Links"
              links={col.links}
              onChange={(links) => {
                const columns = [...state.columns];
                columns[ci] = { ...col, links };
                setState({ ...state, columns });
              }}
            />
          </div>
        ))}

        {/* Socials */}
        <div>
          <div className="flex items-center justify-between">
            <span className="text-[12px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
              Social links
            </span>
            <button
              type="button"
              disabled={state.socials.length >= 6}
              onClick={() =>
                setState({
                  ...state,
                  socials: [...state.socials, { icon: "linkedin", label: "", href: "" }],
                })
              }
              className="inline-flex h-8 items-center gap-1.5 rounded-full border border-border px-3 text-[12px] font-semibold text-foreground transition-colors hover:bg-ink-700 disabled:opacity-40"
            >
              <Plus className="size-3.5" /> Add
            </button>
          </div>
          <div className="mt-2 flex flex-col gap-2">
            {state.socials.map((s, i) => (
              <div key={i} className="flex items-center gap-2">
                <select
                  value={s.icon}
                  onChange={(e) => {
                    const socials = [...state.socials];
                    socials[i] = { ...s, icon: e.target.value };
                    setState({ ...state, socials });
                  }}
                  aria-label={`Social ${i + 1} icon`}
                  className="h-9 w-32 rounded-lg border border-border bg-ink-900 px-2.5 text-[13px] text-foreground outline-none focus:border-brand-500/50"
                >
                  {SOCIAL_ICONS.map((name) => (
                    <option key={name} value={name}>{name}</option>
                  ))}
                </select>
                <input
                  value={s.label}
                  onChange={(e) => {
                    const socials = [...state.socials];
                    socials[i] = { ...s, label: e.target.value };
                    setState({ ...state, socials });
                  }}
                  placeholder="Label"
                  aria-label={`Social ${i + 1} label`}
                  className="h-9 flex-1 rounded-lg border border-border bg-ink-900/60 px-3 text-[13px] text-foreground placeholder:text-muted-foreground/60 outline-none focus:border-brand-500/50"
                />
                <input
                  value={s.href}
                  onChange={(e) => {
                    const socials = [...state.socials];
                    socials[i] = { ...s, href: e.target.value };
                    setState({ ...state, socials });
                  }}
                  placeholder="https://…"
                  aria-label={`Social ${i + 1} URL`}
                  className="h-9 flex-1 rounded-lg border border-border bg-ink-900/60 px-3 text-[13px] text-foreground placeholder:text-muted-foreground/60 outline-none focus:border-brand-500/50"
                />
                <button
                  type="button"
                  onClick={() => setState({ ...state, socials: state.socials.filter((_, j) => j !== i) })}
                  aria-label="Remove social"
                  className="flex size-8 shrink-0 items-center justify-center rounded-full border border-red-500/30 text-red-300 transition-colors hover:bg-red-500/15"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

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
      </div>

      <SaveBar dirty={dirty} onSave={() => save("footer", state)} />
    </div>
  );
}
