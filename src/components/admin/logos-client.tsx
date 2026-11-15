"use client";

/**
 * Kind-locked logo manager shared by the Clients and Partners pages.
 * `kind` fixes the group: no group filter, the dialog can't change it,
 * and CSV imports are forced onto this page's group (?kind= override).
 */

import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Building2,
  Download,
  Eye,
  EyeOff,
  Handshake,
  Image as ImageIcon,
  Pencil,
  Plus,
  Trash2,
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  SortHeader,
  StatCard,
  ToolbarPill,
  ToolbarPrimary,
  ToolbarSearch,
  Checkbox,
  SelectionChip,
} from "./ui";
import { ImportDialog } from "./import-dialog";
import { PublishedSwitch } from "./website-bits";

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

const COPY = {
  client: {
    title: "Clients",
    description:
      "Client logos shown on /clients and the homepage. Only publish logos confirmed by the company.",
    search: "Search clients…",
    add: "Add client logo",
    empty: "/public/clients/",
    fileHint: "e.g. /public/clients/acme.png → path /clients/acme.png",
  },
  partner: {
    title: "Partners",
    description:
      "Technology partner logos shown on /clients and the homepage. Only publish logos confirmed by the company.",
    search: "Search partners…",
    add: "Add partner logo",
    empty: "/public/partners/",
    fileHint: "e.g. /public/partners/acme.svg → path /partners/acme.svg",
  },
} as const;

export function LogosClient({ kind }: { kind: "client" | "partner" }) {
  const qc = useQueryClient();
  const copy = COPY[kind];

  /* photo-style row selection */
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const toggleRow = (id: string, on: boolean) =>
    setSelected((s) => {
      const n = new Set(s);
      if (on) n.add(id);
      else n.delete(id);
      return n;
    });

  const bulkUpdate = async (payload: Record<string, unknown>, okLabel: string) => {
    const res = await fetch("/api/admin/clients", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: [...selected], ...payload }),
    });
    if (!res.ok) {
      toast.error("Bulk update failed.");
      return;
    }
    toast.success(okLabel);
    qc.invalidateQueries({ queryKey: ["admin-clients"] });
    setSelected(new Set());
  };

  const bulkDelete = async () => {
    if (!window.confirm(`Delete ${selected.size} selected logos? This cannot be undone.`)) return;
    const res = await fetch(`/api/admin/clients?ids=${[...selected].join(",")}`, { method: "DELETE" });
    if (!res.ok) {
      toast.error("Bulk delete failed.");
      return;
    }
    toast.success(`${selected.size} logos deleted.`);
    qc.invalidateQueries({ queryKey: ["admin-clients"] });
    setSelected(new Set());
  };

  /* ---------- state ---------- */
  const [logoOpen, setLogoOpen] = useState(false);
  const [logoEditing, setLogoEditing] = useState<LogoRow | null>(null);
  const [logoForm, setLogoForm] = useState<LogoForm>({ name: "", kind, imageUrl: "", sortOrder: 10, published: true });
  const [logoSearch, setLogoSearch] = useState("");
  const [logoImportOpen, setLogoImportOpen] = useState(false);
  const [logoSort, setLogoSort] = useState<{ field: string; dir: "asc" | "desc" }>({
    field: "sortOrder",
    dir: "asc",
  });

  const onLogoSort = (field: string) => {
    setLogoSort((s) =>
      s.field === field
        ? { field, dir: s.dir === "asc" ? "desc" : "asc" }
        : { field, dir: "asc" },
    );
  };

  const logos = useQuery<{ rows: LogoRow[] }>({
    queryKey: ["admin-clients"],
    queryFn: async () => {
      const res = await fetch("/api/admin/clients");
      if (!res.ok) throw new Error("Failed to load logos");
      return res.json();
    },
  });

  const invalidate = (key: string) => qc.invalidateQueries({ queryKey: [key] });

  const saveLogo = async () => {
    if (logoForm.name.trim().length < 2 || !logoForm.imageUrl.trim()) {
      toast.error("Name and image path are required.");
      return;
    }
    try {
      const res = await fetch(
        logoEditing ? `/api/admin/clients/${logoEditing.id}` : "/api/admin/clients",
        {
          method: logoEditing ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...logoForm,
            kind, // page-locked group
            name: logoForm.name.trim(),
            imageUrl: logoForm.imageUrl.trim(),
          }),
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

  const logoRows = logos.data?.rows ?? [];
  const kindRows = logoRows.filter((r) => r.kind === kind);
  const liveCount = kindRows.filter((r) => r.published).length;

  const visibleLogos = useMemo(() => {
    const q = logoSearch.trim().toLowerCase();
    const filtered = logoRows.filter((r) => {
      if (r.kind !== kind) return false;
      if (!q) return true;
      return r.name.toLowerCase().includes(q);
    });
    const dir = logoSort.dir === "asc" ? 1 : -1;
    return [...filtered].sort((a, b) =>
      String(a[logoSort.field as keyof LogoRow] ?? "").localeCompare(
        String(b[logoSort.field as keyof LogoRow] ?? ""),
      ) * dir,
    );
  }, [logoRows, logoSearch, kind, logoSort]);

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

  const template = `Name,Group,Image URL,Sort Order,Published\n${kind === "partner" ? "TechPartners Ltd,partner,/partners/techpartners.svg,20,yes" : "Acme Industrial Group,client,/clients/acme.png,10,yes"}`;

  return (
    <>
      <PageHeader
        title={copy.title}
        description={copy.description}
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label={kind === "partner" ? "Partner logos" : "Client logos"}
          value={kindRows.length}
          icon={kind === "partner" ? Handshake : Building2}
          tone="brand"
          hint="Confirmed logos for this page"
        />
        <StatCard label="Live on the site" value={liveCount} icon={Eye} tone="success" />
        <StatCard label="Hidden" value={kindRows.length - liveCount} icon={EyeOff} tone="neutral" />
      </div>

      {/* toolbar — search left, action pills right */}
      <div className="mt-6 flex flex-col gap-3 lg:flex-row lg:items-center">
        <ToolbarSearch
          value={logoSearch}
          onChange={setLogoSearch}
          placeholder={copy.search}
          label="Search logos"
        />
        <div className="flex flex-wrap items-center gap-2.5 lg:justify-end">
          <ToolbarPill icon={Upload} onClick={() => setLogoImportOpen(true)}>
            Import
          </ToolbarPill>
          <ToolbarPill icon={Download} href="/api/admin/clients/export" download>
            Export
          </ToolbarPill>
          <ToolbarPrimary
            icon={Plus}
            onClick={() => {
              setLogoEditing(null);
              setLogoForm({ name: "", kind, imageUrl: "", sortOrder: logoRows.length + 1, published: true });
              setLogoOpen(true);
            }}
          >
            {copy.add}
          </ToolbarPrimary>
        </div>
      </div>

      {selected.size > 0 && (
        <div className="mt-3">
          <SelectionChip
            count={selected.size}
            onClear={() => setSelected(new Set())}
            actions={[
              { label: "Publish", onClick: () => bulkUpdate({ published: true }, "Logos published.") },
              { label: "Unpublish", onClick: () => bulkUpdate({ published: false }, "Logos unpublished.") },
              { label: "Delete", danger: true, onClick: bulkDelete },
            ]}
          />
        </div>
      )}

      <div className="mt-4 overflow-hidden rounded-2xl border border-border bg-ink-850/85">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-border/60 bg-ink-900/40">
                <th className="h-11 w-12 pl-5 pr-1 align-middle" aria-label="Select">
                  <Checkbox
                    checked={ visibleLogos.length > 0 && visibleLogos.every((x) => selected.has(x.id)) }
                    indeterminate={ selected.size > 0 && !visibleLogos.every((x) => selected.has(x.id)) }
                    onChange={(on) => setSelected(on ? new Set(visibleLogos.map((x) => x.id)) : new Set())}
                    label="Select all rows"
                  />
                </th>
                <SortHeader label="Logo" field="name" sort={logoSort.field} dir={logoSort.dir} onSort={onLogoSort} />
                <SortHeader label="Order" field="sortOrder" sort={logoSort.field} dir={logoSort.dir} onSort={onLogoSort} />
                <SortHeader label="On site" field="published" sort={logoSort.field} dir={logoSort.dir} onSort={onLogoSort} />
                <th className="h-11 w-14 px-4" aria-label="Actions" />
              </tr>
            </thead>
            <tbody>
              {logos.isLoading ? (
                <tr><td colSpan={5} className="px-4 py-10 text-center text-sm text-muted-foreground">Loading…</td></tr>
              ) : visibleLogos.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-10">
                    <p className="text-center text-sm text-muted-foreground">
                      No logos yet. Drop image files into{" "}
                      <code className="rounded bg-ink-900 px-1.5 py-0.5 font-mono text-[12px] text-brand-accent">{copy.empty}</code>{" "}
                      then click “{copy.add}”.
                    </p>
                  </td>
                </tr>
              ) : (
                visibleLogos.map((r) => (
                  <tr key={r.id} className="border-b border-border/40 transition-colors last:border-0 hover:bg-brand-500/[0.04]">
                    <td className="pl-5 pr-1 align-middle" onClick={(e) => e.stopPropagation()}>
                      <Checkbox checked={ selected.has(r.id) } onChange={(on) => toggleRow(r.id, on)} label={`Select ${r.name}`} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img src={r.imageUrl} alt="" className="h-9 w-16 rounded-lg border border-border/70 bg-white/95 object-contain p-1" />
                        <div>
                          <p className="font-semibold text-foreground">{r.name}</p>
                          <p className="font-mono text-[11px] text-muted-foreground">{r.imageUrl}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-[12px] text-muted-foreground">{r.sortOrder}</td>
                    <td className="px-4 py-3">
                      <button type="button" onClick={() => toggleLogo(r)} className="inline-flex" aria-label={r.published ? `Hide ${r.name}` : `Publish ${r.name}`}>
                        <LiveChip on={r.published} />
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <RowActions label={`Actions for ${r.name}`}>
                        <DropdownMenuItem
                          onClick={() => {
                            setLogoEditing(r);
                            setLogoForm({ name: r.name, kind: r.kind, imageUrl: r.imageUrl, sortOrder: r.sortOrder, published: r.published });
                            setLogoOpen(true);
                          }}
                          className="gap-2"
                        >
                          <Pencil className="size-4" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => toggleLogo(r)} className="gap-2">
                          {r.published ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                          {r.published ? "Hide from site" : "Publish to site"}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-border/60" />
                        <DropdownMenuItem
                          onClick={() => removeLogo(r)}
                          className="gap-2 text-red-500 focus:text-red-500"
                        >
                          <Trash2 className="size-4" /> Delete
                        </DropdownMenuItem>
                      </RowActions>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ---- CSV import ---- */}
      <ImportDialog
        open={logoImportOpen}
        onOpenChange={setLogoImportOpen}
        title={`Import ${kind === "partner" ? "partner" : "client"} logos`}
        description={`Upload a CSV with the same columns as the Export file. Everything imported here is added as ${kind === "partner" ? "partners" : "clients"}. Image files must already exist under ${copy.empty}`}
        resource="clients"
        query={`?kind=${kind}`}
        template={template}
        onImported={() => qc.invalidateQueries({ queryKey: ["admin-clients"] })}
      />

      {/* ---- Logo dialog ---- */}
      <Dialog open={logoOpen} onOpenChange={setLogoOpen}>
        <DialogContent className="bg-ink-900 sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{logoEditing ? `Edit ${logoEditing.name}` : copy.add}</DialogTitle>
            <DialogDescription>
              The image file must already exist in /public ({copy.fileHint}).
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="l-name">Name</Label>
              <Input id="l-name" className="bg-ink-900/60" value={logoForm.name} onChange={(e) => setLogoForm((f) => ({ ...f, name: e.target.value }))} placeholder={kind === "partner" ? "TechPartners Ltd" : "Acme Industrial Group"} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="l-order">Display order</Label>
              <Input id="l-order" type="number" min={0} className="bg-ink-900/60" value={logoForm.sortOrder} onChange={(e) => setLogoForm((f) => ({ ...f, sortOrder: Number(e.target.value) }))} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="l-url">Image path</Label>
              <Input id="l-url" className="bg-ink-900/60 font-mono text-[13px]" value={logoForm.imageUrl} onChange={(e) => setLogoForm((f) => ({ ...f, imageUrl: e.target.value }))} placeholder={kind === "partner" ? "/partners/acme.svg" : "/clients/acme.png"} />
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
            <Button onClick={saveLogo}>{logoEditing ? "Save changes" : copy.add}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
