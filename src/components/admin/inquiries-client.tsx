"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Check,
  Download,
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
import { PageHeader, StatCard, fmtDate } from "./ui";

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
        actions={
          <a
            href="/api/admin/inquiries?format=csv"
            download
            className="inline-flex h-9 items-center gap-2 rounded-lg border border-border bg-ink-850/70 px-4 text-[13px] font-medium text-foreground transition-colors hover:border-brand-500/40"
          >
            <Download className="size-4" />
            Export CSV
          </a>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="New inquiries" value={stats?.newCount ?? "—"} icon={Inbox} tone={stats && stats.newCount > 0 ? "warning" : "neutral"} />
        <StatCard label="Last 30 days" value={stats?.last30 ?? "—"} icon={MessageSquare} tone="brand" />
        <StatCard label="All time" value={stats?.total ?? "—"} icon={Mail} tone="neutral" />
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-border bg-ink-850/85">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead>
              <tr className="border-b border-border/60 bg-ink-900/40">
                {["From", "Company", "Service interest", "Received", "Status"].map((h) => (
                  <th key={h} className="h-11 px-4 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={5} className="px-4 py-14 text-center text-sm text-muted-foreground">Loading inquiries…</td></tr>
              ) : rows.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-14 text-center text-sm text-muted-foreground">No inquiries yet — submissions from the contact form will appear here.</td></tr>
              ) : (
                rows.map((r) => (
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
