import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { PageHero } from "@/components/agma/page-hero";
import { Reveal, RevealScale } from "@/components/agma/reveal";
import { CtaBand } from "@/components/agma/cta-band";
import { PRODUCTS } from "@/lib/products";

export const metadata: Metadata = {
  title: "Our Products & Solutions",
  description:
    "Powerful, integrated solutions designed to simplify business operations, optimize resources, and support organizational growth — AGMA ERP, AGMA CAFM and AGMA CATERING, developed, implemented and supported by AGMA TEC.",
};

export default function ProductsPage() {
  return (
    <>
      <PageHero
        eyebrow="Product Suite"
        title={
          <>
            Our Products{" "}
            <span className="text-gradient">&amp; Solutions</span>
          </>
        }
        description="Powerful, integrated solutions designed to simplify business operations, optimize resources, and support organizational growth."
      />

      {/* ── Product blocks ────────────────────────────────────────── */}
      <section className="relative pb-8 pt-4 sm:pb-10">
        <div className="mx-auto w-full max-w-7xl space-y-20 px-5 sm:space-y-28 sm:px-8">
          {PRODUCTS.map((p, i) => (
            <div
              key={p.slug}
              className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16"
            >
              {/* Visual panel */}
              <RevealScale className={i % 2 === 1 ? "lg:order-2" : ""}>
                <div className="relative overflow-hidden rounded-3xl border border-border bg-ink-850/85 p-10 sm:p-14">
                  <div className="absolute inset-0 bg-dots opacity-30" />
                  <span
                    className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${p.accent} to-transparent`}
                    aria-hidden
                  />
                  <span
                    className="absolute -bottom-10 -right-6 select-none font-display text-[10rem] font-bold leading-none text-brand-500/[0.07]"
                    aria-hidden
                  >
                    {p.index}
                  </span>
                  <div className="relative flex flex-col items-start gap-7">
                    <span className="flex size-20 items-center justify-center rounded-2xl border border-brand-500/25 bg-brand-500/10 text-brand-300">
                      <p.icon className="size-10" />
                    </span>
                    <div>
                      <p className="font-display text-3xl font-bold tracking-wide text-foreground">
                        {p.name}
                      </p>
                      <p className="mt-2 text-[12px] font-semibold uppercase tracking-[0.2em] text-brand-300">
                        {p.full}
                      </p>
                      <p className="mt-4 text-[13px] font-medium text-muted-foreground">
                        {p.scope}
                      </p>
                    </div>
                  </div>
                </div>
              </RevealScale>

              {/* Copy */}
              <div className={i % 2 === 1 ? "lg:order-1" : ""}>
                <Reveal>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-brand-300">
                    Product {p.index}
                  </p>
                </Reveal>
                <Reveal delay={0.08}>
                  <h2 className="mt-4 font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                    {p.name}
                  </h2>
                  <p className="mt-2 text-[12px] font-semibold uppercase tracking-[0.18em] text-brand-300">
                    {p.full}
                  </p>
                </Reveal>
                <Reveal delay={0.16}>
                  <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground">
                    {p.description}
                  </p>
                </Reveal>
                <Reveal delay={0.24}>
                  <div className="mt-6 flex flex-wrap gap-2">
                    {p.capabilities.slice(0, 3).map((c) => (
                      <span
                        key={c.label}
                        className="rounded-full border border-border/80 bg-ink-800/70 px-3 py-1 text-[11px] font-medium text-foreground/60"
                      >
                        {c.label}
                      </span>
                    ))}
                    <span className="rounded-full border border-brand-500/25 bg-brand-500/10 px-3 py-1 text-[11px] font-semibold text-brand-300">
                      +{p.capabilities.length - 3} more
                    </span>
                  </div>
                </Reveal>
                <Reveal delay={0.3}>
                  <Link
                    href={`/products/${p.slug}`}
                    className="group mt-8 inline-flex items-center gap-2 font-display text-[16px] font-semibold text-brand-300 transition-colors hover:text-brand-200"
                  >
                    Explore {p.name}
                    <ArrowUpRight className="size-5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </Link>
                </Reveal>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Ownership note ────────────────────────────────────────── */}
      <section className="relative py-16 sm:py-20">
        <div className="mx-auto w-full max-w-7xl px-5 sm:px-8">
          <Reveal>
            <p className="mx-auto max-w-2xl text-center text-base leading-relaxed text-muted-foreground">
              Every AGMA solution is developed, implemented and supported by
              our own team — so you always know exactly{" "}
              <span className="font-medium text-foreground">who builds</span>,{" "}
              <span className="font-medium text-foreground">who delivers</span>{" "}
              and <span className="font-medium text-foreground">who supports</span>{" "}
              your technology.
            </p>
          </Reveal>
        </div>
      </section>

      <CtaBand />
    </>
  );
}
