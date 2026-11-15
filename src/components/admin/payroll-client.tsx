"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Banknote, CircleDollarSign, FilePlus2, Landmark, Users2 } from "lucide-react";
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
  Checkbox,
  PageHeader,
  SelectionChip,
  SortHeader,
  StatCard,
  StatusBadge,
  ToolbarPrimary,
  fmtMoney,
} from "./ui";

type Run = {
  id: string;
  reference: string;
  period: string;
  employees: number;
  gross: number;
  deductions: number;
  net: number;
  status: string;
};

type Response = {
  rows: Run[];
  activeEmployees: number;
  totals: { gross: number; net: number; paid: number; draft: number };
};

export function PayrollClient() {
  const qc = useQueryClient();

  /* photo-style row selection */
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const toggleRow = (id: string, on: boolean) =>
    setSelected((s) => {
      const n = new Set(s);
      if (on) n.add(id);
      else n.delete(id);
      return n;
    });
  const [open, setOpen] = useState(false);
  const [period, setPeriod] = useState("");
  const [saving, setSaving] = useState(false);
  const [sort, setSort] = useState<{ field: string; dir: "asc" | "desc" }>({
    field: "period",
    dir: "desc",
  });

  const onSort = (field: string) => {
    setSort((s) =>
      s.field === field
        ? { field, dir: s.dir === "asc" ? "desc" : "asc" }
        : { field, dir: "asc" },
    );
  };

  const { data, isLoading } = useQuery<Response>({
    queryKey: ["payroll"],
    queryFn: async () => {
      const res = await fetch("/api/admin/payroll");
      if (!res.ok) throw new Error("Failed to load payroll runs");
      return res.json();
    },
  });

  const create = async () => {
    if (!/^\d{4}-\d{2}$/.test(period)) {
      toast.error("Period must be in YYYY-MM format, e.g. 2026-01.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/admin/payroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ period }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? "Request failed");
      toast.success(`Payroll run ${body.run.reference} created as Draft.`);
      setOpen(false);
      setPeriod("");
      qc.invalidateQueries({ queryKey: ["payroll"] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  const rows = [...(data?.rows ?? [])].sort((a, b) => {
    const dir = sort.dir === "asc" ? 1 : -1;
    const av = a[sort.field as keyof Run];
    const bv = b[sort.field as keyof Run];
    if (typeof av === "number" && typeof bv === "number") return (av - bv) * dir;
    return String(av ?? "").localeCompare(String(bv ?? "")) * dir;
  });

  return (
    <>
      <PageHeader
        title="Payroll"
        description="Monthly payroll runs with references generated from the HR numbering series."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Active Employees" value={data?.activeEmployees ?? "—"} icon={Users2} tone="brand" />
        <StatCard label="YTD Gross" value={data ? fmtMoney(data.totals.gross) : "—"} icon={Banknote} tone="brand" />
        <StatCard label="YTD Net" value={data ? fmtMoney(data.totals.net) : "—"} icon={CircleDollarSign} tone="success" />
        <StatCard label="Paid / Draft Runs" value={data ? `${data.totals.paid} / ${data.totals.draft}` : "—"} icon={Landmark} tone="neutral" />
      </div>

      {/* toolbar — primary action pill on the right, like the reference */}
      <div className="mt-6 flex items-center justify-end gap-2.5">
        <ToolbarPrimary icon={FilePlus2} onClick={() => setOpen(true)}>
          New run
        </ToolbarPrimary>
      </div>

      {selected.size > 0 && (
        <div className="mt-3">
          <SelectionChip count={selected.size} onClear={() => setSelected(new Set())} />
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-border bg-ink-850/85">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead>
              <tr className="border-b border-border/60 bg-ink-900/40">
                                <th className="h-11 w-12 pl-5 pr-1 align-middle" aria-label="Select">
                  <Checkbox
                    checked={ rows.length > 0 && rows.every((x) => selected.has(x.id)) }
                    indeterminate={ selected.size > 0 && !rows.every((x) => selected.has(x.id)) }
                    onChange={(on) => setSelected(on ? new Set(rows.map((x) => x.id)) : new Set())}
                    label="Select all rows"
                  />
                </th>
                <SortHeader label="Reference" field="reference" sort={sort.field} dir={sort.dir} onSort={onSort} />
                <SortHeader label="Period" field="period" sort={sort.field} dir={sort.dir} onSort={onSort} />
                <SortHeader label="Employees" field="employees" sort={sort.field} dir={sort.dir} onSort={onSort} />
                <SortHeader label="Gross" field="gross" sort={sort.field} dir={sort.dir} onSort={onSort} />
                <SortHeader label="Deductions" field="deductions" sort={sort.field} dir={sort.dir} onSort={onSort} />
                <SortHeader label="Net" field="net" sort={sort.field} dir={sort.dir} onSort={onSort} />
                <SortHeader label="Status" field="status" sort={sort.field} dir={sort.dir} onSort={onSort} />
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={8} className="px-4 py-14 text-center text-sm text-muted-foreground">Loading runs…</td></tr>
              ) : rows.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-14 text-center text-sm text-muted-foreground">No payroll runs yet — create the first one.</td></tr>
              ) : (
                rows.map((r) => (
                  <tr key={r.id} className="border-b border-border/40 transition-colors last:border-0 hover:bg-brand-500/[0.04]">
                    <td className="pl-5 pr-1 align-middle" onClick={(e) => e.stopPropagation()}>
                      <Checkbox checked={ selected.has(r.id) } onChange={(on) => toggleRow(r.id, on)} label={`Select ${r.reference}`} />
                    </td>
                    <td className="px-4 py-3 font-mono text-[12px] font-semibold text-brand-accent-bright">{r.reference}</td>
                    <td className="px-4 py-3 font-medium text-foreground">{r.period}</td>
                    <td className="px-4 py-3 text-foreground/80">{r.employees}</td>
                    <td className="px-4 py-3 text-foreground/80">{fmtMoney(r.gross)}</td>
                    <td className="px-4 py-3 text-muted-foreground">{fmtMoney(r.deductions)}</td>
                    <td className="px-4 py-3 font-semibold text-foreground">{fmtMoney(r.net)}</td>
                    <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="border-border bg-ink-900 sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-display text-foreground">New Payroll Run</DialogTitle>
            <DialogDescription>
              One run per period. Headcount and totals are pulled from active employees; the reference uses the PR- series.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-1.5">
            <Label className="text-[12px] font-medium text-muted-foreground">Period (YYYY-MM)</Label>
            <Input
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              placeholder="2026-01"
              className="border-border bg-ink-850"
            />
          </div>
          <DialogFooter className="mt-2">
            <Button variant="outline" className="border-border bg-transparent" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={create} disabled={saving} className="gap-2">
              {saving && <span className="size-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white" />}
              Create run
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
