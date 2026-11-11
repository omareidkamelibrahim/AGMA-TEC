import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { existsSync } from "node:fs";
import path from "node:path";
import { ArrowUpRight } from "lucide-react";
import { PageHero } from "@/components/agma/page-hero";
import { Reveal, RevealScale } from "@/components/agma/reveal";
import { CtaBand } from "@/components/agma/cta-band";
import { getProducts } from "@/lib/site-content";

// Products are DB-managed from the admin dashboard.
export const dynamic = "force-dynamic";

/**
 * Wide-scene hero visual per product (public/products/{slug}-hero.png).
 * Falls back to the product's card visual when no hero file exists,
 * so products added later from the dashboard still render correctly.
 */
function heroFor(slug: string, fallback: string): string {
  try {
    const file = path.join(process.cwd(), "public", "products", `${slug}-hero.png`);
    return existsSync(file) ? `/products/${slug}-hero.png` : fallback;
  } catch {
    return fallback;
  }
}

export const metadata: Metadata = {
  title: "Our Products & Solutions",
  description:
    "Powerful, integrated solutions designed to simplify business operations, optimize resources, and support organizational growth — AGMA ERP, AGMA CAFM and AGMA CATERING, developed, implemented and supported by AGMA TEC.",
};

export default async function ProductsPage() {
  const products = await getProducts();
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
          {products.map((p, i) => (
            <div
              key={p.slug}
              className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16"
            >
              {/* Expressive visual panel */}
              <RevealScale className={i % 2 === 1 ? "lg:order-2" : ""}>
                <div className="group relative overflow-hidden rounded-3xl border border-border bg-ink-850/85">
                  <span
                    className={`absolute inset-x-0 top-0 z-20 h-1 bg-gradient-to-r ${p.accent} to-transparent`}
                    aria-hidden
                  />
                  <div className="relative aspect-[4/3] sm:aspect-[16/10]">
                    <Image
                      src={heroFor(p.slug, p.image)}
                      alt={`${p.name} — ${p.full} concept visual`}
                      fill
                      priority={i === 0}
                      sizes="(min-width: 1024px) 50vw, 100vw"
                      className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                    />
                    {/* per-product accent wash */}
                    <span
                      className={`absolute inset-0 bg-gradient-to-tr ${p.accent} via-transparent to-transparent opacity-25`}
                      aria-hidden
                    />
                    {/* blend the visual into the panel base (adapts to theme) */}
                    <span
                      className="absolute inset-0 bg-gradient-to-t from-ink-850 via-ink-850/25 to-transparent"
                      aria-hidden
                    />
                    <span
                      className="absolute right-6 top-5 select-none font-display text-6xl font-bold leading-none text-white/30 drop-shadow-md"
                      aria-hidden
                    >
                      {p.index}
                    </span>

                    {/* product identity anchored on the visual */}
                    <div className="absolute inset-x-0 bottom-0 flex flex-col items-start gap-5 p-7 sm:p-10">
                      <span className="flex size-16 items-center justify-center rounded-2xl border border-brand-500/40 bg-ink-850/85 text-brand-accent backdrop-blur-md">
                        <p.icon className="size-8" />
                      </span>
                      <div>
                        <p className="font-display text-3xl font-bold tracking-wide text-foreground">
                          {p.name}
                        </p>
                        <p className="mt-2 text-[12px] font-semibold uppercase tracking-[0.2em] text-brand-accent">
                          {p.full}
                        </p>
                        <p className="mt-3 text-[13px] font-medium text-muted-foreground">
                          {p.scope}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </RevealScale>

              {/* Copy */}
              <div className={i % 2 === 1 ? "lg:order-1" : ""}>
                <Reveal>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-brand-accent">
                    Product {p.index}
                  </p>
                </Reveal>
                <Reveal delay={0.08}>
                  <h2 className="mt-4 font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                    {p.name}
                  </h2>
                  <p className="mt-2 text-[12px] font-semibold uppercase tracking-[0.18em] text-brand-accent">
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
                    {p.capabilities.length > 3 && (
                      <span className="rounded-full border border-brand-500/25 bg-brand-500/10 px-3 py-1 text-[11px] font-semibold text-brand-accent">
                        +{p.capabilities.length - 3} more
                      </span>
                    )}
                  </div>
                </Reveal>
                <Reveal delay={0.3}>
                  <Link
                    href={`/products/${p.slug}`}
                    className="group mt-8 inline-flex items-center gap-2 font-display text-[16px] font-semibold text-brand-accent transition-colors hover:text-brand-accent-bright"
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
