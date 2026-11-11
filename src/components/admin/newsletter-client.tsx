"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Download, Mail, Megaphone, Trash2, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader, StatCard, fmtDate } from "./ui";

type Subscriber = {
  id: string;
  email: string;
  createdAt: string;
};

type Payload = { rows: Subscriber[]; stats: { total: number; last30: number } };

export function NewsletterClient() {
  const qc = useQueryClient();

  const { data, isLoading } = useQuery<Payload>({
    queryKey: ["admin-newsletter"],
    queryFn: async () => {
      const res = await fetch("/api/admin/newsletter");
      if (!res.ok) throw new Error("Failed to load subscribers");
      return res.json();
    },
  });
  const rows = data?.rows ?? [];
  const stats = data?.stats;

  const remove = async (row: Subscriber) => {
    if (!window.confirm(`Unsubscribe ${row.email}?`)) return;
    const res = await fetch(`/api/admin/newsletter/${row.id}`, { method: "DELETE" });
    if (!res.ok) {
      toast.error("Failed to remove subscriber.");
      return;
    }
    toast.success(`${row.email} removed.`);
    qc.invalidateQueries({ queryKey: ["admin-newsletter"] });
  };

  return (
    <>
      <PageHeader
        title="Newsletter"
        description="Visitors who subscribed through the website footer form."
        actions={
          <a
            href="/api/admin/newsletter?format=csv"
            download
            className="inline-flex h-9 items-center gap-2 rounded-lg border border-border bg-ink-850/70 px-4 text-[13px] font-medium text-foreground transition-colors hover:border-brand-500/40"
          >
            <Download className="size-4" />
            Export CSV
          </a>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <StatCard label="Subscribers" value={stats?.total ?? "—"} icon={Megaphone} tone="brand" />
        <StatCard label="New — last 30 days" value={stats?.last30 ?? "—"} icon={UserPlus} tone="success" />
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-border bg-ink-850/85">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-sm">
            <thead>
              <tr className="border-b border-border/60 bg-ink-900/40">
                {["Email", "Subscribed", "Actions"].map((h) => (
                  <th key={h} className="h-11 px-4 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={3} className="px-4 py-14 text-center text-sm text-muted-foreground">Loading subscribers…</td></tr>
              ) : rows.length === 0 ? (
                <tr><td colSpan={3} className="px-4 py-14 text-center text-sm text-muted-foreground">No subscribers yet — footer sign-ups will appear here.</td></tr>
              ) : (
                rows.map((r) => (
                  <tr key={r.id} className="border-b border-border/40 transition-colors last:border-0 hover:bg-brand-500/[0.04]">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <span className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-brand-500/25 bg-brand-500/10 text-brand-accent">
                          <Mail className="size-4" />
                        </span>
                        <span className="font-medium text-foreground">{r.email}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[13px] text-muted-foreground">{fmtDate(r.createdAt)}</td>
                    <td className="px-4 py-3">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 text-red-500 hover:text-red-400"
                        onClick={() => remove(r)}
                        aria-label={`Unsubscribe ${r.email}`}
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
    </>
  );
}
