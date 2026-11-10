"use client";

import { CountUp } from "./count-up";
import { Reveal } from "./reveal";

const STATS = [
  { value: 120, suffix: "+", label: "Projects delivered" },
  { value: 60, suffix: "+", label: "Clients worldwide" },
  { value: 40, suffix: "+", label: "Technology experts" },
  { value: 8, suffix: "", label: "Industries served" },
];

export function StatsBar() {
  return (
    <section className="relative z-10 px-5 sm:px-8" aria-label="Company statistics">
      <Reveal>
        <div className="mx-auto grid w-full max-w-7xl grid-cols-2 gap-px overflow-hidden rounded-2xl border border-border bg-border/60 lg:grid-cols-4">
          {STATS.map((s) => (
            <div
              key={s.label}
              className="group bg-ink-850/95 px-6 py-8 text-center transition-colors duration-300 hover:bg-ink-800 sm:py-9"
            >
              <p className="font-display text-4xl font-bold tracking-tight text-foreground sm:text-[2.6rem]">
                <CountUp to={s.value} suffix={s.suffix} className="tabular-nums" />
              </p>
              <p className="mt-2 flex items-center justify-center gap-2 text-[13px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                <span className="size-1.5 rounded-full bg-brand-500 transition-transform duration-300 group-hover:scale-150" />
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </Reveal>
    </section>
  );
}
