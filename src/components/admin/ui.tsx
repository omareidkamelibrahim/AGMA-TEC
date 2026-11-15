"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Check,
  ChevronLeft,
  ChevronRight,
  Ellipsis,
  Funnel,
  Minus,
  Plus,
  Search,
  TrendingDown,
  TrendingUp,
  X,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
export function Sparkline({ points, tone }: { points: number[]; tone: string }) {
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
          className="size-9 rounded-full"
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
                "size-9 rounded-full border text-[12.5px] font-semibold transition-colors",
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
          className="size-9 rounded-full"
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
  const Icon = active ? (dir === "desc" ? ArrowDown : ArrowUp) : ArrowUpDown;
  return (
    <th className={cn("h-11 px-4 text-left align-middle", className)}>
      <button
        type="button"
        onClick={() => onSort(field)}
        className={cn(
          "-mx-2.5 -my-1.5 inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] transition-colors",
          active
            ? "bg-brand-500/10 text-brand-accent-bright"
            : "text-muted-foreground hover:text-foreground",
        )}
        aria-label={`Sort by ${label}`}
      >
        {label}
        <Icon className={cn("size-3", active ? "opacity-100" : "opacity-40")} />
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

/* ---------- Toolbar kit — mirrors the reference admin screens:
   wide search on the left, pill buttons (Import · Filters · Export ·
   primary action) on the right. AGMA brand colors only. ---------- */

/** Search field — toolbar left side, stretches to fill the row like the reference. */
export function ToolbarSearch({
  value,
  onChange,
  placeholder,
  label,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  label: string;
}) {
  return (
    <div className="relative w-full flex-1">
      <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={label}
        className="h-10 w-full rounded-xl border border-border bg-ink-900/60 pl-10 pr-4 text-[13px] text-foreground placeholder:text-muted-foreground/70 outline-none transition-colors focus:border-brand-500/50 focus:ring-2 focus:ring-brand-500/15"
      />
    </div>
  );
}

const pillCls =
  "h-10 gap-2 rounded-full border border-brand-500/30 bg-brand-500/10 px-4.5 text-[13px] font-semibold text-brand-accent-bright hover:border-brand-500/50 hover:bg-brand-500/20";

/** Tinted pill action (Import / Filters / Export style). */
export function ToolbarPill({
  icon: Icon,
  children,
  onClick,
  href,
  download,
  disabled,
  className,
}: {
  icon: LucideIcon;
  children: React.ReactNode;
  onClick?: () => void;
  /** Renders an anchor (e.g. CSV download links) instead of a button. */
  href?: string;
  download?: boolean | string;
  disabled?: boolean;
  className?: string;
}) {
  if (href) {
    return (
      <Button asChild className={cn(pillCls, className)}>
        <a href={href} download={download}>
          <Icon className="size-4" />
          {children}
        </a>
      </Button>
    );
  }
  return (
    <Button
      variant="outline"
      onClick={onClick}
      disabled={disabled}
      className={cn(pillCls, className)}
    >
      <Icon className="size-4" />
      {children}
    </Button>
  );
}

/** Solid primary pill (New employee / Upload style). */
export function ToolbarPrimary({
  icon: Icon = Plus,
  children,
  onClick,
}: {
  icon?: LucideIcon;
  children: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <Button
      onClick={onClick}
      className="h-10 gap-2 rounded-full bg-gradient-to-r from-brand-600 to-brand-500 px-5 text-[13px] font-semibold text-white shadow-lg shadow-brand-600/30 hover:from-brand-500 hover:to-brand-400"
    >
      <Icon className="size-4" />
      {children}
    </Button>
  );
}

/**
 * "Filters" pill with a popover holding the filter controls.
 * Shows a count badge when filters are active; optional clear button.
 */
export function FiltersPill({
  active = 0,
  onClear,
  children,
}: {
  active?: number;
  onClear?: () => void;
  children: React.ReactNode;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className={cn(pillCls, "relative")}>
          <Funnel className="size-4" />
          Filters
          {active > 0 && (
            <span className="ml-0.5 flex size-4.5 items-center justify-center rounded-full bg-brand-500 text-[10px] font-bold text-white">
              {active}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        sideOffset={10}
        className="w-72 border-border bg-ink-900/95 p-4 backdrop-blur-xl"
      >
        <div className="flex flex-col gap-3">{children}</div>
        {onClear && active > 0 && (
          <button
            type="button"
            onClick={onClear}
            className="mt-1 w-full rounded-lg border border-border py-2 text-[12.5px] font-semibold text-muted-foreground transition-colors hover:border-brand-500/40 hover:text-foreground"
          >
            Clear all filters
          </button>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/** Circular tinted "…" row-action menu (per-row Actions column). */
export function RowActions({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={label}
          className="flex size-9 items-center justify-center rounded-full border border-brand-500/25 bg-brand-500/10 text-brand-accent-bright outline-none transition-colors hover:bg-brand-500/25 focus-visible:ring-2 focus-visible:ring-brand-500/30"
        >
          <Ellipsis className="size-4" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="w-48 border-border bg-ink-900/95 backdrop-blur-xl"
      >
        {children}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/** Circular ‹ › pager pair. */
export function PagerArrows({
  page,
  pageCount,
  onPage,
}: {
  page: number;
  pageCount: number;
  onPage: (p: number) => void;
}) {
  const cls =
    "flex size-9 items-center justify-center rounded-full border border-border bg-ink-850/70 text-muted-foreground transition-colors hover:border-brand-500/40 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40";
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        className={cls}
        disabled={page <= 1}
        onClick={() => onPage(page - 1)}
        aria-label="Previous page"
      >
        <ChevronLeft className="size-4" />
      </button>
      <button
        type="button"
        className={cls}
        disabled={page >= pageCount}
        onClick={() => onPage(page + 1)}
        aria-label="Next page"
      >
        <ChevronRight className="size-4" />
      </button>
    </div>
  );
}

/** Slim strip above a table: record count on the left, circular ‹ › on the right. */
export function TableSummary({
  page,
  pageCount,
  total,
  pageSize,
  onPage,
  selected = 0,
  onClearSelection,
}: {
  page: number;
  pageCount: number;
  total: number;
  pageSize: number;
  onPage: (p: number) => void;
  /** Row-selection count — shows a "N selected · clear" chip when > 0. */
  selected?: number;
  onClearSelection?: () => void;
}) {
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(total, page * pageSize);
  return (
    <div className="mb-3 mt-4 flex items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <p className="text-[12.5px] text-muted-foreground">
          Showing <span className="font-semibold text-foreground">{from}–{to}</span> of{" "}
          <span className="font-semibold text-foreground">{total}</span>
        </p>
        {selected > 0 && onClearSelection && (
          <SelectionChip count={selected} onClear={onClearSelection} />
        )}
      </div>
      <PagerArrows page={page} pageCount={pageCount} onPage={onPage} />
    </div>
  );
}

/** Rounded row-selection checkbox (squircle, supports indeterminate). */
export function Checkbox({
  checked,
  indeterminate = false,
  onChange,
  label,
}: {
  checked: boolean;
  indeterminate?: boolean;
  onChange: (checked: boolean) => void;
  label: string;
}) {
  const ref = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    ref.current?.setAttribute("aria-checked", indeterminate && !checked ? "mixed" : String(checked));
  }, [indeterminate, checked]);
  return (
    <button
      ref={ref}
      type="button"
      role="checkbox"
      aria-checked={indeterminate && !checked ? "mixed" : checked}
      aria-label={label}
      onClick={(e) => {
        e.stopPropagation();
        onChange(!checked);
      }}
      className={cn(
        "flex size-[18px] shrink-0 items-center justify-center rounded-[6px] border transition-colors outline-none focus-visible:ring-2 focus-visible:ring-brand-500/30",
        checked || indeterminate
          ? "border-brand-500 bg-brand-500 text-white"
          : "border-border bg-transparent hover:border-brand-500/50",
      )}
    >
      {indeterminate && !checked ? (
        <Minus className="size-3" strokeWidth={3} />
      ) : checked ? (
        <Check className="size-3" strokeWidth={3} />
      ) : null}
    </button>
  );
}

/** Small "N selected · clear" pill shown when table rows are selected. */
export function SelectionChip({ count, onClear }: { count: number; onClear: () => void }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-brand-500/30 bg-brand-500/10 py-1 pl-3 pr-1.5 text-[12px] font-semibold text-brand-accent-bright">
      {count} selected
      <button
        type="button"
        onClick={onClear}
        aria-label="Clear selection"
        className="flex size-5 items-center justify-center rounded-full bg-brand-500/20 transition-colors hover:bg-brand-500/35"
      >
        <X className="size-3" />
      </button>
    </span>
  );
}
