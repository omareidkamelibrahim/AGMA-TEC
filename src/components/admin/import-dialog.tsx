"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import { Download, FileUp, Loader2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

/**
 * Photo-style CSV import dialog, shared by every admin list page.
 * Pick a .csv file → POST it to /api/admin/<resource>/import →
 * surface created/skipped/error counts. Offers a downloadable template.
 */
export function ImportDialog({
  open,
  onOpenChange,
  title,
  description,
  resource,
  query,
  template,
  onImported,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  title: string;
  description: string;
  /** API resource segment, e.g. "employees" → /api/admin/employees/import */
  resource: string;
  /** Optional query string appended to the import URL, e.g. "?kind=partner". */
  query?: string;
  /** Sample CSV (with header row) offered as a template download. */
  template: string;
  onImported: () => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ created: number; skipped: number; errors: string[] } | null>(null);

  const downloadTemplate = () => {
    const blob = new Blob([template], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${resource}-import-template.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  async function onFile(file: File) {
    setBusy(true);
    setResult(null);
    try {
      const csv = await file.text();
      const res = await fetch(`/api/admin/${resource}/import${query ?? ""}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ csv }),
      });
      const body = await res.json().catch(() => null);
      if (!res.ok) throw new Error(body?.error ?? "Import failed");
      const r = {
        created: Number(body.created ?? 0),
        skipped: Number(body.skipped ?? 0),
        errors: (body.errors ?? []) as string[],
      };
      setResult(r);
      onImported();
      if (r.created > 0) toast.success(`${r.created} row${r.created === 1 ? "" : "s"} imported.`);
      else toast.error("Nothing was imported — check the file and try again.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Import failed");
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!busy) {
          onOpenChange(o);
          setResult(null);
        }
      }}
    >
      <DialogContent className="border-border bg-ink-900 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-foreground">{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={busy}
          className="flex flex-col items-center gap-2.5 rounded-2xl border border-dashed border-brand-500/40 bg-brand-500/5 px-6 py-9 text-center transition-colors hover:border-brand-500/60 hover:bg-brand-500/10 disabled:opacity-60"
        >
          {busy ? (
            <Loader2 className="size-7 animate-spin text-brand-accent-bright" />
          ) : (
            <span className="flex size-11 items-center justify-center rounded-full border border-brand-500/30 bg-brand-500/10 text-brand-accent-bright">
              <FileUp className="size-5" />
            </span>
          )}
          <span className="text-[13.5px] font-semibold text-foreground">
            {busy ? "Importing…" : "Click to choose a CSV file"}
          </span>
          <span className="text-[11.5px] text-muted-foreground">
            The first row must be the header row from the template.
          </span>
        </button>
        <input
          ref={fileRef}
          type="file"
          accept=".csv,text/csv"
          className="hidden"
          aria-label="CSV file"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) onFile(f);
          }}
        />

        {result && (
          <div className="rounded-xl border border-border bg-ink-850/70 p-3.5 text-[12.5px]">
            <p className="font-semibold text-foreground">
              {result.created} imported · {result.skipped} skipped
            </p>
            {result.errors.length > 0 && (
              <ul className="mt-1.5 space-y-1 text-[11.5px] text-red-400">
                {result.errors.slice(0, 4).map((err, i) => (
                  <li key={i}>· {err}</li>
                ))}
                {result.errors.length > 4 && (
                  <li>… and {result.errors.length - 4} more</li>
                )}
              </ul>
            )}
          </div>
        )}

        <DialogFooter className="mt-1 sm:justify-between">
          <Button variant="outline" className="gap-2 border-border bg-transparent" onClick={downloadTemplate}>
            <Download className="size-4" />
            Template
          </Button>
          <Button variant="outline" className="border-border bg-transparent" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/** Re-export for pages that want an upload icon without importing lucide. */
export { Upload as ImportIcon };
