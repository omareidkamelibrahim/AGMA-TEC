"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { CircleCheck, Hash, Plus, Trash2, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
import { PageHeader, StatCard } from "./ui";

type Series = {
  id: string;
  document: string;
  prefix: string;
  padding: number;
  dateToken: string | null;
  scope: string | null;
};

type Response = {
  rows: Series[];
  stats: { total: number; configured: number; expected: number; missing: number };
};

const DOC_TYPES = [
  "HR_PAYROLL_RUN - Payroll run",
  "HR_EMPLOYEE - Employee file",
  "HR_LEAVE_REQ - Leave request",
  "HR_EOS - End of service",
  "ADV - Advance payment",
  "ATT_CORR - Attendance correction",
  "CUS_ORDER - Customer order",
  "PUR_ORDER - Purchase order",
  "STK_TRANSFER - Stock transfer",
];

const SCOPES = ["Company", "Site", "Department"];

export function NumberingClient() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState<Series | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    document: DOC_TYPES[0],
    prefix: "",
    padding: "5",
    dateToken: "none",
    scope: "any",
  });

  const { data, isLoading } = useQuery<Response>({
    queryKey: ["numbering"],
    queryFn: async () => {
      const res = await fetch("/api/admin/numbering");
      if (!res.ok) throw new Error("Failed to load numbering series");
      return res.json();
    },
  });

  const create = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/numbering", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          document: form.document,
          prefix: form.prefix,
          padding: parseInt(form.padding, 10),
          dateToken: form.dateToken === "none" ? null : form.dateToken,
          scope: form.scope === "any" ? null : form.scope,
        }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? "Request failed");
      toast.success(`Series ${form.prefix} added.`);
      setOpen(false);
      setForm({ ...form, prefix: "" });
      qc.invalidateQueries({ queryKey: ["numbering"] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (s: Series) => {
    const res = await fetch(`/api/admin/numbering/${s.id}`, { method: "DELETE" });
    if (!res.ok) {
      toast.error("Failed to delete series.");
      return;
    }
    toast.success(`Series ${s.prefix} deleted.`);
    setDeleting(null);
    qc.invalidateQueries({ queryKey: ["numbering"] });
  };

  const rows = data?.rows ?? [];

  return (
    <>
      <PageHeader
        title="Numbering Series"
        description="Document numbering configuration — prefixes, padding and date tokens."
        actions={
          <Button className="gap-2" onClick={() => setOpen(true)}>
            <Plus className="size-4" />
            Add Series
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total" value={data?.stats.total ?? "—"} icon={Hash} tone="brand" />
        <StatCard label="Configured" value={data?.stats.configured ?? "—"} icon={CircleCheck} tone="success" />
        <StatCard label="Expected" value={data?.stats.expected ?? "—"} icon={CircleCheck} tone="neutral" />
        <StatCard label="Series Missing" value={data?.stats.missing ?? "—"} icon={TriangleAlert} tone={data?.stats.missing ? "danger" : "success"} />
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-border bg-ink-850/85">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="border-b border-border/60 bg-ink-900/40">
                {["Document", "Prefix", "Padding", "Date Token", "Scope", "Sample", "Actions"].map((h) => (
                  <th key={h} className="h-11 px-4 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={7} className="px-4 py-14 text-center text-sm text-muted-foreground">Loading series…</td></tr>
              ) : rows.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-14 text-center text-sm text-muted-foreground">No series configured yet.</td></tr>
              ) : (
                rows.map((s) => (
                  <tr key={s.id} className="border-b border-border/40 transition-colors last:border-0 hover:bg-brand-500/[0.04]">
                    <td className="px-4 py-3">
                      <span className="block font-mono text-[12px] font-semibold text-foreground">
                        {s.document.split(" - ")[0]}
                      </span>
                      <span className="block text-[11.5px] text-muted-foreground">
                        {s.document.split(" - ").slice(1).join(" - ") || s.document}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-[12.5px] font-bold text-brand-accent-bright">{s.prefix}</td>
                    <td className="px-4 py-3 text-foreground/80">{s.padding}</td>
                    <td className="px-4 py-3 font-mono text-[12px] text-muted-foreground">{s.dateToken ?? "—"}</td>
                    <td className="px-4 py-3 text-foreground/80">{s.scope ?? "Any"}</td>
                    <td className="px-4 py-3 font-mono text-[12px] text-muted-foreground">
                      {s.prefix}{"0".repeat(s.padding)}
                    </td>
                    <td className="px-4 py-3">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 text-muted-foreground hover:bg-red-500/10 hover:text-red-500"
                        onClick={() => setDeleting(s)}
                        aria-label={`Delete ${s.prefix} series`}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* add series modal — mirrors the reference "Add series" dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="border-border bg-ink-900 sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display text-foreground">Add series</DialogTitle>
            <DialogDescription>
              Define how document numbers are generated for the selected type.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label className="text-[12px] font-medium text-muted-foreground">Scope — Document type</Label>
              <Select value={form.document} onValueChange={(v) => setForm({ ...form, document: v })}>
                <SelectTrigger className="border-border bg-ink-850"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {DOC_TYPES.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <Label className="text-[12px] font-medium text-muted-foreground">Prefix</Label>
                <Input
                  value={form.prefix}
                  onChange={(e) => setForm({ ...form, prefix: e.target.value.toUpperCase() })}
                  placeholder="e.g. PR-"
                  className="border-border bg-ink-850 font-mono"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label className="text-[12px] font-medium text-muted-foreground">Padding</Label>
                <Input
                  type="number"
                  min={1}
                  max={12}
                  value={form.padding}
                  onChange={(e) => setForm({ ...form, padding: e.target.value })}
                  className="border-border bg-ink-850"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <Label className="text-[12px] font-medium text-muted-foreground">Date token</Label>
                <Select value={form.dateToken} onValueChange={(v) => setForm({ ...form, dateToken: v })}>
                  <SelectTrigger className="border-border bg-ink-850"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="{YYYY}">{"{YYYY}"}</SelectItem>
                    <SelectItem value="{YYYYMM}">{"{YYYYMM}"}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label className="text-[12px] font-medium text-muted-foreground">Source kind</Label>
                <Select value={form.scope} onValueChange={(v) => setForm({ ...form, scope: v })}>
                  <SelectTrigger className="border-border bg-ink-850"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any</SelectItem>
                    {SCOPES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter className="mt-2">
            <Button variant="outline" className="border-border bg-transparent" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={create} disabled={saving} className="gap-2">
              {saving && <span className="size-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white" />}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(null)}>
        <AlertDialogContent className="border-border bg-ink-900">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display text-foreground">
              Delete {deleting?.prefix} series?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Documents of this type will no longer have a numbering configuration. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-border bg-transparent">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleting && remove(deleting)}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
