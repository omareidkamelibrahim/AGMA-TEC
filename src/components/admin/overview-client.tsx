"use client";

import Link from "next/link";
import { useState, useSyncExternalStore } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowUpRight,
  BellRing,
  Download,
  Globe,
  Handshake,
  Inbox,
  MailPlus,
  Megaphone,
  Minus,
  Package,
  Quote,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Users,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Sparkline, StatusBadge, fmtMoney } from "./ui";
import { AvatarInitials, ENGAGEMENT_LEGEND_ENTRIES, EngagementArea, MiniDonut } from "./overview-charts";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";

/* ------------------------------------------------------------------ */
/* Types (mirror /api/admin/stats?scope=website)                        */
/* ------------------------------------------------------------------ */

type Delta = { text: string; dir: "up" | "down" | "flat" } | null;

type WebsiteStats = {
  scope: "website";
  rangeDays: number;
  kpis: {
    products: { count: number; published: number };
    services: { count: number; published: number };
    testimonials: { count: number; published: number };
    clients: { count: number; published: number };
    inquiries: { total: number; unread: number; now: number; prev: number };
    subscribers: { total: number; now: number; prev: number };
  };
  series: { key: string; label: string; inquiries: number; handled: number; subscribers: number }[];
  contentSpark: { products: number[]; services: number[]; testimonials: number[]; clients: number[] };
  byInterest: { label: string; count: number }[];
  topInterest: { label: string; count: number }[];
  statusMix: { status: string; count: number }[];
  contentMix: { type: string; count: number }[];
  latestInquiries: {
    id: string; name: string; email: string; company: string | null;
    service: string | null; status: string; createdAt: string;
  }[];
  activity: { kind: string; title: string; sub: string; at: string }[];
  workforce: {
    headcount: number; active: number; pendingLeaves: number; expiringDocs: number;
    payroll: { reference: string; period: string; net: number; status: string } | null;
  };
};

type WorkforceStats = {
  total: number;
  active: number;
  expiringDocs: number;
  pendingLeaves: number;
  payrollTrend: { net: number; status: string }[];
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

/** Card header: title left, action right. */
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
    <div className="flex items-start justify-between gap-3 px-5 pb-4 pt-5">
      <div>
        <h2 className="font-display text-[15px] font-bold text-foreground">{title}</h2>
        {sub && <p className="mt-0.5 text-[12px] text-muted-foreground">{sub}</p>}
      </div>
      {action}
    </div>
  );
}

function ViewAll({ href, children = "View all" }: { href: string; children?: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="shrink-0 text-[12px] font-semibold text-brand-accent transition-colors hover:text-brand-accent-bright"
    >
      {children}
    </Link>
  );
}

const emptySubscribe = () => () => {};

/* ------------------------------------------------------------------ */
/* KPI card (photo style: icon tile, big number, delta chip, sparkline) */
/* ------------------------------------------------------------------ */

function KpiCard({
  label,
  value,
  icon: Icon,
  delta,
  spark,
  hint,
}: {
  label: string;
  value: string | number;
  icon: LucideIcon;
  delta?: Delta;
  spark?: number[];
  hint?: string;
}) {
  const DeltaIcon = delta?.dir === "up" ? TrendingUp : delta?.dir === "down" ? TrendingDown : Minus;
  return (
    <div className="card-lift rounded-2xl border border-border bg-ink-850/85 p-4.5">
      <div className="flex items-center gap-2.5">
        <span className="flex size-8.5 shrink-0 items-center justify-center rounded-lg border border-brand-500/25 bg-brand-500/12 text-brand-accent-bright">
          <Icon className="size-4" />
        </span>
        <p className="truncate text-[11.5px] font-semibold text-muted-foreground">{label}</p>
      </div>
      <p className="mt-3 font-display text-[26px] font-bold leading-none text-foreground">{value}</p>
      <div className="mt-2.5 flex items-end justify-between gap-2">
        <div className="min-w-0">
          {delta ? (
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-[10px] font-bold",
                delta.dir === "up"
                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-500"
                  : delta.dir === "down"
                    ? "border-red-500/30 bg-red-500/10 text-red-500"
                    : "border-border bg-ink-800/60 text-muted-foreground",
              )}
            >
              <DeltaIcon className="size-2.5" />
              {delta.text}
            </span>
          ) : null}
          {hint && <p className="mt-1 truncate text-[10.5px] text-muted-foreground">{hint}</p>}
        </div>
        {spark && spark.length > 1 && <Sparkline points={spark} tone="brand" />}
      </div>
    </div>
  );
}

/** Percentage delta vs the previous equivalent period (null when unchanged). */
function pctDelta(now: number, prev: number): Delta {
  if (now === prev) return { text: "0% vs prev", dir: "flat" };
  if (prev === 0) return { text: `+${now} this period`, dir: now > 0 ? "up" : "flat" };
  const pct = Math.round(((now - prev) / prev) * 100);
  return { text: `${pct > 0 ? "+" : ""}${pct}% vs prev`, dir: pct > 0 ? "up" : "down" };
}

/* ------------------------------------------------------------------ */
/* relative time (client-only data, so no hydration concerns)          */
/* ------------------------------------------------------------------ */

function fmtRel(iso: string): string {
  const s = Math.max(0, Date.now() - new Date(iso).getTime()) / 1000;
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)} min ago`;
  if (s < 86400) return `${Math.floor(s / 3600)} h ago`;
  return `${Math.floor(s / 86400)} d ago`;
}

/* ------------------------------------------------------------------ */
/* main                                                                */
/* ------------------------------------------------------------------ */

const RANGES = [
  { value: "7", label: "Last 7 days" },
  { value: "30", label: "Last 30 days" },
  { value: "90", label: "Last 90 days" },
] as const;

function useMounted() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
}

const ACTIVITY_STYLES: Record<string, { icon: LucideIcon; cls: string }> = {
  inquiry: { icon: Inbox, cls: "border-brand-500/25 bg-brand-500/10 text-brand-accent-bright" },
  subscriber: { icon: MailPlus, cls: "border-cyan-500/25 bg-cyan-500/10 text-cyan-400" },
  product: { icon: Package, cls: "border-violet-500/25 bg-violet-500/10 text-violet-400" },
  service: { icon: Sparkles, cls: "border-emerald-500/25 bg-emerald-500/10 text-emerald-500" },
  testimonial: { icon: Quote, cls: "border-amber-500/25 bg-amber-500/10 text-amber-500" },
};

export function OverviewClient() {
  const mounted = useMounted();
  const [range, setRange] = useState("30");

  const { data, isLoading } = useQuery<WebsiteStats>({
    queryKey: ["admin-stats-website", range],
    queryFn: async () => {
      const res = await fetch(`/api/admin/stats?scope=website&range=${range}`);
      if (!res.ok) throw new Error("Failed to load stats");
      return res.json();
    },
  });

  const { data: wf } = useQuery<WorkforceStats>({
    queryKey: ["admin-stats-workforce"],
    queryFn: async () => {
      const res = await fetch("/api/admin/stats");
      if (!res.ok) throw new Error("Failed to load workforce stats");
      return res.json();
    },
  });

  /* greeting depends on the client clock — deterministic placeholder on the
     server, real greeting swapped in after hydration */
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const today = new Date().toLocaleDateString("en-GB", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });

  if (isLoading || !data) {
    return (
      <div className="flex flex-col gap-6">
        <div className="h-10 w-72 animate-pulse rounded-lg bg-ink-850/60" />
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 2xl:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-[118px] animate-pulse rounded-2xl bg-ink-850/60" />
          ))}
        </div>
        <div className="grid gap-6 xl:grid-cols-3">
          <div className="h-[360px] animate-pulse rounded-2xl bg-ink-850/60 xl:col-span-2" />
          <div className="h-[360px] animate-pulse rounded-2xl bg-ink-850/60" />
        </div>
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-[300px] animate-pulse rounded-2xl bg-ink-850/60" />
          ))}
        </div>
      </div>
    );
  }

  const k = data.kpis;
  const totals = data.series.reduce(
    (acc, d) => ({
      inquiries: acc.inquiries + d.inquiries,
      handled: acc.handled + d.handled,
      subscribers: acc.subscribers + d.subscribers,
    }),
    { inquiries: 0, handled: 0, subscribers: 0 },
  );
  const handleRate = totals.inquiries ? Math.round((totals.handled / totals.inquiries) * 100) : 0;
  const maxInterest = Math.max(...data.byInterest.map((d) => d.count), 1);
  const contentTotal = data.contentMix.reduce((s, d) => s + d.count, 0);

  return (
    <>
      {/* ── greeting header ─────────────────────────────────────── */}
      <Section delay={0}>
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">
              {mounted ? `${greeting}, Admin 👋` : "Welcome back, Admin 👋"}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {mounted ? today : "Here's what's happening across your website today."}
            </p>
          </div>
          <div className="w-44">
            <Select value={range} onValueChange={setRange}>
              <SelectTrigger aria-label="Date range" className="bg-ink-850/70 text-[12.5px] font-semibold">
                {RANGES.find((r) => r.value === range)?.label}
              </SelectTrigger>
              <SelectContent className="bg-ink-900">
                {RANGES.map((r) => (
                  <SelectItem key={r.value} value={r.value}>
                    {r.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </Section>

      {/* ── KPI cards ───────────────────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 2xl:grid-cols-6">
        {[
          <KpiCard key="p" label="Products" value={k.products.count} icon={Package}
            hint={`${k.products.published} live on the site`} spark={data.contentSpark.products} />,
          <KpiCard key="s" label="Services" value={k.services.count} icon={Sparkles}
            hint={`${k.services.published} live on the site`} spark={data.contentSpark.services} />,
          <KpiCard key="t" label="Testimonials" value={k.testimonials.count} icon={Quote}
            hint={`${k.testimonials.published} published`} spark={data.contentSpark.testimonials} />,
          <KpiCard key="c" label="Clients & Partners" value={k.clients.count} icon={Handshake}
            hint={`${k.clients.published} published`} spark={data.contentSpark.clients} />,
          <KpiCard key="i" label="Inquiries" value={k.inquiries.total} icon={Inbox}
            delta={pctDelta(k.inquiries.now, k.inquiries.prev)}
            hint={`${k.inquiries.unread} awaiting reply`} spark={data.series.map((d) => d.inquiries)} />,
          <KpiCard key="n" label="Subscribers" value={k.subscribers.total} icon={Megaphone}
            delta={pctDelta(k.subscribers.now, k.subscribers.prev)}
            hint="Footer newsletter list" spark={data.series.map((d) => d.subscribers)} />,
        ].map((card, i) => (
          <Section key={i} delay={0.04 + i * 0.04}>
            {card}
          </Section>
        ))}
      </div>

      {/* ── engagement overview + requests by interest ──────────── */}
      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <Section delay={0.2} className="xl:col-span-2">
          <div className="rounded-2xl border border-border bg-ink-850/85 pb-5">
            <CardHead
              title="Engagement Overview"
              sub={`Inquiries, replies and signups · last ${data.rangeDays} days`}
            />
            <div className="px-3">
              <EngagementArea data={data.series} />
            </div>
            {/* legend + period totals, like the reference hero */}
            <div className="mt-2 grid grid-cols-2 gap-3 px-6 sm:grid-cols-4">
              {ENGAGEMENT_LEGEND_ENTRIES().map((s) => (
                <div key={s.key}>
                  <p className="flex items-center gap-1.5 text-[11.5px] font-medium text-muted-foreground">
                    <span className="size-2 rounded-full" style={{ background: s.color }} />
                    {s.label}
                  </p>
                  <p className="mt-1 font-display text-xl font-bold text-foreground">
                    {totals[s.key].toLocaleString("en-US")}
                  </p>
                </div>
              ))}
              <div>
                <p className="text-[11.5px] font-medium text-muted-foreground">Handle rate</p>
                <p className="mt-1 font-display text-xl font-bold text-foreground">{handleRate}%</p>
              </div>
            </div>
          </div>
        </Section>

        <Section delay={0.25}>
          <div className="flex h-full flex-col rounded-2xl border border-border bg-ink-850/85 pb-5">
            <CardHead
              title="Requests by Interest"
              sub="What visitors ask about"
              action={<ViewAll href="/admin/inquiries">All inquiries</ViewAll>}
            />
            {data.byInterest.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-2 px-6 py-10 text-center">
                <Inbox className="size-6 text-muted-foreground" />
                <p className="text-[12.5px] text-muted-foreground">No inquiries yet.</p>
              </div>
            ) : (
              <ul className="flex flex-1 flex-col gap-3.5 px-6">
                {data.byInterest.map((d) => (
                  <li key={d.label}>
                    <div className="flex items-center justify-between text-[12.5px]">
                      <span className="truncate pr-3 font-medium text-foreground/85">{d.label}</span>
                      <span className="shrink-0 font-semibold text-muted-foreground">
                        {d.count} <span className="text-muted-foreground/60">· {Math.round((d.count / Math.max(k.inquiries.total, 1)) * 100)}%</span>
                      </span>
                    </div>
                    <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-ink-800">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-brand-600 to-brand-300"
                        style={{ width: `${Math.round((d.count / maxInterest) * 100)}%` }}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Section>
      </div>

      {/* ── attention + ranked + status donut + quick actions ───── */}
      <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {/* latest inquiries */}
        <Section delay={0.08}>
          <div className="flex h-full flex-col rounded-2xl border border-border bg-ink-850/85">
            <CardHead title="Needs Attention" sub="Latest inquiries" action={<ViewAll href="/admin/inquiries" />} />
            {data.latestInquiries.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-2 border-t border-border/50 px-5 py-10 text-center">
                <BellRing className="size-6 text-muted-foreground" />
                <p className="text-[12.5px] text-muted-foreground">Inbox is clear — no inquiries yet.</p>
              </div>
            ) : (
              <ul className="divide-y divide-border/40 border-t border-border/50">
                {data.latestInquiries.map((m) => (
                  <li key={m.id} className="flex items-start gap-3 px-5 py-3 transition-colors hover:bg-brand-500/[0.04]">
                    <AvatarInitials name={m.name} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] font-semibold text-foreground">{m.name}</p>
                      <p className="truncate text-[11px] text-muted-foreground">
                        {m.company ?? m.email} · {m.service ?? "Product interest"}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-[10.5px] text-muted-foreground">{fmtRel(m.createdAt)}</p>
                      <p className="mt-1 flex items-center justify-end gap-1 text-[10.5px] font-semibold">
                        {m.status === "New" ? (
                          <>
                            <span className="size-1.5 rounded-full bg-red-500" />
                            <span className="text-red-500">New</span>
                          </>
                        ) : (
                          <span className="text-emerald-500">Handled</span>
                        )}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Section>

        {/* top requested */}
        <Section delay={0.12}>
          <div className="flex h-full flex-col rounded-2xl border border-border bg-ink-850/85">
            <CardHead title="Top Requested" sub="Most frequent interests" action={<ViewAll href="/admin/services">Services</ViewAll>} />
            {data.topInterest.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-2 border-t border-border/50 px-5 py-10 text-center">
                <Sparkles className="size-6 text-muted-foreground" />
                <p className="text-[12.5px] text-muted-foreground">No inquiry data yet.</p>
              </div>
            ) : (
              <ul className="flex-1 divide-y divide-border/40 border-t border-border/50">
                {data.topInterest.map((d, i) => (
                  <li key={d.label} className="flex items-center gap-3 px-5 py-3">
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-brand-500/20 text-[11px] font-bold text-brand-accent-bright">
                      {i + 1}
                    </span>
                    <p className="min-w-0 flex-1 truncate text-[12.5px] font-medium text-foreground/90">{d.label}</p>
                    <p className="shrink-0 text-[11px] font-semibold text-muted-foreground">
                      {d.count} req{d.count === 1 ? "" : "."}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Section>

        {/* status donut */}
        <Section delay={0.16}>
          <div className="flex h-full flex-col rounded-2xl border border-border bg-ink-850/85 pb-5">
            <CardHead title="Inquiry Status" sub="All-time split" action={<ViewAll href="/admin/inquiries" />} />
            <div className="flex flex-1 flex-col justify-center px-5">
              <MiniDonut
                data={data.statusMix.map((s) => ({ label: s.status, count: s.count }))}
                colors={["#5fa9f2", "#10b981"]}
                centerValue={k.inquiries.total}
                centerLabel="Total"
              />
              <ul className="mt-4 space-y-2">
                {data.statusMix.map((s) => (
                  <li key={s.status} className="flex items-center gap-2.5 text-[12px]">
                    <span
                      className="size-2.5 shrink-0 rounded-full"
                      style={{ background: s.status === "New" ? "#5fa9f2" : "#10b981" }}
                    />
                    <span className="flex-1 font-medium text-foreground/85">{s.status}</span>
                    <span className="font-semibold text-muted-foreground">
                      {s.count}
                      <span className="text-muted-foreground/60">
                        {" "}({Math.round((s.count / Math.max(k.inquiries.total, 1)) * 100)}%)
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Section>

        {/* quick actions */}
        <Section delay={0.2}>
          <div className="flex h-full flex-col rounded-2xl border border-border bg-ink-850/85 pb-5">
            <CardHead title="Quick Actions" sub="Jump into workflows" />
            <div className="flex flex-1 flex-col gap-2.5 px-5">
              {[
                { href: "/admin/products", icon: Package, label: "Add a product" },
                { href: "/admin/services", icon: Sparkles, label: "Add a service" },
                { href: "/admin/testimonials", icon: Quote, label: "Add a testimonial" },
                { href: "/api/admin/inquiries/export", icon: Download, label: "Export inquiries (CSV)", download: true },
                { href: "/", icon: Globe, label: "View the website" },
              ].map((a) => {
                const inner = (
                  <>
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-brand-500/25 bg-brand-500/10 text-brand-accent-bright">
                      <a.icon className="size-4.5" />
                    </span>
                    <span className="min-w-0 flex-1 truncate text-[12.5px] font-semibold text-foreground">{a.label}</span>
                    <ArrowUpRight className="size-4 shrink-0 text-muted-foreground/50 transition-colors group-hover:text-brand-accent" />
                  </>
                );
                return a.download ? (
                  <a
                    key={a.href}
                    href={a.href}
                    download
                    className="group flex items-center gap-3 rounded-xl border border-border bg-ink-900/50 p-3 transition-all duration-300 hover:border-brand-500/40 hover:bg-brand-500/[0.07]"
                  >
                    {inner}
                  </a>
                ) : (
                  <Link
                    key={a.href}
                    href={a.href}
                    className="group flex items-center gap-3 rounded-xl border border-border bg-ink-900/50 p-3 transition-all duration-300 hover:border-brand-500/40 hover:bg-brand-500/[0.07]"
                  >
                    {inner}
                  </Link>
                );
              })}
            </div>
          </div>
        </Section>
      </div>

      {/* ── content summary + catalogue mix + activity + promo ──── */}
      <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-[1.55fr_1fr_1.15fr_0.95fr]">
        <Section delay={0.08}>
          <div className="h-full rounded-2xl border border-border bg-ink-850/85 pb-5">
            <CardHead title="Content Summary" sub="Everything the website publishes" />
            <div className="grid grid-cols-2 gap-x-6 gap-y-5 px-6 pt-1">
              {(
                [
                  ["Products", k.products.count, k.products.published, data.contentSpark.products],
                  ["Services", k.services.count, k.services.published, data.contentSpark.services],
                  ["Testimonials", k.testimonials.count, k.testimonials.published, data.contentSpark.testimonials],
                  ["Clients", k.clients.count, k.clients.published, data.contentSpark.clients],
                ] as const
              ).map(([label, count, published, spark]) => (
                <div key={label}>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">{label}</p>
                  <p className="mt-1.5 font-display text-2xl font-bold leading-none text-foreground">{count}</p>
                  <p className="mt-1 text-[10.5px] font-medium text-emerald-500">{published} live</p>
                  <div className="mt-2">
                    <Sparkline points={spark} tone="brand" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Section>

        <Section delay={0.12}>
          <div className="flex h-full flex-col rounded-2xl border border-border bg-ink-850/85 pb-5">
            <CardHead title="Catalogue Mix" sub={`${contentTotal} content items`} />
            <div className="flex flex-1 flex-col justify-center px-5">
              <MiniDonut
                data={data.contentMix.map((d) => ({ label: d.type, count: d.count }))}
                colors={["#5fa9f2", "#22d3ee", "#a78bfa", "#f59e0b"]}
                centerValue={contentTotal}
                centerLabel="Items"
              />
              <ul className="mt-4 space-y-1.5">
                {data.contentMix.map((d, i) => (
                  <li key={d.type} className="flex items-center gap-2.5 text-[12px]">
                    <span
                      className="size-2.5 shrink-0 rounded-full"
                      style={{ background: ["#5fa9f2", "#22d3ee", "#a78bfa", "#f59e0b"][i] }}
                    />
                    <span className="flex-1 truncate font-medium text-foreground/85">{d.type}</span>
                    <span className="font-semibold text-muted-foreground">
                      {d.count}
                      <span className="text-muted-foreground/60">
                        {" "}({Math.round((d.count / Math.max(contentTotal, 1)) * 100)}%)
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Section>

        <Section delay={0.16}>
          <div className="flex h-full flex-col rounded-2xl border border-border bg-ink-850/85">
            <CardHead title="Recent Activity" sub="Latest changes & events" />
            {data.activity.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-2 border-t border-border/50 px-5 py-10 text-center">
                <BellRing className="size-6 text-muted-foreground" />
                <p className="text-[12.5px] text-muted-foreground">Nothing recorded yet.</p>
              </div>
            ) : (
              <ul className="flex-1 divide-y divide-border/40 border-t border-border/50">
                {data.activity.map((a, i) => {
                  const st = ACTIVITY_STYLES[a.kind] ?? ACTIVITY_STYLES.inquiry;
                  return (
                    <li key={i} className="flex items-start gap-3 px-5 py-2.5">
                      <span className={cn("mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg border", st.cls)}>
                        <st.icon className="size-3.5" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[12px] font-medium text-foreground/90">{a.title}</p>
                        <p className="text-[10.5px] text-muted-foreground">{a.sub}</p>
                      </div>
                      <p className="shrink-0 text-[10px] text-muted-foreground">{fmtRel(a.at)}</p>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </Section>

        <Section delay={0.2}>
          <div className="relative flex h-full flex-col overflow-hidden rounded-2xl border border-brand-500/30 bg-gradient-to-br from-brand-600/25 via-brand-500/12 to-transparent p-5">
            <div
              aria-hidden
              className="pointer-events-none absolute -right-6 -top-6 size-28 rounded-full bg-brand-500/20 blur-2xl"
            />
            <Sparkles className="size-6 text-brand-accent-bright" />
            <h3 className="mt-3 font-display text-[16px] font-bold leading-snug text-foreground">
              Publish with Confidence
            </h3>
            <p className="mt-2 text-[12px] leading-relaxed text-muted-foreground">
              Every change you publish here is live on agmatec.com instantly — no deploys, no downtime.
            </p>
            <Link
              href="/"
              className="mt-auto inline-flex items-center justify-center gap-2 rounded-xl border border-brand-500/40 bg-brand-500/15 px-4 py-2.5 pt-2.5 text-[12.5px] font-semibold text-brand-accent-bright transition-colors hover:bg-brand-500/25"
            >
              Open the website
              <ArrowUpRight className="size-4" />
            </Link>
          </div>
        </Section>
      </div>

      {/* ── workforce pulse ─────────────────────────────────────── */}
      {wf && (
        <Section delay={0.1} className="mt-6">
          <div className="flex flex-wrap items-center gap-x-8 gap-y-4 rounded-2xl border border-border bg-ink-850/85 px-6 py-4">
            <div className="flex items-center gap-3">
              <span className="flex size-9 items-center justify-center rounded-lg border border-brand-500/25 bg-brand-500/10 text-brand-accent-bright">
                <Users className="size-4.5" />
              </span>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Workforce</p>
                <p className="text-[12px] text-muted-foreground">HR suite at a glance</p>
              </div>
            </div>
            <dl className="flex flex-1 flex-wrap gap-x-8 gap-y-3">
              <div>
                <dt className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Headcount</dt>
                <dd className="text-lg font-bold text-foreground">{wf.total}</dd>
              </div>
              <div>
                <dt className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Active</dt>
                <dd className="text-lg font-bold text-foreground">{wf.active}</dd>
              </div>
              <div>
                <dt className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Pending leaves</dt>
                <dd className="text-lg font-bold text-foreground">{wf.pendingLeaves}</dd>
              </div>
              <div>
                <dt className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Docs expiring</dt>
                <dd className="text-lg font-bold text-foreground">{wf.expiringDocs}</dd>
              </div>
              {wf.payrollTrend.length > 0 && (
                <div>
                  <dt className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Latest payroll</dt>
                  <dd className="flex items-center gap-2 text-lg font-bold text-foreground">
                    {fmtMoney(wf.payrollTrend[wf.payrollTrend.length - 1].net)}
                    <StatusBadge status={wf.payrollTrend[wf.payrollTrend.length - 1].status} />
                  </dd>
                </div>
              )}
            </dl>
            <Link
              href="/admin/employees"
              className="text-[12.5px] font-semibold text-brand-accent transition-colors hover:text-brand-accent-bright"
            >
              Open workforce →
            </Link>
          </div>
        </Section>
      )}
    </>
  );
}
