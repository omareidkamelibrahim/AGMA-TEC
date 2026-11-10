"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Blocks,
  Sparkles,
  Wrench,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AgmaMark } from "./logo";
import { Reveal } from "./reveal";
import { PRODUCTS } from "@/lib/products";

const EASE = [0.22, 1, 0.36, 1] as const;

function ProductSuite() {
  return (
    <div className="relative" aria-label="AGMA product suite">
      {/* glow */}
      <div className="absolute -inset-8 -z-10 rounded-[2.5rem] bg-[radial-gradient(60%_60%_at_60%_35%,rgba(46,123,214,0.28),transparent_70%)] blur-2xl" />

      <motion.div
        initial={{ opacity: 0, y: 34, rotateX: 10 }}
        animate={{ opacity: 1, y: 0, rotateX: 0 }}
        transition={{ duration: 1.1, delay: 0.35, ease: EASE }}
        className="overflow-hidden rounded-2xl border border-brand-500/20 bg-ink-850/90 shadow-[0_40px_120px_-30px_rgba(2,8,20,0.9),0_0_0_1px_rgba(95,169,242,0.06)] backdrop-blur-xl"
      >
        {/* header */}
        <div className="flex items-center justify-between border-b border-border/70 bg-ink-800/60 px-5 py-3.5 sm:px-6">
          <div className="flex items-center gap-2.5">
            <AgmaMark className="h-5 w-auto" />
            <span className="font-display text-[13px] font-semibold tracking-wide text-foreground/90">
              AGMA Product Suite
            </span>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-500/25 bg-brand-500/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-brand-300">
            <span className="size-1.5 animate-pulse-soft rounded-full bg-brand-400" />
            Own Technology
          </span>
        </div>

        {/* products */}
        <div className="space-y-3 px-5 pt-5 pb-16 sm:px-6">
          {PRODUCTS.map((p, i) => (
            <motion.div
              key={p.slug}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 + i * 0.16, duration: 0.6, ease: EASE }}
            >
              <Link
                href={`/products/${p.slug}`}
                className="group flex items-center gap-4 rounded-xl border border-border/60 bg-ink-800/50 px-4 py-3.5 transition-colors duration-300 hover:border-brand-500/35 hover:bg-ink-700/60"
              >
                <span className="flex size-11 shrink-0 items-center justify-center rounded-lg border border-brand-500/25 bg-brand-500/12 text-brand-300 transition-colors duration-300 group-hover:border-brand-400/50 group-hover:bg-brand-500/20">
                  <p.icon className="size-5.5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-display text-[15px] font-bold tracking-wide text-foreground">
                    {p.name}
                  </span>
                  <span className="block truncate text-[12px] text-muted-foreground">
                    {p.full}
                  </span>
                  <span className="mt-0.5 block text-[11px] font-medium text-brand-300/80">
                    {p.scope}
                  </span>
                </span>
                <ArrowUpRight className="size-4 shrink-0 text-brand-400/50 transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-brand-300" />
              </Link>
            </motion.div>
          ))}
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
          <Blocks className="size-5" />
        </span>
        <span>
          <span className="block text-[13px] font-semibold text-foreground">
            Integrated by design
          </span>
          <span className="block text-[11px] text-muted-foreground">
            solutions that work as one
          </span>
        </span>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.7, duration: 0.7, ease: EASE }}
        className="absolute -bottom-6 right-2 hidden animate-float-y-slow items-center gap-2.5 rounded-xl border border-border/80 bg-ink-800/90 px-4 py-3 shadow-xl backdrop-blur-md sm:flex lg:-right-6"
      >
        <span className="flex size-9 items-center justify-center rounded-lg bg-brand-500/15 text-brand-300">
          <Wrench className="size-5" />
        </span>
        <span>
          <span className="block text-[13px] font-semibold text-foreground">
            End-to-end delivery
          </span>
          <span className="block text-[11px] text-muted-foreground">
            implementation &amp; support
          </span>
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
              Enterprise Technology Solutions
            </span>
          </Reveal>

          <Reveal delay={0.1}>
            <h1 className="mt-7 font-display text-[2.6rem] font-bold leading-[1.06] tracking-tight text-foreground sm:text-6xl lg:text-[4.1rem]">
              Connecting Businesses Through{" "}
              <span className="text-gradient">Intelligent Technology.</span>
            </h1>
          </Reveal>

          <Reveal delay={0.2}>
            <p className="mt-7 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              AGMA TEC delivers integrated enterprise technology solutions that
              empower organizations to streamline operations, improve
              efficiency, and accelerate digital transformation.
            </p>
          </Reveal>

          <Reveal delay={0.3}>
            <div className="mt-9 flex flex-wrap items-center gap-4">
              <Button
                asChild
                size="lg"
                className="group h-13 rounded-full bg-brand-600 px-7 text-[15px] font-semibold text-white shadow-[0_14px_44px_-10px_rgba(46,123,214,0.75)] transition-all hover:bg-brand-500 hover:shadow-[0_18px_54px_-10px_rgba(59,139,232,0.85)]"
              >
                <Link href="/products">
                  Explore Our Solutions
                  <ArrowRight className="size-4.5 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="h-13 rounded-full border-border bg-ink-800/40 px-7 text-[15px] font-medium text-foreground/90 hover:border-brand-500/40 hover:bg-ink-700/60 hover:text-foreground"
              >
                <Link href="/contact">Contact Us</Link>
              </Button>
            </div>
          </Reveal>

          <Reveal delay={0.42}>
            <ul className="mt-10 flex flex-wrap gap-x-7 gap-y-3 text-[13px] text-muted-foreground">
              {PRODUCTS.map((p) => (
                <li key={p.slug} className="flex items-center gap-2">
                  <span className="size-1.5 rounded-full bg-brand-400" />
                  <Link
                    href={`/products/${p.slug}`}
                    className="font-medium text-foreground/80 transition-colors hover:text-brand-300"
                  >
                    {p.name}
                  </Link>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>

        <ProductSuite />
      </div>
    </section>
  );
}
