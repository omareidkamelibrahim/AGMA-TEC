"use client";

import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AgmaMark } from "./logo";
import { Reveal } from "./reveal";
import { EcosystemVisual } from "./ecosystem-visual";

/**
 * Hero receives only serializable product data ({slug, name}) — the DB
 * loader resolves icons server-side, and Lucide components cannot cross
 * the server→client component boundary.
 */
export function Hero({ products }: { products: { slug: string; name: string }[] }) {
  return (
    <section id="home" className="relative overflow-hidden pt-32 pb-16 sm:pt-40 lg:pb-24">
      {/* backdrop */}
      <div className="absolute inset-0 -z-20 bg-grid bg-grid-fade" />
      <div className="absolute inset-0 -z-20 bg-[radial-gradient(55%_45%_at_18%_20%,var(--glow-navy-strong),transparent_70%)]" />
      <div className="absolute inset-0 -z-20 bg-[radial-gradient(45%_40%_at_82%_30%,rgba(46,123,214,0.16),transparent_72%)]" />
      <div className="absolute inset-x-0 bottom-0 -z-10 h-40 bg-gradient-to-t from-background to-transparent" />

      {/* floating ghost beads */}
      <AgmaMark className="absolute right-[6%] top-24 -z-10 hidden h-28 w-auto opacity-[0.07] lg:block" />
      <AgmaMark className="absolute -left-10 bottom-10 -z-10 hidden h-40 w-auto opacity-[0.05] lg:block" />

      <div className="mx-auto grid w-full max-w-7xl items-center gap-16 px-5 sm:px-8 lg:grid-cols-[1.02fr_0.98fr] lg:gap-12">
        <div>
          <Reveal>
            <span className="inline-flex items-center gap-2.5 rounded-full border border-brand-500/25 bg-brand-500/10 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.24em] text-brand-accent">
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
                className="group h-13 rounded-full bg-brand-600 px-7 text-[15px] font-semibold text-white shadow-[0_14px_44px_-10px_rgba(46,123,214,0.75)] transition-all hover:bg-brand-500 light:hover:bg-brand-700 hover:shadow-[0_18px_54px_-10px_rgba(59,139,232,0.85)]"
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
              {products.map((p) => (
                <li key={p.slug} className="flex items-center gap-2">
                  <span className="size-1.5 rounded-full bg-brand-400" />
                  <Link
                    href={`/products/${p.slug}`}
                    className="font-medium text-foreground/80 transition-colors hover:text-brand-accent"
                  >
                    {p.name}
                  </Link>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>

        <EcosystemVisual />
      </div>
    </section>
  );
}
