"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { CalendarDays, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  PageHeader,
  StatCard,
  StatusBadge,
  TablePagination,
  TableSummary,
  ToolbarSearch,
  FiltersPill,
  RowActions,
  fmtDate,
  Checkbox,
} from "./ui";

type Leave = {
  id: string;
  employeeName: string;
  empCode: string;
  department: string;
  type: string;
  fromDate: string;
  toDate: string;
  days: number;
  status: string;
  reason: string | null;
};

type ListResponse = {
  rows: Leave[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
  pending: number;
  approved: number;
  rejected: number;
};

const STATUSES = ["Pending", "Approved", "Rejected"];

export function LeaveClient() {
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
  const [search, setSearch] = useState("");
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    const t = setTimeout(() => {
      setQ(search.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [search]);

  const params = useMemo(() => {
    const sp = new URLSearchParams({ status, page: String(page), pageSize: "10" });
    if (q) sp.set("q", q);
    return sp;
  }, [q, status, page]);

  const { data, isLoading } = useQuery<ListResponse>({
    queryKey: ["leave", params.toString()],
    queryFn: async () => {
      const res = await fetch(`/api/admin/leave?${params}`);
      if (!res.ok) throw new Error("Failed to load leave requests");
      return res.json();
    },
    placeholderData: (prev) => prev,
  });

  const decide = async (leave: Leave, next: "Approved" | "Rejected") => {
    setBusyId(leave.id);
    try {
      const res = await fetch(`/api/admin/leave/${leave.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      if (!res.ok) throw new Error("Request failed");
      toast.success(`${leave.employeeName}'s ${leave.type.toLowerCase()} leave ${next.toLowerCase()}.`);
      qc.invalidateQueries({ queryKey: ["leave"] });
    } catch {
      toast.error("Could not update the request.");
    } finally {
      setBusyId(null);
    }
  };

  const rows = data?.rows ?? [];

  return (
    <>
      <PageHeader
        title="Leave Requests"
        description="Review, approve and reject employee leave applications."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Pending" value={data?.pending ?? "—"} icon={CalendarDays} tone="warning" />
        <StatCard label="Approved" value={data?.approved ?? "—"} icon={Check} tone="success" />
        <StatCard label="Rejected" value={data?.rejected ?? "—"} icon={X} tone="danger" />
        <StatCard label="Total Requests" value={data?.total ?? "—"} icon={CalendarDays} tone="brand" />
      </div>

      {/* toolbar — search left, filters pill right */}
      <div className="mt-6 flex flex-col gap-3 lg:flex-row lg:items-center">
        <ToolbarSearch
          value={search}
          onChange={setSearch}
          placeholder="Search employee or department…"
          label="Search leave requests"
        />
        <div className="flex flex-wrap items-center gap-2.5 lg:justify-end">
          <FiltersPill
            active={status !== "all" ? 1 : 0}
            onClear={() => {
              setStatus("all");
              setPage(1);
            }}
          >
            <div className="space-y-1.5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Status</p>
              <Select value={status} onValueChange={(v) => { setStatus(v); setPage(1); }}>
                <SelectTrigger className="h-9 w-full border-border bg-ink-850" aria-label="Filter by status">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  {STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </FiltersPill>
        </div>
      </div>

      {data && (
        <TableSummary
          page={data.page}
          pageCount={data.pageCount}
          total={data.total}
          pageSize={data.pageSize}
          onPage={setPage}
          selected={selected.size}
          onClearSelection={() => setSelected(new Set())}
        />
      )}

      <div className="overflow-hidden rounded-2xl border border-border bg-ink-850/85">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-sm">
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
                {["Employee", "Type", "From", "To", "Days", "Reason", "Status", "Actions"].map((h) => (
                  <th key={h} className="h-11 px-4 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={9} className="px-4 py-14 text-center text-sm text-muted-foreground">Loading requests…</td></tr>
              ) : rows.length === 0 ? (
                <tr><td colSpan={9} className="px-4 py-14 text-center text-sm text-muted-foreground">No leave requests match your filters.</td></tr>
              ) : (
                rows.map((l) => (
                  <tr key={l.id} className="border-b border-border/40 transition-colors last:border-0 hover:bg-brand-500/[0.04]">
                    <td className="pl-5 pr-1 align-middle" onClick={(e) => e.stopPropagation()}>
                      <Checkbox checked={ selected.has(l.id) } onChange={(on) => toggleRow(l.id, on)} label={`Select ${l.employeeName}`} />
                    </td>
                    <td className="px-4 py-3">
                      <span className="block font-semibold text-foreground">{l.employeeName}</span>
                      <span className="block text-[11.5px] text-muted-foreground">{l.empCode} · {l.department}</span>
                    </td>
                    <td className="px-4 py-3 text-foreground/80">{l.type}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">{fmtDate(l.fromDate)}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">{fmtDate(l.toDate)}</td>
                    <td className="px-4 py-3 font-semibold text-foreground/85">{l.days}</td>
                    <td className="max-w-44 truncate px-4 py-3 text-muted-foreground">{l.reason ?? "—"}</td>
                    <td className="px-4 py-3"><StatusBadge status={l.status} /></td>
                    <td className="px-4 py-3">
                      {l.status === "Pending" ? (
                        <RowActions label={`Actions for ${l.employeeName}`}>
                          <Button
                            size="sm"
                            className="h-8 gap-1.5 bg-emerald-600 px-3 text-white hover:bg-emerald-700"
                            disabled={busyId === l.id}
                            onClick={() => decide(l, "Approved")}
                          >
                            <Check className="size-3.5" /> Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 gap-1.5 border-red-500/40 px-3 text-red-500 hover:bg-red-500/10 hover:text-red-500"
                            disabled={busyId === l.id}
                            onClick={() => decide(l, "Rejected")}
                          >
                            <X className="size-3.5" /> Reject
                          </Button>
                        </RowActions>
                      ) : (
                        <span className="text-[12px] text-muted-foreground">Decided</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {data && (
          <TablePagination
            page={data.page}
            pageCount={data.pageCount}
            total={data.total}
            pageSize={data.pageSize}
            onPage={setPage}
          />
        )}
      </div>
    </>
  );
}
