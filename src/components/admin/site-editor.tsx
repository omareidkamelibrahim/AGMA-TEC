"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { NavLink } from "@/lib/site-config";

/** Shared kit for the website-chrome editors (header / sections / footer). */

export function useSiteConfig() {
  return useQuery({
    queryKey: ["site-config"],
    queryFn: async () => {
      const res = await fetch("/api/admin/site-config");
      if (!res.ok) throw new Error("Failed to load site config");
      return res.json();
    },
  });
}

export function useSaveSiteConfig() {
  const qc = useQueryClient();
  return async (area: string, data: unknown, okMsg = "Saved — the website updates immediately.") => {
    const res = await fetch("/api/admin/site-config", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ area, data }),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => null);
      toast.error(body?.error ?? "Save failed.");
      return false;
    }
    toast.success(okMsg);
    qc.invalidateQueries({ queryKey: ["site-config"] });
    return true;
  };
}

/* ---------- form primitives ---------- */

export function Field({
  label,
  value,
  onChange,
  placeholder,
  textarea,
  rows = 3,
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  textarea?: boolean;
  rows?: number;
  hint?: string;
}) {
  return (
    <label className="block">
      <span className="text-[12px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
        {label}
      </span>
      {textarea ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={rows}
          className="mt-1.5 w-full rounded-xl border border-border bg-ink-900/60 px-3.5 py-2.5 text-[13px] text-foreground placeholder:text-muted-foreground/60 outline-none transition-colors focus:border-brand-500/50 focus:ring-2 focus:ring-brand-500/15"
        />
      ) : (
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="mt-1.5 h-10 rounded-xl border-border bg-ink-900/60 text-[13px]"
        />
      )}
      {hint && <span className="mt-1 block text-[11.5px] text-muted-foreground/70">{hint}</span>}
    </label>
  );
}

/** Editable list of {label, href} with add / remove / reorder. */
export function LinkListEditor({
  label,
  links,
  onChange,
  max = 10,
}: {
  label: string;
  links: NavLink[];
  onChange: (links: NavLink[]) => void;
  max?: number;
}) {
  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= links.length) return;
    const next = [...links];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };
  return (
    <div>
      <div className="flex items-center justify-between">
        <span className="text-[12px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
          {label}
        </span>
        <Button
          variant="outline"
          size="sm"
          disabled={links.length >= max}
          onClick={() => onChange([...links, { label: "", href: "" }])}
          className="h-8 gap-1.5 rounded-full border-border bg-transparent px-3 text-[12px] text-foreground hover:bg-ink-700"
        >
          <Plus className="size-3.5" /> Add
        </Button>
      </div>
      <div className="mt-2 flex flex-col gap-2">
        {links.map((l, i) => (
          <div key={i} className="flex items-center gap-2">
            <Input
              value={l.label}
              onChange={(e) => {
                const next = [...links];
                next[i] = { ...next[i], label: e.target.value };
                onChange(next);
              }}
              placeholder="Label"
              aria-label={`Link ${i + 1} label`}
              className="h-9 flex-1 rounded-lg border-border bg-ink-900/60 text-[13px]"
            />
            <Input
              value={l.href}
              onChange={(e) => {
                const next = [...links];
                next[i] = { ...next[i], href: e.target.value };
                onChange(next);
              }}
              placeholder="/path"
              aria-label={`Link ${i + 1} URL`}
              className="h-9 flex-1 rounded-lg border-border bg-ink-900/60 text-[13px]"
            />
            <button
              type="button"
              onClick={() => move(i, -1)}
              disabled={i === 0}
              aria-label="Move up"
              className="flex size-8 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:text-foreground disabled:opacity-30"
            >
              <ArrowUp className="size-3.5" />
            </button>
            <button
              type="button"
              onClick={() => move(i, 1)}
              disabled={i === links.length - 1}
              aria-label="Move down"
              className="flex size-8 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:text-foreground disabled:opacity-30"
            >
              <ArrowDown className="size-3.5" />
            </button>
            <button
              type="button"
              onClick={() => onChange(links.filter((_, j) => j !== i))}
              aria-label="Remove link"
              className="flex size-8 items-center justify-center rounded-full border border-red-500/30 text-red-300 transition-colors hover:bg-red-500/15"
            >
              <Trash2 className="size-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Standard save bar. */
export function SaveBar({ dirty, onSave }: { dirty: boolean; onSave: () => void }) {
  return (
    <div className="sticky bottom-4 mt-8 flex justify-end">
      <Button
        onClick={onSave}
        disabled={!dirty}
        className={cn(
          "h-11 rounded-full bg-brand-600 px-7 text-[14px] font-semibold text-white shadow-[0_10px_36px_-10px_rgba(46,123,214,0.8)] transition-all hover:bg-brand-500",
          !dirty && "opacity-50",
        )}
      >
        Save changes
      </Button>
    </div>
  );
}

/** Simple dirty check for JSON-able editor state. */
export function isDirty(a: unknown, b: unknown) {
  return JSON.stringify(a) !== JSON.stringify(b);
}
