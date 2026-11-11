"use client";

import { cn } from "@/lib/utils";
import {
  ChevronLeft,
  ChevronRight,
  Minus,
  TrendingDown,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

/* ---------- Page header ---------- */

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">
          {title}
        </h1>
        {description && (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2.5">{actions}</div>}
    </div>
  );
}

/* ---------- Stat card ---------- */

const TONE_STROKE: Record<string, string> = {
  brand: "#5fa9f2",
  success: "#10b981",
  warning: "#f59e0b",
  danger: "#ef4444",
  neutral: "#64748b",
};

/** Compact inline sparkline (pure SVG — no chart lib overhead). */
function Sparkline({ points, tone }: { points: number[]; tone: string }) {
  if (points.length < 2) return null;
  const W = 72;
  const H = 26;
  const min = Math.min(...points);
  const max = Math.max(...points);
  const span = max - min || 1;
  const step = W / (points.length - 1);
  const coords = points.map((v, i) => {
    const x = i * step;
    const y = H - 3 - ((v - min) / span) * (H - 6);
    return [x, y] as const;
  });
  const line = coords.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const area = `${line} L${W},${H} L0,${H} Z`;
  const stroke = TONE_STROKE[tone] ?? TONE_STROKE.brand;
  const id = `spark-${tone}-${points.length}-${Math.round(max)}`;
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} aria-hidden className="shrink-0 overflow-visible">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={stroke} stopOpacity="0.28" />
          <stop offset="100%" stopColor={stroke} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${id})`} />
      <path d={line} fill="none" stroke={stroke} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={coords[coords.length - 1][0]} cy={coords[coords.length - 1][1]} r="2.2" fill={stroke} />
    </svg>
  );
}

export function StatCard({
  label,
  value,
  icon: Icon,
  tone = "brand",
  hint,
  delta,
  spark,
}: {
  label: string;
  value: number | string;
  icon: LucideIcon;
  tone?: "brand" | "success" | "warning" | "danger" | "neutral";
  hint?: string;
  /** Trend chip, e.g. hires momentum vs the previous period. */
  delta?: { text: string; dir: "up" | "down" | "flat" };
  /** Optional sparkline series (oldest → newest). */
  spark?: number[];
}) {
  const tones: Record<string, string> = {
    brand: "border-brand-500/25 bg-brand-500/10 text-brand-accent-bright",
    success: "border-emerald-500/25 bg-emerald-500/10 text-emerald-500",
    warning: "border-amber-500/25 bg-amber-500/10 text-amber-500",
    danger: "border-red-500/25 bg-red-500/10 text-red-500",
    neutral: "border-border bg-ink-800/60 text-muted-foreground",
  };
  const deltaStyles: Record<string, string> = {
    up: "border-emerald-500/30 bg-emerald-500/10 text-emerald-500",
    down: "border-red-500/30 bg-red-500/10 text-red-500",
    flat: "border-border bg-ink-800/60 text-muted-foreground",
  };
  const DeltaIcon = delta?.dir === "up" ? TrendingUp : delta?.dir === "down" ? TrendingDown : Minus;
  return (
    <div className="card-lift rounded-2xl border border-border bg-ink-850/85 p-5">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          {label}
        </p>
        <span className={cn("flex size-9 items-center justify-center rounded-xl border", tones[tone])}>
          <Icon className="size-4.5" />
        </span>
      </div>
      <div className="mt-3 flex items-end justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-display text-3xl font-bold leading-none text-foreground">
              {value}
            </p>
            {delta && (
              <span
                className={cn(
                  "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10.5px] font-bold",
                  deltaStyles[delta.dir],
                )}
              >
                <DeltaIcon className="size-3" />
                {delta.text}
              </span>
            )}
          </div>
          {hint && <p className="mt-2 text-[12px] text-muted-foreground">{hint}</p>}
        </div>
        {spark && <Sparkline points={spark} tone={tone} />}
      </div>
    </div>
  );
}

/* ---------- Status badge ---------- */

const STATUS_STYLES: Record<string, string> = {
  Active: "border-emerald-500/30 bg-emerald-500/10 text-emerald-500",
  Probation: "border-amber-500/30 bg-amber-500/10 text-amber-500",
  Suspended: "border-red-500/30 bg-red-500/10 text-red-500",
  Terminated: "border-border bg-ink-800/80 text-muted-foreground",
  Pending: "border-amber-500/30 bg-amber-500/10 text-amber-500",
  Approved: "border-emerald-500/30 bg-emerald-500/10 text-emerald-500",
  Rejected: "border-red-500/30 bg-red-500/10 text-red-500",
  Draft: "border-border bg-ink-800/80 text-muted-foreground",
  Processed: "border-brand-500/30 bg-brand-500/10 text-brand-accent-bright",
  Paid: "border-emerald-500/30 bg-emerald-500/10 text-emerald-500",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <Badge
      variant="outline"
      className={cn("border text-[11.5px] font-semibold", STATUS_STYLES[status] ?? STATUS_STYLES.Terminated)}
    >
      {status}
    </Badge>
  );
}

/* ---------- Table pagination ---------- */

export function TablePagination({
  page,
  pageCount,
  total,
  pageSize,
  onPage,
}: {
  page: number;
  pageCount: number;
  total: number;
  pageSize: number;
  onPage: (p: number) => void;
}) {
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(total, page * pageSize);

  // compact page list with ellipsis: 1 … around current … last
  const pages: (number | "…")[] = [];
  const push = (p: number | "…") => pages.push(p);
  if (pageCount <= 7) {
    for (let i = 1; i <= pageCount; i++) push(i);
  } else {
    push(1);
    if (page > 3) push("…");
    for (let i = Math.max(2, page - 1); i <= Math.min(pageCount - 1, page + 1); i++) push(i);
    if (page < pageCount - 2) push("…");
    push(pageCount);
  }

  return (
    <div className="flex flex-col items-center justify-between gap-3 border-t border-border/60 px-5 py-4 sm:flex-row">
      <p className="text-[12.5px] text-muted-foreground">
        Showing <span className="font-semibold text-foreground">{from}–{to}</span> of{" "}
        <span className="font-semibold text-foreground">{total}</span>
      </p>
      <div className="flex items-center gap-1.5">
        <Button
          variant="outline"
          size="icon"
          className="size-8.5 rounded-lg"
          disabled={page <= 1}
          onClick={() => onPage(page - 1)}
          aria-label="Previous page"
        >
          <ChevronLeft className="size-4" />
        </Button>
        {pages.map((p, i) =>
          p === "…" ? (
            <span key={`e${i}`} className="px-1 text-[12px] text-muted-foreground">…</span>
          ) : (
            <button
              key={p}
              type="button"
              onClick={() => onPage(p)}
              aria-current={p === page ? "page" : undefined}
              className={cn(
                "size-8.5 rounded-lg border text-[12.5px] font-semibold transition-colors",
                p === page
                  ? "border-brand-500 bg-brand-500 text-white"
                  : "border-border bg-ink-850/70 text-muted-foreground hover:border-brand-500/40 hover:text-foreground",
              )}
            >
              {p}
            </button>
          ),
        )}
        <Button
          variant="outline"
          size="icon"
          className="size-8.5 rounded-lg"
          disabled={page >= pageCount}
          onClick={() => onPage(page + 1)}
          aria-label="Next page"
        >
          <ChevronRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}

/* ---------- Sortable header ---------- */

export function SortHeader({
  label,
  field,
  sort,
  dir,
  onSort,
  className,
}: {
  label: string;
  field: string;
  sort: string;
  dir: "asc" | "desc";
  onSort: (field: string) => void;
  className?: string;
}) {
  const active = sort === field;
  return (
    <th className={cn("h-11 px-4 text-left align-middle", className)}>
      <button
        type="button"
        onClick={() => onSort(field)}
        className={cn(
          "inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] transition-colors",
          active ? "text-brand-accent-bright" : "text-muted-foreground hover:text-foreground",
        )}
        aria-label={`Sort by ${label}`}
      >
        {label}
        <span className={cn("text-[9px] transition-opacity", active ? "opacity-100" : "opacity-30")}>
          {active && dir === "desc" ? "▼" : "▲"}
        </span>
      </button>
    </th>
  );
}

/* ---------- Misc ---------- */

export function fmtDate(d: string | Date | null | undefined) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-GB", {
    year: "numeric", month: "short", day: "numeric",
  });
}

export function fmtMoney(n: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency", currency: "SAR", maximumFractionDigits: 0,
  }).format(n);
}
