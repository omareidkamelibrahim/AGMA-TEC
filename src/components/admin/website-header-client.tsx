"use client";

import { useEffect, useState } from "react";
import { Link2, Menu, MousePointerClick } from "lucide-react";
import { PageHeader, StatCard } from "./ui";
import { Field, LinkListEditor, SaveBar, isDirty, useSaveSiteConfig, useSiteConfig } from "./site-editor";
import type { HeaderConfig } from "@/lib/site-config";

/** Dashboard → Website → Header & Navigation. */
export function WebsiteHeaderClient() {
  const { data, isLoading } = useSiteConfig();
  const save = useSaveSiteConfig();
  const [state, setState] = useState<HeaderConfig | null>(null);

  useEffect(() => {
    if (data) setState(data.header);
  }, [data]);

  if (isLoading || !state) {
    return <p className="text-sm text-muted-foreground">Loading site settings…</p>;
  }

  const dirty = isDirty(state, data?.header);

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title="Header & Navigation"
        description="The logo bar links and the call-to-action button shown on every page of the website."
      />

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <StatCard label="Navigation links" value={state.links.length} icon={Menu} tone="brand" />
        <StatCard
          label="CTA button"
          value={state.cta.label.trim() ? "On" : "Off"}
          icon={MousePointerClick}
          tone={state.cta.label.trim() ? "success" : "neutral"}
        />
        <StatCard label="CTA links to" value={state.cta.href || "—"} icon={Link2} tone="neutral" />
      </div>

      <div className="mt-6 flex flex-col gap-8 rounded-2xl border border-border bg-ink-850/85 p-6 sm:p-8">
        <LinkListEditor
          label="Navigation links"
          links={state.links}
          onChange={(links) => setState({ ...state, links })}
        />
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
      </div>

      <SaveBar
        dirty={dirty}
        onSave={() => save("header", state)}
      />
    </div>
  );
}
