"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { cn } from "@/lib/utils";
import { fmtMoney } from "./ui";

/* ---------- shared ---------- */

const AXIS_TICK = { fill: "var(--color-muted-foreground)", fontSize: 11 };

type TipPayload = { value?: number | string; name?: string; payload?: Record<string, unknown> };

/** Card-styled tooltip that follows the active theme via tokens. */
function ChartTip({
  active,
  payload,
  label,
  render,
}: {
  active?: boolean;
  payload?: TipPayload[];
  label?: string;
  render: (value: number | string, name: string | undefined, row: Record<string, unknown>) => React.ReactNode;
}) {
  if (!active || !payload?.length) return null;
  const row = (payload[0].payload ?? {}) as Record<string, unknown>;
  return (
    <div className="rounded-xl border border-border bg-ink-900 px-3.5 py-2.5 shadow-xl">
      {label != null && (
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">{label}</p>
      )}
      <p className="mt-0.5 text-[13px] font-semibold text-foreground">
        {render(payload[0].value as number, payload[0].name, row)}
      </p>
    </div>
  );
}

/* ---------- headcount growth ---------- */

export function HeadcountArea({ data }: { data: { label: string; count: number }[] }) {
  return (
    <div className="h-[264px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 8, bottom: 0, left: -14 }}>
          <defs>
            <linearGradient id="hcFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b8be8" stopOpacity={0.34} />
              <stop offset="100%" stopColor="#3b8be8" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke="var(--color-border)" strokeDasharray="3 3" strokeOpacity={0.7} />
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={false}
            tick={AXIS_TICK}
            interval="preserveStartEnd"
            minTickGap={18}
          />
          <YAxis tickLine={false} axisLine={false} tick={AXIS_TICK} allowDecimals={false} width={44} />
          <Tooltip
            content={
              <ChartTip
                render={(v) => `${Number(v).toLocaleString("en-US")} employees`}
              />
            }
            cursor={{ stroke: "var(--color-brand-400)", strokeOpacity: 0.4, strokeDasharray: "4 4" }}
          />
          <Area
            type="monotone"
            dataKey="count"
            stroke="#5fa9f2"
            strokeWidth={2.2}
            fill="url(#hcFill)"
            activeDot={{ r: 4, fill: "#5fa9f2", stroke: "var(--color-background)", strokeWidth: 2 }}
            dot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

/* ---------- workforce composition donut ---------- */

const STATUS_COLORS: Record<string, string> = {
  Active: "#10b981",
  Probation: "#f59e0b",
  Suspended: "#ef4444",
  Terminated: "#64748b",
};

export function StatusDonut({ data }: { data: { status: string; count: number }[] }) {
  const total = data.reduce((s, d) => s + d.count, 0);
  return (
    <div className="flex flex-col items-center">
      <div className="relative h-[196px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip
              content={
                <ChartTip
                  render={(v, name) => {
                    const pct = total ? Math.round((Number(v) / total) * 100) : 0;
                    return `${name}: ${Number(v).toLocaleString("en-US")} (${pct}%)`;
                  }}
                />
              }
            />
            <Pie
              data={data}
              dataKey="count"
              nameKey="status"
              innerRadius="64%"
              outerRadius="86%"
              paddingAngle={3}
              cornerRadius={5}
              strokeWidth={0}
            >
              {data.map((d) => (
                <Cell key={d.status} fill={STATUS_COLORS[d.status] ?? STATUS_COLORS.Terminated} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <p className="font-display text-3xl font-bold leading-none text-foreground">
            {total.toLocaleString("en-US")}
          </p>
          <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Employees
          </p>
        </div>
      </div>
      <ul className="mt-4 w-full space-y-2">
        {data.map((d) => (
          <li key={d.status} className="flex items-center gap-2.5 text-[12.5px]">
            <span
              className="size-2.5 shrink-0 rounded-full"
              style={{ background: STATUS_COLORS[d.status] ?? STATUS_COLORS.Terminated }}
            />
            <span className="flex-1 font-medium text-foreground/85">{d.status}</span>
            <span className="font-semibold text-muted-foreground">
              {d.count.toLocaleString("en-US")}
            </span>
            <span className="w-9 text-right text-muted-foreground/70">
              {total ? Math.round((d.count / total) * 100) : 0}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ---------- payroll runs ---------- */

export function PayrollBars({
  data,
}: {
  data: { label: string; net: number; reference: string }[];
}) {
  return (
    <div className="h-[172px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 0, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id="payFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#5fa9f2" />
              <stop offset="100%" stopColor="#225299" />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke="var(--color-border)" strokeDasharray="3 3" strokeOpacity={0.7} />
          <XAxis dataKey="label" tickLine={false} axisLine={false} tick={AXIS_TICK} interval={0} />
          <YAxis
            tickLine={false}
            axisLine={false}
            tick={AXIS_TICK}
            width={52}
            tickFormatter={(v: number) => (v >= 1_000_000 ? `${(v / 1_000_000).toFixed(1)}M` : v >= 1_000 ? `${Math.round(v / 1_000)}K` : String(v))}
          />
          <Tooltip
            content={
              <ChartTip
                render={(v, _name, row) => (
                  <>
                    {fmtMoney(Number(v))}
                    <span className="mt-0.5 block text-[11px] font-normal text-muted-foreground">
                      {String(row.reference ?? "")}
                    </span>
                  </>
                )}
              />
            }
            cursor={{ fill: "var(--color-brand-500)", fillOpacity: 0.08 }}
          />
          <Bar dataKey="net" fill="url(#payFill)" radius={[6, 6, 0, 0]} maxBarSize={30} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

/* ---------- avatar initials ---------- */

export function AvatarInitials({ name, className }: { name: string; className?: string }) {
  const initials = name
    .trim()
    .split(/\s+/)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return (
    <span
      aria-hidden
      className={cn(
        "flex size-8.5 shrink-0 items-center justify-center rounded-full border border-brand-500/25 bg-brand-500/12 text-[11px] font-bold text-brand-accent-bright",
        className,
      )}
    >
      {initials}
    </span>
  );
}
