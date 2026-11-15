"use client";

import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Check,
  Download,
  Eye,
  Inbox,
  Mail,
  MessageSquare,
  RotateCcw,
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
  FiltersPill,
  PageHeader,
  RowActions,
  SortHeader,
  StatCard,
  ToolbarPill,
  ToolbarSearch,
  fmtDate,
} from "./ui";

type Inquiry = {
  id: string;
  name: string;
  email: string;
  company: string | null;
  service: string | null;
  message: string;
  status: string;
  createdAt: string;
};

type Payload = { rows: Inquiry[]; stats: { total: number; newCount: number; last30: number } };

export function InquiriesClient() {
  const qc = useQueryClient();
  const [active, setActive] = useState<Inquiry | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sort, setSort] = useState<{ field: string; dir: "asc" | "desc" }>({
    field: "createdAt",
    dir: "desc",
  });

  const onSort = (field: string) => {
    setSort((s) =>
      s.field === field
        ? { field, dir: s.dir === "asc" ? "desc" : "asc" }
        : { field, dir: "asc" },
    );
  };

  const { data, isLoading } = useQuery<Payload>({
    queryKey: ["admin-inquiries"],
    queryFn: async () => {
      const res = await fetch("/api/admin/inquiries");
      if (!res.ok) throw new Error("Failed to load inquiries");
      return res.json();
    },
  });
  const rows = data?.rows ?? [];
  const stats = data?.stats;

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    const filtered = rows.filter((r) => {
      if (statusFilter !== "all" && r.status !== statusFilter) return false;
      if (!q) return true;
      return [r.name, r.email, r.company ?? "", r.service ?? ""]
        .join(" ")
        .toLowerCase()
        .includes(q);
    });
    const dir = sort.dir === "asc" ? 1 : -1;
    return [...filtered].sort((a, b) => {
      const av = a[sort.field as keyof Inquiry];
      const bv = b[sort.field as keyof Inquiry];
      if (sort.field === "createdAt") {
        return (new Date(String(av)).getTime() - new Date(String(bv)).getTime()) * dir;
      }
      return String(av ?? "").localeCompare(String(bv ?? "")) * dir;
    });
  }, [rows, search, statusFilter, sort]);

  const setStatus = async (row: Inquiry, status: "New" | "Handled") => {
    const res = await fetch(`/api/admin/inquiries/${row.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) {
      toast.error("Failed to update inquiry.");
      return;
    }
    toast.success(status === "Handled" ? "Marked as handled." : "Marked as new again.");
    setActive((cur) => (cur && cur.id === row.id ? { ...cur, status } : cur));
    qc.invalidateQueries({ queryKey: ["admin-inquiries"] });
  };

  const remove = async (row: Inquiry) => {
    if (!window.confirm(`Delete the inquiry from ${row.name} (${row.email})? This cannot be undone.`)) return;
    const res = await fetch(`/api/admin/inquiries/${row.id}`, { method: "DELETE" });
    if (!res.ok) {
      toast.error("Failed to delete inquiry.");
      return;
    }
    toast.success("Inquiry deleted.");
    setActive(null);
    qc.invalidateQueries({ queryKey: ["admin-inquiries"] });
  };

  return (
    <>
      <PageHeader
        title="Inquiries"
        description="Messages submitted through the website contact form, newest first."
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="New inquiries" value={stats?.newCount ?? "—"} icon={Inbox} tone={stats && stats.newCount > 0 ? "warning" : "neutral"} />
        <StatCard label="Last 30 days" value={stats?.last30 ?? "—"} icon={MessageSquare} tone="brand" />
        <StatCard label="All time" value={stats?.total ?? "—"} icon={Mail} tone="neutral" />
      </div>

      {/* toolbar — search left, filters + export pills right */}
      <div className="mt-6 flex flex-col gap-3 lg:flex-row lg:items-center">
        <ToolbarSearch
          value={search}
          onChange={setSearch}
          placeholder="Search name, email or company…"
          label="Search inquiries"
        />
        <div className="flex flex-wrap items-center gap-2.5 lg:justify-end">
          <FiltersPill
            active={statusFilter !== "all" ? 1 : 0}
            onClear={() => setStatusFilter("all")}
          >
            <div className="space-y-1.5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Status</p>
              <div className="grid grid-cols-3 gap-1.5">
                {["all", "New", "Handled"].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setStatusFilter(s)}
                    className={
                      statusFilter === s
                        ? "rounded-lg border border-brand-500 bg-brand-500/15 py-2 text-[12.5px] font-semibold text-brand-accent-bright"
                        : "rounded-lg border border-border py-2 text-[12.5px] font-medium text-muted-foreground transition-colors hover:border-brand-500/40 hover:text-foreground"
                    }
                  >
                    {s === "all" ? "All" : s}
                  </button>
                ))}
              </div>
            </div>
          </FiltersPill>
          <ToolbarPill icon={Download} href="/api/admin/inquiries?format=csv" download>
            Export
          </ToolbarPill>
        </div>
      </div>

      <div className="mt-4 overflow-hidden rounded-2xl border border-border bg-ink-850/85">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead>
              <tr className="border-b border-border/60 bg-ink-900/40">
                <SortHeader label="From" field="name" sort={sort.field} dir={sort.dir} onSort={onSort} />
                <SortHeader label="Company" field="company" sort={sort.field} dir={sort.dir} onSort={onSort} />
                <SortHeader label="Service interest" field="service" sort={sort.field} dir={sort.dir} onSort={onSort} />
                <SortHeader label="Received" field="createdAt" sort={sort.field} dir={sort.dir} onSort={onSort} />
                <SortHeader label="Status" field="status" sort={sort.field} dir={sort.dir} onSort={onSort} />
                <th className="h-11 w-14 px-4" aria-label="Actions" />
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={6} className="px-4 py-14 text-center text-sm text-muted-foreground">Loading inquiries…</td></tr>
              ) : visible.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-14 text-center text-sm text-muted-foreground">No inquiries match your search or filter.</td></tr>
              ) : (
                visible.map((r) => (
                  <tr
                    key={r.id}
                    onClick={() => setActive(r)}
                    className="cursor-pointer border-b border-border/40 transition-colors last:border-0 hover:bg-brand-500/[0.04]"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <span className="flex size-9 shrink-0 items-center justify-center rounded-full border border-brand-500/30 bg-brand-500/12 text-[11px] font-bold text-brand-accent">
                          {r.name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()}
                        </span>
                        <div className="min-w-0">
                          <p className="flex items-center gap-2 font-semibold text-foreground">
                            {r.name}
                            {r.status === "New" && (
                              <span className="size-2 rounded-full bg-amber-500" aria-label="New" />
                            )}
                          </p>
                          <p className="truncate text-[12px] text-muted-foreground">{r.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[13px] text-muted-foreground">{r.company || "—"}</td>
                    <td className="px-4 py-3 text-[13px] text-muted-foreground">{r.service || "—"}</td>
                    <td className="px-4 py-3 text-[13px] text-muted-foreground">{fmtDate(r.createdAt)}</td>
                    <td className="px-4 py-3">
                      {r.status === "New" ? (
                        <span className="inline-flex items-center rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-[11px] font-semibold text-amber-500">
                          New
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-500">
                          <Check className="size-3" /> Handled
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      <RowActions label={`Actions for ${r.name}`}>
                        <DropdownMenuItem onClick={() => setActive(r)} className="gap-2">
                          <Eye className="size-4" /> View details
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setStatus(r, r.status === "New" ? "Handled" : "New")}
                          className="gap-2"
                        >
                          {r.status === "New" ? <Check className="size-4" /> : <RotateCcw className="size-4" />}
                          {r.status === "New" ? "Mark handled" : "Mark new"}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-border/60" />
                        <DropdownMenuItem
                          onClick={() => remove(r)}
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

      {/* ---- Detail dialog ---- */}
      <Dialog open={!!active} onOpenChange={(o) => !o && setActive(null)}>
        <DialogContent className="bg-ink-900 sm:max-w-xl">
          {active && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2.5">
                  {active.name}
                  {active.status === "New" ? (
                    <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[10.5px] font-semibold text-amber-500">NEW</span>
                  ) : (
                    <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10.5px] font-semibold text-emerald-500">HANDLED</span>
                  )}
                </DialogTitle>
                <DialogDescription>
                  {active.email}
                  {active.company ? ` · ${active.company}` : ""} · {fmtDate(active.createdAt)}
                  {active.service ? ` · interested in ${active.service}` : ""}
                </DialogDescription>
              </DialogHeader>

              <div className="max-h-72 overflow-y-auto rounded-xl border border-border/70 bg-ink-900/60 p-4">
                <p className="whitespace-pre-wrap text-[14px] leading-relaxed text-foreground/90">{active.message}</p>
              </div>

              <DialogFooter className="gap-2 sm:gap-0">
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-9 text-red-500 hover:text-red-400"
                  aria-label="Delete inquiry"
                  onClick={() => remove(active)}
                >
                  <Trash2 className="size-4" />
                </Button>
                <div className="flex flex-1 flex-wrap items-center justify-end gap-2">
                  <Button variant="outline" className="gap-2" onClick={() => setStatus(active, active.status === "New" ? "Handled" : "New")}>
                    {active.status === "New" ? <Check className="size-4" /> : <RotateCcw className="size-4" />}
                    {active.status === "New" ? "Mark handled" : "Mark new"}
                  </Button>
                  <Button asChild className="gap-2">
                    <a href={`mailto:${active.email}?subject=Re: your AGMA TEC inquiry`}>
                      <Mail className="size-4" />
                      Reply by email
                    </a>
                  </Button>
                </div>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
