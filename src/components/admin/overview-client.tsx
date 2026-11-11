"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  BadgeCheck,
  Banknote,
  CalendarClock,
  CirclePause,
  Clock3,
  UserPlus,
  Users,
} from "lucide-react";
import { PageHeader, StatCard, StatusBadge, fmtDate } from "./ui";

type Stats = {
  total: number;
  active: number;
  probation: number;
  suspended: number;
  expiringDocs: number;
  pendingLeaves: number;
  departments: { department: string; count: number }[];
  recentHires: {
    id: string; empCode: string; name: string; department: string;
    position: string; hireDate: string; status: string;
  }[];
  expiring: {
    id: string; empCode: string; name: string; department: string;
    idExpiry: string; idNumber: string | null;
  }[];
};

export function OverviewClient() {
  const { data, isLoading } = useQuery<Stats>({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const res = await fetch("/api/admin/stats");
      if (!res.ok) throw new Error("Failed to load stats");
      return res.json();
    },
  });

  if (isLoading || !data) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-32 animate-pulse rounded-2xl bg-ink-850/60" />
        ))}
      </div>
    );
  }

  const maxDept = Math.max(...data.departments.map((d) => d.count), 1);

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Workforce snapshot across the AGMA TEC organization."
      />

      {/* stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard label="Total Employees" value={data.total} icon={Users} tone="brand" hint="All registered records" />
        <StatCard label="Active" value={data.active} icon={BadgeCheck} tone="success" hint="Currently on duty" />
        <StatCard label="Probation" value={data.probation} icon={Clock3} tone="warning" hint="Under evaluation" />
        <StatCard label="Suspended" value={data.suspended} icon={CirclePause} tone="danger" hint="Temporary suspension" />
        <StatCard
          label="Docs Expiring"
          value={data.expiringDocs}
          icon={CalendarClock}
          tone="warning"
          hint="ID / Iqama within 60 days"
        />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        {/* department distribution */}
        <section className="rounded-2xl border border-border bg-ink-850/85 p-6 xl:col-span-1">
          <h2 className="font-display text-[15px] font-bold text-foreground">
            Department Distribution
          </h2>
          <ul className="mt-5 flex flex-col gap-3.5">
            {data.departments.map((d) => (
              <li key={d.department}>
                <div className="flex items-center justify-between text-[12.5px]">
                  <span className="font-medium text-foreground/85">{d.department}</span>
                  <span className="font-semibold text-muted-foreground">{d.count}</span>
                </div>
                <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-ink-800">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-brand-600 to-brand-400"
                    style={{ width: `${Math.round((d.count / maxDept) * 100)}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </section>

        {/* recent hires */}
        <section className="overflow-hidden rounded-2xl border border-border bg-ink-850/85 xl:col-span-2">
          <div className="flex items-center justify-between px-6 pb-1 pt-6">
            <h2 className="font-display text-[15px] font-bold text-foreground">
              Recent Hires
            </h2>
            <Link
              href="/admin/employees"
              className="text-[12.5px] font-medium text-brand-accent transition-colors hover:text-brand-accent-bright"
            >
              View all →
            </Link>
          </div>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[560px] text-sm">
              <thead>
                <tr className="border-y border-border/60 bg-ink-900/40">
                  {["Employee", "Department", "Position", "Hired", "Status"].map((h) => (
                    <th key={h} className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.recentHires.map((e) => (
                  <tr key={e.id} className="border-b border-border/40 transition-colors last:border-0 hover:bg-brand-500/[0.04]">
                    <td className="px-4 py-3">
                      <span className="block font-semibold text-foreground">{e.name}</span>
                      <span className="block text-[11.5px] text-muted-foreground">{e.empCode}</span>
                    </td>
                    <td className="px-4 py-3 text-foreground/80">{e.department}</td>
                    <td className="px-4 py-3 text-foreground/80">{e.position}</td>
                    <td className="px-4 py-3 text-muted-foreground">{fmtDate(e.hireDate)}</td>
                    <td className="px-4 py-3"><StatusBadge status={e.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        {/* expiring documents */}
        <section className="overflow-hidden rounded-2xl border border-border bg-ink-850/85 xl:col-span-2">
          <div className="flex items-center justify-between px-6 pb-1 pt-6">
            <h2 className="font-display text-[15px] font-bold text-foreground">
              Documents Expiring Soon
            </h2>
            <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-amber-500">
              {data.expiringDocs} within 60 days
            </span>
          </div>
          <ul className="mt-3 divide-y divide-border/40">
            {data.expiring.map((e) => {
              const days = Math.ceil((new Date(e.idExpiry).getTime() - Date.now()) / 86400000);
              return (
                <li key={e.id} className="flex items-center justify-between gap-3 px-6 py-3 transition-colors hover:bg-brand-500/[0.04]">
                  <div className="min-w-0">
                    <p className="truncate text-[13.5px] font-semibold text-foreground">{e.name}</p>
                    <p className="text-[11.5px] text-muted-foreground">
                      {e.empCode} · {e.department} · ID {e.idNumber ?? "—"}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-[12.5px] font-medium text-foreground/85">{fmtDate(e.idExpiry)}</p>
                    <p className={days <= 15 ? "text-[11px] font-semibold text-red-500" : "text-[11px] font-semibold text-amber-500"}>
                      in {days} days
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>

        {/* quick actions */}
        <section className="rounded-2xl border border-border bg-ink-850/85 p-6">
          <h2 className="font-display text-[15px] font-bold text-foreground">Quick Actions</h2>
          <div className="mt-5 flex flex-col gap-3">
            <Link
              href="/admin/employees"
              className="group flex items-center gap-3.5 rounded-xl border border-border bg-ink-900/50 p-4 transition-all duration-300 hover:border-brand-500/40 hover:bg-brand-500/[0.07]"
            >
              <span className="flex size-10 items-center justify-center rounded-xl border border-brand-500/25 bg-brand-500/10 text-brand-accent-bright">
                <UserPlus className="size-5" />
              </span>
              <span>
                <span className="block text-[13.5px] font-semibold text-foreground">Manage Employees</span>
                <span className="block text-[12px] text-muted-foreground">Add, edit, filter and export</span>
              </span>
            </Link>
            <Link
              href="/admin/leave"
              className="group flex items-center gap-3.5 rounded-xl border border-border bg-ink-900/50 p-4 transition-all duration-300 hover:border-brand-500/40 hover:bg-brand-500/[0.07]"
            >
              <span className="flex size-10 items-center justify-center rounded-xl border border-brand-500/25 bg-brand-500/10 text-brand-accent-bright">
                <CalendarClock className="size-5" />
              </span>
              <span>
                <span className="block text-[13.5px] font-semibold text-foreground">
                  Leave Requests
                  {data.pendingLeaves > 0 && (
                    <span className="ml-2 inline-flex rounded-full bg-amber-500/15 px-2 py-0.5 text-[10.5px] font-bold text-amber-500">
                      {data.pendingLeaves} pending
                    </span>
                  )}
                </span>
                <span className="block text-[12px] text-muted-foreground">Approve or reject requests</span>
              </span>
            </Link>
            <Link
              href="/admin/payroll"
              className="group flex items-center gap-3.5 rounded-xl border border-border bg-ink-900/50 p-4 transition-all duration-300 hover:border-brand-500/40 hover:bg-brand-500/[0.07]"
            >
              <span className="flex size-10 items-center justify-center rounded-xl border border-brand-500/25 bg-brand-500/10 text-brand-accent-bright">
                <Banknote className="size-5" />
              </span>
              <span>
                <span className="block text-[13.5px] font-semibold text-foreground">Payroll Runs</span>
                <span className="block text-[12px] text-muted-foreground">Monthly run history</span>
              </span>
            </Link>
          </div>
        </section>
      </div>
    </>
  );
}
