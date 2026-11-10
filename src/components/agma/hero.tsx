"use client";

import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, CloudCog, ShieldCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AgmaMark } from "./logo";
import { CountUp } from "./count-up";
import { Reveal } from "./reveal";

const EASE = [0.22, 1, 0.36, 1] as const;

const SYSTEMS = [
  { name: "ERP Integration", env: "Production", status: "live" as const },
  { name: "Cloud Migration", env: "EU Region", status: "syncing" as const },
  { name: "AI Analytics", env: "Production", status: "live" as const },
  { name: "Mobile Platform", env: "v4.2 shipped", status: "shipped" as const },
];

const BARS = [42, 58, 50, 66, 74, 62, 80, 72, 88, 78, 94, 100];

function StatusDot({ status }: { status: "live" | "syncing" | "shipped" }) {
  if (status === "live")
    return (
      <span className="relative flex size-2">
        <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-60" />
        <span className="relative inline-flex size-2 rounded-full bg-emerald-400" />
      </span>
    );
  if (status === "syncing")
    return (
      <span className="relative flex size-2">
        <span className="absolute inline-flex size-full animate-ping rounded-full bg-brand-400 opacity-60" />
        <span className="relative inline-flex size-2 rounded-full bg-brand-400" />
      </span>
    );
  return <CheckCircle2 className="size-3.5 text-brand-300" />;
}

function Dashboard() {
  return (
    <div className="relative" aria-hidden>
      {/* glow */}
      <div className="absolute -inset-8 -z-10 rounded-[2.5rem] bg-[radial-gradient(60%_60%_at_60%_35%,rgba(46,123,214,0.28),transparent_70%)] blur-2xl" />

      <motion.div
        initial={{ opacity: 0, y: 34, rotateX: 10 }}
        animate={{ opacity: 1, y: 0, rotateX: 0 }}
        transition={{ duration: 1.1, delay: 0.35, ease: EASE }}
        className="overflow-hidden rounded-2xl border border-brand-500/20 bg-ink-850/90 shadow-[0_40px_120px_-30px_rgba(2,8,20,0.9),0_0_0_1px_rgba(95,169,242,0.06)] backdrop-blur-xl"
      >
        {/* header */}
        <div className="flex items-center justify-between border-b border-border/70 bg-ink-800/60 px-5 py-3.5">
          <div className="flex items-center gap-2.5">
            <AgmaMark className="h-5 w-auto" />
            <span className="font-display text-[13px] font-semibold tracking-wide text-foreground/90">
              Transformation Control Center
            </span>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/25 bg-emerald-400/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-300">
            <span className="size-1.5 animate-pulse-soft rounded-full bg-emerald-400" />
            Live
          </span>
        </div>

        {/* KPI tiles */}
        <div className="grid grid-cols-3 divide-x divide-border/60 border-b border-border/60">
          {[
            { label: "Platform Uptime", value: 99.98, decimals: 2, suffix: "%" },
            { label: "Deploy Cycle", value: 8.4, decimals: 1, suffix: "m" },
            { label: "Automations", value: 140, decimals: 0, suffix: "+" },
          ].map((k) => (
            <div key={k.label} className="px-4 py-4 sm:px-5">
              <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                {k.label}
              </p>
              <p className="mt-1.5 font-display text-xl font-bold text-foreground sm:text-2xl">
                <CountUp to={k.value} decimals={k.decimals} suffix={k.suffix} duration={2200} />
              </p>
            </div>
          ))}
        </div>

        {/* systems list */}
        <div className="border-b border-border/60 px-5 py-4">
          <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Live Systems
          </p>
          <ul className="space-y-2.5">
            {SYSTEMS.map((s, i) => (
              <motion.li
                key={s.name}
                initial={{ opacity: 0, x: -14 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.9 + i * 0.16, duration: 0.6, ease: EASE }}
                className="flex items-center justify-between rounded-lg border border-border/50 bg-ink-800/50 px-3.5 py-2.5"
              >
                <span className="flex items-center gap-2.5 text-[13px] font-medium text-foreground/90">
                  <StatusDot status={s.status} />
                  {s.name}
                </span>
                <span className="text-[11px] text-muted-foreground">{s.env}</span>
              </motion.li>
            ))}
          </ul>
        </div>

        {/* velocity chart */}
        <div className="px-5 py-4">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Delivery Velocity
            </p>
            <p className="text-[11px] text-brand-300">+24% this quarter</p>
          </div>
          <div className="flex h-16 items-end gap-1.5 sm:h-20">
            {BARS.map((h, i) => (
              <motion.div
                key={i}
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                transition={{ delay: 1.1 + i * 0.06, duration: 0.55, ease: EASE }}
                style={{ height: `${h}%` }}
                className="flex-1 origin-bottom rounded-t-sm bg-gradient-to-t from-brand-800/70 to-brand-500"
              />
            ))}
          </div>
        </div>
      </motion.div>

      {/* floating chips */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5, duration: 0.7, ease: EASE }}
        className="absolute -bottom-7 -left-6 hidden animate-float-y items-center gap-2.5 rounded-xl border border-border/80 bg-ink-800/90 px-4 py-3 shadow-xl backdrop-blur-md sm:flex lg:-left-8"
      >
        <span className="flex size-9 items-center justify-center rounded-lg bg-brand-500/15 text-brand-300">
          <ShieldCheck className="size-5" />
        </span>
        <span>
          <span className="block text-[13px] font-semibold text-foreground">Enterprise-grade</span>
          <span className="block text-[11px] text-muted-foreground">security & compliance</span>
        </span>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.7, duration: 0.7, ease: EASE }}
        className="absolute -bottom-6 right-2 hidden animate-float-y-slow items-center gap-2.5 rounded-xl border border-border/80 bg-ink-800/90 px-4 py-3 shadow-xl backdrop-blur-md sm:flex lg:-right-6"
      >
        <span className="flex size-9 items-center justify-center rounded-lg bg-brand-500/15 text-brand-300">
          <CloudCog className="size-5" />
        </span>
        <span>
          <span className="block text-[13px] font-semibold text-foreground">24/7 cloud ops</span>
          <span className="block text-[11px] text-muted-foreground">monitored & supported</span>
        </span>
      </motion.div>
    </div>
  );
}

export function Hero() {
  return (
    <section id="home" className="relative overflow-hidden pt-32 pb-16 sm:pt-40 lg:pb-24">
      {/* backdrop */}
      <div className="absolute inset-0 -z-20 bg-grid bg-grid-fade" />
      <div className="absolute inset-0 -z-20 bg-[radial-gradient(55%_45%_at_18%_20%,rgba(22,51,91,0.5),transparent_70%)]" />
      <div className="absolute inset-0 -z-20 bg-[radial-gradient(45%_40%_at_82%_30%,rgba(46,123,214,0.16),transparent_72%)]" />
      <div className="absolute inset-x-0 bottom-0 -z-10 h-40 bg-gradient-to-t from-ink-950 to-transparent" />

      {/* floating ghost beads */}
      <AgmaMark className="absolute right-[6%] top-24 -z-10 hidden h-28 w-auto opacity-[0.07] lg:block" />
      <AgmaMark className="absolute -left-10 bottom-10 -z-10 hidden h-40 w-auto opacity-[0.05] lg:block" />

      <div className="mx-auto grid w-full max-w-7xl items-center gap-16 px-5 sm:px-8 lg:grid-cols-[1.02fr_0.98fr] lg:gap-12">
        <div>
          <Reveal>
            <span className="inline-flex items-center gap-2.5 rounded-full border border-brand-500/25 bg-brand-500/10 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.24em] text-brand-300">
              <Sparkles className="size-3.5" />
              Digital Transformation Partner
            </span>
          </Reveal>

          <Reveal delay={0.1}>
            <h1 className="mt-7 font-display text-[2.6rem] font-bold leading-[1.06] tracking-tight text-foreground sm:text-6xl lg:text-[4.1rem]">
              Engineering your{" "}
              <span className="text-gradient">digital transformation</span>,
              end to end.
            </h1>
          </Reveal>

          <Reveal delay={0.2}>
            <p className="mt-7 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              AGMA TEC designs, builds and scales the software, cloud platforms
              and data &amp; AI products that connect every part of your
              business into one intelligent whole — from first sketch to
              always-on operation.
            </p>
          </Reveal>

          <Reveal delay={0.3}>
            <div className="mt-9 flex flex-wrap items-center gap-4">
              <Button
                asChild
                size="lg"
                className="group h-13 rounded-full bg-brand-600 px-7 text-[15px] font-semibold text-white shadow-[0_14px_44px_-10px_rgba(46,123,214,0.75)] transition-all hover:bg-brand-500 hover:shadow-[0_18px_54px_-10px_rgba(59,139,232,0.85)]"
              >
                <a href="#contact">
                  Start Your Project
                  <ArrowRight className="size-4.5 transition-transform duration-300 group-hover:translate-x-1" />
                </a>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="h-13 rounded-full border-border bg-ink-800/40 px-7 text-[15px] font-medium text-foreground/90 hover:border-brand-500/40 hover:bg-ink-700/60 hover:text-foreground"
              >
                <a href="#services">Explore Services</a>
              </Button>
            </div>
          </Reveal>

          <Reveal delay={0.42}>
            <ul className="mt-10 flex flex-wrap gap-x-7 gap-y-3 text-[13px] text-muted-foreground">
              {[
                "Enterprise-grade security",
                "ISO-aligned delivery",
                "24/7 support",
              ].map((t) => (
                <li key={t} className="flex items-center gap-2">
                  <span className="size-1.5 rounded-full bg-brand-400" />
                  {t}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>

        <Dashboard />
      </div>
    </section>
  );
}
