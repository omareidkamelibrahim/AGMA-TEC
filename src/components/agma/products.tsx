import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { SectionHeading } from "./section-heading";
import { Reveal, RevealScale } from "./reveal";
import { PRODUCTS } from "@/lib/products";

/**
 * Homepage showcase for the three core AGMA products.
 * Cards link to their dedicated product pages.
 */
export function Products() {
  return (
    <section
      id="products"
      className="relative scroll-mt-24 border-t border-border/60 bg-ink-900/40 py-24 sm:py-32"
    >
      <div className="absolute inset-0 -z-10 bg-dots opacity-30" />

      <div className="mx-auto w-full max-w-7xl px-5 sm:px-8">
        <SectionHeading
          eyebrow="Product Suite"
          title={
            <>
              Our Products <span className="text-gradient">&amp; Solutions</span>
            </>
          }
          description="Powerful, integrated solutions designed to simplify business operations, optimize resources, and support organizational growth."
        />

        <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {PRODUCTS.map((p, i) => (
            <RevealScale key={p.slug} delay={i * 0.1} className="h-full">
              <article className="card-lift group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-ink-850/85">
                {/* per-product brand accent line */}
                <span
                  className={`h-1 w-full bg-gradient-to-r ${p.accent} to-transparent`}
                  aria-hidden
                />

                <div className="flex flex-1 flex-col p-7 sm:p-8">
                  {/* icon + index */}
                  <div className="flex items-start justify-between">
                    <span className="flex size-13 items-center justify-center rounded-xl border border-brand-500/25 bg-brand-500/10 text-brand-accent transition-colors duration-500 group-hover:border-brand-400/50 group-hover:bg-brand-500 light:hover:bg-brand-700/20 group-hover:text-brand-accent-bright">
                      <p.icon className="size-6.5" />
                    </span>
                    <span
                      className="select-none font-display text-5xl font-bold leading-none text-brand-500/10 transition-colors duration-500 group-hover:text-brand-500/20"
                      aria-hidden
                    >
                      {p.index}
                    </span>
                  </div>

                  <h3 className="mt-6 font-display text-2xl font-bold tracking-wide text-foreground">
                    {p.name}
                  </h3>
                  <p className="mt-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-accent">
                    {p.full}
                  </p>
                  <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                    {p.description}
                  </p>

                  <div className="mt-6 flex flex-wrap gap-2">
                    {p.capabilities.map((c) => (
                      <span
                        key={c.label}
                        className="rounded-full border border-border/80 bg-ink-800/70 px-3 py-1 text-[11px] font-medium text-foreground/60"
                      >
                        {c.label}
                      </span>
                    ))}
                  </div>

                  <Link
                    href={`/products/${p.slug}`}
                    className="mt-auto inline-flex items-center gap-2 pt-8 font-display text-[15px] font-semibold text-brand-accent transition-colors hover:text-brand-accent-bright"
                  >
                    Explore {p.name}
                    <ArrowUpRight className="size-4.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </Link>
                </div>
              </article>
            </RevealScale>
          ))}
        </div>

        <Reveal delay={0.2}>
          <p className="mt-12 text-center text-sm text-muted-foreground">
            Every AGMA solution is developed, implemented and supported by our
            own team —{" "}
            <Link
              href="/contact"
              className="font-medium text-brand-accent transition-colors hover:text-brand-accent-bright"
            >
              talk to us about your requirements
            </Link>
            .
          </p>
        </Reveal>
      </div>
    </section>
  );
}
