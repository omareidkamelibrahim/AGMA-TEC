"use client";

import Link from "next/link";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion, useReducedMotion } from "framer-motion";
import { toast } from "sonner";
import {
  ArrowUpRight,
  Banknote,
  CalendarClock,
  Check,
  CirclePause,
  Clock3,
  Download,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { PageHeader, StatCard, StatusBadge, fmtDate, fmtMoney } from "./ui";
import { AvatarInitials, HeadcountArea, PayrollBars, StatusDonut } from "./overview-charts";
import { Button } from "@/components/ui/button";

type Stats = {
  total: number;
  active: number;
  probation: number;
  suspended: number;
  expiringDocs: number;
  pendingLeaves: number;
  hires30: number;
  hiresPrev30: number;
  departments: { department: string; count: number }[];
  statusMix: { status: string; count: number }[];
  headcountTrend: { label: string; count: number }[];
  payrollTrend: { reference: string; label: string; net: number; employees: number; status: string }[];
  recentHires: {
    id: string; empCode: string; name: string; department: string;
    position: string; hireDate: string; status: string;
  }[];
  expiring: {
    id: string; empCode: string; name: string; department: string;
    idExpiry: string; idNumber: string | null;
  }[];
  pendingLeaveItems: {
    id: string; employeeName: string; empCode: string; department: string;
    type: string; fromDate: string; toDate: string; days: number; createdAt: string;
  }[];
};

const EASE = [0.22, 1, 0.36, 1] as const;

/** Staggered fade-up wrapper (fade only when reduced motion is preferred). */
function Section({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const reduced = useReducedMotion();
  return (
    <motion.section
      initial={{ opacity: 0, y: reduced ? 0 : 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reduced ? 0.25 : 0.55, delay, ease: EASE }}
      className={className}
    >
      {children}
    </motion.section>
  );
}

/** Card header: title + subtitle on the left, action on the right. */
function CardHead({
  title,
  sub,
  action,
}: {
  title: string;
  sub?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-3 px-6 pb-4 pt-5">
      <div>
        <h2 className="font-display text-[15px] font-bold text-foreground">{title}</h2>
        {sub && <p className="mt-0.5 text-[12px] text-muted-foreground">{sub}</p>}
      </div>
      {action}
    </div>
  );
}

const LEAVE_TYPE_STYLES: Record<string, string> = {
  Annual: "border-brand-500/30 bg-brand-500/10 text-brand-accent-bright",
  Sick: "border-violet-500/30 bg-violet-500/10 text-violet-400",
  Unpaid: "border-border bg-ink-800/70 text-muted-foreground",
  Emergency: "border-red-500/30 bg-red-500/10 text-red-400",
};

function LeaveTypeBadge({ type }: { type: string }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full border px-2.5 py-0.5 text-[11px] font-semibold",
        LEAVE_TYPE_STYLES[type] ?? LEAVE_TYPE_STYLES.Unpaid,
      )}
    >
      {type}
    </span>
  );
}

export function OverviewClient() {
  const qc = useQueryClient();
  const [busyId, setBusyId] = useState<string | null>(null);

  const { data, isLoading } = useQuery<Stats>({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const res = await fetch("/api/admin/stats");
      if (!res.ok) throw new Error("Failed to load stats");
      return res.json();
    },
  });

  const decide = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: "Approved" | "Rejected" }) => {
      const res = await fetch(`/api/admin/leave/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onMutate: ({ id }) => setBusyId(id),
    onSettled: () => setBusyId(null),
    onSuccess: (_d, { status }) => {
      toast.success(`Request ${status.toLowerCase()}.`);
      qc.invalidateQueries({ queryKey: ["admin-stats"] });
    },
    onError: () => toast.error("Could not update the request."),
  });

  if (isLoading || !data) {
    return (
      <div className="flex flex-col gap-6">
        <div className="h-9 w-56 animate-pulse rounded-lg bg-ink-850/60" />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-[104px] animate-pulse rounded-2xl bg-ink-850/60" />
          ))}
        </div>
        <div className="grid gap-6 xl:grid-cols-3">
          <div className="h-[340px] animate-pulse rounded-2xl bg-ink-850/60 xl:col-span-2" />
          <div className="h-[340px] animate-pulse rounded-2xl bg-ink-850/60" />
        </div>
        <div className="grid gap-6 xl:grid-cols-3">
          <div className="h-[300px] animate-pulse rounded-2xl bg-ink-850/60 xl:col-span-2" />
          <div className="h-[300px] animate-pulse rounded-2xl bg-ink-850/60" />
        </div>
      </div>
    );
  }

  const activeRate = data.total ? Math.round((data.active / data.total) * 100) : 0;
  const maxDept = Math.max(...data.departments.map((d) => d.count), 1);
  const payrollTotal = data.payrollTrend.reduce((s, r) => s + r.net, 0);
  const latestRun = data.payrollTrend[data.payrollTrend.length - 1];

  const hiringDelta = {
    text: data.hires30 > 0 ? `${data.hires30} new · 30d` : "no hires · 30d",
    dir: (data.hires30 > data.hiresPrev30 ? "up" : data.hires30 < data.hiresPrev30 ? "down" : "flat") as "up" | "down" | "flat",
  };

  return (
    <>
      <Section delay={0}>
        <PageHeader
          title="Dashboard"
          description="Live workforce snapshot across the AGMA TEC organization."
          actions={
            <>
              <Button asChild variant="outline" className="rounded-lg border-border bg-ink-850/70 text-[12.5px] font-semibold hover:text-foreground">
                <a href="/api/admin/employees/export" download>
                  <Download className="size-4" />
                  Export CSV
                </a>
              </Button>
              <Button asChild className="rounded-lg bg-brand-600 text-[12.5px] font-semibold text-white hover:bg-brand-500">
                <Link href="/admin/employees">
                  <UserPlus className="size-4" />
                  Add Employee
                </Link>
              </Button>
            </>
          }
        />
      </Section>

      {/* KPI cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {[
          <StatCard key="t" label="Total Employees" value={data.total} icon={Users} tone="brand"
            hint="All registered records" delta={hiringDelta} spark={data.headcountTrend.map((d) => d.count)} />,
          <StatCard key="a" label="Active" value={data.active} icon={Check} tone="success"
            hint={`${activeRate}% of workforce on duty`} />,
          <StatCard key="p" label="Probation" value={data.probation} icon={Clock3} tone="warning"
            hint="Under evaluation" />,
          <StatCard key="s" label="Suspended" value={data.suspended} icon={CirclePause} tone="danger"
            hint="Temporary suspension" />,
          <StatCard key="e" label="Docs Expiring" value={data.expiringDocs} icon={CalendarClock} tone="warning"
            hint="ID / Iqama within 60 days" />,
        ].map((card, i) => (
          <Section key={i} delay={0.05 + i * 0.05}>
            {card}
          </Section>
        ))}
      </div>

      {/* headcount growth + composition */}
      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <Section delay={0.25} className="xl:col-span-2">
          <div className="rounded-2xl border border-border bg-ink-850/85 pb-4">
            <CardHead
              title="Headcount Growth"
              sub="Cumulative team size · last 12 months"
              action={
                <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-500/30 bg-brand-500/10 px-2.5 py-1 text-[11px] font-semibold text-brand-accent-bright">
                  <ArrowUpRight className="size-3.5" />
                  +{data.hires30} in 30 days
                </span>
              }
            />
            <div className="px-3">
              <HeadcountArea data={data.headcountTrend} />
            </div>
          </div>
        </Section>

        <Section delay={0.3}>
          <div className="rounded-2xl border border-border bg-ink-850/85 p-6">
            <CardHead title="Workforce Composition" sub="Employment status split" />
            <StatusDonut data={data.statusMix} />
          </div>
        </Section>
      </div>

      {/* pending approvals + payroll */}
      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <Section delay={0.1} className="xl:col-span-2">
          <div className="overflow-hidden rounded-2xl border border-border bg-ink-850/85">
            <CardHead
              title="Pending Leave Approvals"
              sub={data.pendingLeaves > 0 ? `${data.pendingLeaves} request${data.pendingLeaves === 1 ? "" : "s"} waiting for a decision` : "Nothing waiting on you"}
              action={
                <Link
                  href="/admin/leave"
                  className="text-[12.5px] font-medium text-brand-accent transition-colors hover:text-brand-accent-bright"
                >
                  Review all →
                </Link>
              }
            />
            {data.pendingLeaveItems.length === 0 ? (
              <div className="flex flex-col items-center gap-2 border-t border-border/50 px-6 py-10 text-center">
                <span className="flex size-10 items-center justify-center rounded-full border border-emerald-500/25 bg-emerald-500/10 text-emerald-500">
                  <Check className="size-5" />
                </span>
                <p className="text-[13.5px] font-semibold text-foreground">All caught up</p>
                <p className="text-[12px] text-muted-foreground">No pending leave requests right now.</p>
              </div>
            ) : (
              <ul className="divide-y divide-border/40 border-t border-border/50">
                {data.pendingLeaveItems.map((l) => (
                  <li key={l.id} className="flex flex-wrap items-center gap-3 px-6 py-3.5 transition-colors hover:bg-brand-500/[0.04]">
                    <AvatarInitials name={l.employeeName} />
                    <div className="min-w-0 flex-1 basis-40">
                      <p className="truncate text-[13.5px] font-semibold text-foreground">{l.employeeName}</p>
                      <p className="text-[11.5px] text-muted-foreground">{l.empCode} · {l.department}</p>
                    </div>
                    <div className="hidden min-w-0 sm:block">
                      <LeaveTypeBadge type={l.type} />
                    </div>
                    <div className="hidden text-right md:block">
                      <p className="text-[12.5px] font-medium text-foreground/85">{fmtDate(l.fromDate)} → {fmtDate(l.toDate)}</p>
                      <p className="text-[11px] text-muted-foreground">{l.days} day{l.days === 1 ? "" : "s"}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        disabled={busyId === l.id}
                        onClick={() => decide.mutate({ id: l.id, status: "Approved" })}
                        aria-label={`Approve ${l.employeeName}'s leave`}
                        className="inline-flex size-8 items-center justify-center rounded-lg border border-emerald-500/35 bg-emerald-500/10 text-emerald-500 transition-colors hover:bg-emerald-500/20 disabled:opacity-40"
                      >
                        <Check className="size-4" />
                      </button>
                      <button
                        type="button"
                        disabled={busyId === l.id}
                        onClick={() => decide.mutate({ id: l.id, status: "Rejected" })}
                        aria-label={`Reject ${l.employeeName}'s leave`}
                        className="inline-flex size-8 items-center justify-center rounded-lg border border-red-500/35 bg-red-500/10 text-red-500 transition-colors hover:bg-red-500/20 disabled:opacity-40"
                      >
                        <X className="size-4" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Section>

        <Section delay={0.15}>
          <div className="rounded-2xl border border-border bg-ink-850/85 p-6">
            <CardHead
              title="Recent Payroll Runs"
              sub={latestRun ? `Latest ${latestRun.reference}` : "No runs yet"}
              action={
                <Link
                  href="/admin/payroll"
                  className="text-[12.5px] font-medium text-brand-accent transition-colors hover:text-brand-accent-bright"
                >
                  All runs →
                </Link>
              }
            />
            {data.payrollTrend.length > 0 ? (
              <>
                <PayrollBars data={data.payrollTrend} />
                <div className="mt-4 flex items-center justify-between border-t border-border/50 pt-3.5">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Total net · {data.payrollTrend.length} runs</p>
                    <p className="mt-0.5 font-display text-[15px] font-bold text-foreground">{fmtMoney(payrollTotal)}</p>
                  </div>
                  {latestRun && <StatusBadge status={latestRun.status} />}
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center gap-2 py-8 text-center">
                <Banknote className="size-6 text-muted-foreground" />
                <p className="text-[12.5px] text-muted-foreground">No payroll runs recorded yet.</p>
              </div>
            )}
          </div>
        </Section>
      </div>

      {/* recent hires + departments */}
      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <Section delay={0.1} className="xl:col-span-2">
          <div className="overflow-hidden rounded-2xl border border-border bg-ink-850/85">
            <CardHead
              title="Recent Hires"
              sub="Latest additions to the team"
              action={
                <Link
                  href="/admin/employees"
                  className="text-[12.5px] font-medium text-brand-accent transition-colors hover:text-brand-accent-bright"
                >
                  View all →
                </Link>
              }
            />
            <div className="overflow-x-auto border-t border-border/50">
              <table className="w-full min-w-[560px] text-sm">
                <thead>
                  <tr className="border-b border-border/60 bg-ink-900/40">
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
                        <span className="flex items-center gap-3">
                          <AvatarInitials name={e.name} />
                          <span>
                            <span className="block font-semibold text-foreground">{e.name}</span>
                            <span className="block text-[11.5px] text-muted-foreground">{e.empCode}</span>
                          </span>
                        </span>
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
          </div>
        </Section>

        <Section delay={0.15}>
          <div className="rounded-2xl border border-border bg-ink-850/85 p-6">
            <CardHead title="Department Distribution" sub="Headcount by department" />
            <ul className="flex flex-col gap-3.5">
              {data.departments.map((d) => (
                <li key={d.department}>
                  <div className="flex items-center justify-between text-[12.5px]">
                    <span className="font-medium text-foreground/85">{d.department}</span>
                    <span className="font-semibold text-muted-foreground">
                      {d.count} <span className="text-muted-foreground/60">· {Math.round((d.count / data.total) * 100)}%</span>
                    </span>
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
          </div>
        </Section>
      </div>

      {/* expiring docs + quick actions */}
      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <Section delay={0.1} className="xl:col-span-2">
          <div className="overflow-hidden rounded-2xl border border-border bg-ink-850/85">
            <CardHead
              title="Documents Expiring Soon"
              sub="ID / Iqama renewals within 60 days"
              action={
                <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-amber-500">
                  {data.expiringDocs} tracked
                </span>
              }
            />
            {data.expiring.length === 0 ? (
              <div className="flex flex-col items-center gap-2 border-t border-border/50 px-6 py-10 text-center">
                <span className="flex size-10 items-center justify-center rounded-full border border-emerald-500/25 bg-emerald-500/10 text-emerald-500">
                  <Check className="size-5" />
                </span>
                <p className="text-[13.5px] font-semibold text-foreground">No renewals due</p>
                <p className="text-[12px] text-muted-foreground">All identity documents are valid for 60+ days.</p>
              </div>
            ) : (
              <ul className="divide-y divide-border/40 border-t border-border/50">
                {data.expiring.map((e) => {
                  const days = Math.ceil((new Date(e.idExpiry).getTime() - Date.now()) / 86400000);
                  const urgent = days <= 15;
                  return (
                    <li key={e.id} className="flex items-center gap-4 px-6 py-3.5 transition-colors hover:bg-brand-500/[0.04]">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[13.5px] font-semibold text-foreground">{e.name}</p>
                        <p className="text-[11.5px] text-muted-foreground">
                          {e.empCode} · {e.department} · ID {e.idNumber ?? "—"}
                        </p>
                      </div>
                      <div className="hidden w-28 shrink-0 sm:block">
                        <div className="h-1 overflow-hidden rounded-full bg-ink-800">
                          <div
                            className={cn("h-full rounded-full", urgent ? "bg-red-500" : "bg-amber-500")}
                            style={{ width: `${Math.max(4, Math.min(100, (days / 60) * 100))}%` }}
                          />
                        </div>
                        <p className="mt-1 text-right text-[10.5px] font-semibold text-muted-foreground">
                          {days}/60 days
                        </p>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="text-[12.5px] font-medium text-foreground/85">{fmtDate(e.idExpiry)}</p>
                        <p className={urgent ? "text-[11px] font-semibold text-red-500" : "text-[11px] font-semibold text-amber-500"}>
                          in {days} days
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </Section>

        <Section delay={0.15}>
          <div className="rounded-2xl border border-border bg-ink-850/85 p-6">
            <CardHead title="Quick Actions" sub="Jump straight into workflows" />
            <div className="flex flex-col gap-3">
              {[
                { href: "/admin/employees", icon: UserPlus, title: "Manage Employees", sub: "Add, edit, filter and export" },
                { href: "/admin/leave", icon: CalendarClock, title: "Leave Requests", sub: "Approve or reject requests", badge: data.pendingLeaves },
                { href: "/admin/payroll", icon: Banknote, title: "Payroll Runs", sub: "Monthly run history" },
              ].map((a) => (
                <Link
                  key={a.href}
                  href={a.href}
                  className="group flex items-center gap-3.5 rounded-xl border border-border bg-ink-900/50 p-4 transition-all duration-300 hover:border-brand-500/40 hover:bg-brand-500/[0.07]"
                >
                  <span className="flex size-10 items-center justify-center rounded-xl border border-brand-500/25 bg-brand-500/10 text-brand-accent-bright">
                    <a.icon className="size-5" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[13.5px] font-semibold text-foreground">
                      {a.title}
                      {a.badge ? (
                        <span className="ml-2 inline-flex rounded-full bg-amber-500/15 px-2 py-0.5 text-[10.5px] font-bold text-amber-500">
                          {a.badge} pending
                        </span>
                      ) : null}
                    </span>
                    <span className="block text-[12px] text-muted-foreground">{a.sub}</span>
                  </span>
                  <ArrowUpRight className="ml-auto size-4 shrink-0 text-muted-foreground/50 transition-all duration-300 group-hover:translate-x-0.5 group-hover:text-brand-accent" />
                </Link>
              ))}
            </div>
          </div>
        </Section>
      </div>
    </>
  );
}
