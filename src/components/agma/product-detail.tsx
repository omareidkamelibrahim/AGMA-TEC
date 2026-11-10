import { ArrowUpRight, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { SectionHeading, BeadDots } from "./section-heading";
import { Reveal, RevealScale } from "./reveal";
import { AgmaMark } from "./logo";
import { getSiblingProducts, type Product } from "@/lib/products";

/**
 * Shared body for the three product detail pages:
 * overview (outcomes + visual panel), capabilities grid,
 * ownership band and the rest of the suite.
 */
export function ProductDetail({ product }: { product: Product }) {
  const siblings = getSiblingProducts(product.slug);

  return (
    <>
      {/* ── Overview ─────────────────────────────────────────────── */}
      <section className="relative py-20 sm:py-24">
        <div className="mx-auto grid w-full max-w-7xl items-center gap-12 px-5 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
          <div>
            <Reveal>
              <h2 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                What <span className="text-gradient">{product.name}</span>{" "}
                delivers
              </h2>
            </Reveal>
            <Reveal delay={0.1}>
              <ul className="mt-8 space-y-4">
                {product.outcomes.map((o) => (
                  <li
                    key={o}
                    className="flex items-start gap-3.5 rounded-xl border border-border/70 bg-ink-850/85 px-5 py-4"
                  >
                    <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-brand-300" />
                    <span className="text-[15px] leading-relaxed text-foreground/90">
                      {o}
                    </span>
                  </li>
                ))}
              </ul>
            </Reveal>
            <Reveal delay={0.18}>
              <p className="mt-8 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-[15px]">
                {product.description}
              </p>
            </Reveal>
          </div>

          {/* Visual panel — brand iconography, no invented UI */}
          <RevealScale>
            <div
              className={`relative overflow-hidden rounded-3xl border border-border bg-ink-850/85 p-10 sm:p-14`}
            >
              <div className="absolute inset-0 bg-dots opacity-30" />
              <span
                className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${product.accent} to-transparent`}
                aria-hidden
              />
              <AgmaMark className="absolute -bottom-8 -right-8 h-40 w-auto opacity-[0.06]" />
              <div className="relative flex flex-col items-start gap-7">
                <span className="flex size-20 items-center justify-center rounded-2xl border border-brand-500/25 bg-brand-500/10 text-brand-300">
                  <product.icon className="size-10" />
                </span>
                <div>
                  <p className="font-display text-3xl font-bold tracking-wide text-foreground">
                    {product.name}
                  </p>
                  <p className="mt-2 text-[12px] font-semibold uppercase tracking-[0.2em] text-brand-300">
                    {product.full}
                  </p>
                  <p className="mt-4 text-[13px] font-medium text-muted-foreground">
                    {product.scope}
                  </p>
                </div>
                <span className="inline-flex items-center gap-1.5" aria-hidden>
                  <span className="h-1.5 w-1.5 rounded-full bg-brand-700" />
                  <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />
                  <span className="h-1.5 w-1.5 rounded-full bg-brand-300" />
                </span>
              </div>
            </div>
          </RevealScale>
        </div>
      </section>

      {/* ── Capabilities ─────────────────────────────────────────── */}
      <section className="relative border-t border-border/60 bg-ink-900/40 py-20 sm:py-24">
        <div className="absolute inset-0 -z-10 bg-dots opacity-30" />
        <div className="mx-auto w-full max-w-7xl px-5 sm:px-8">
          <SectionHeading
            eyebrow="Capabilities"
            title={
              <>
                What {product.name}{" "}
                <span className="text-gradient">Covers</span>
              </>
            }
            description={`The functional areas ${product.name} brings together in one integrated solution.`}
          />

          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {product.capabilities.map((c, i) => (
              <RevealScale key={c.label} delay={(i % 3) * 0.08} className="h-full">
                <article className="card-lift group h-full rounded-2xl border border-border bg-ink-850/85 p-7">
                  <span className="flex size-12 items-center justify-center rounded-xl border border-brand-500/25 bg-brand-500/10 text-brand-300 transition-colors duration-500 group-hover:border-brand-400/50 group-hover:bg-brand-500/20 group-hover:text-brand-200">
                    <c.icon className="size-6" />
                  </span>
                  <h3 className="mt-5 font-display text-lg font-semibold leading-snug text-foreground">
                    {c.label}
                  </h3>
                  <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">
                    {c.text}
                  </p>
                </article>
              </RevealScale>
            ))}
          </div>
        </div>
      </section>

      {/* ── Ownership band ───────────────────────────────────────── */}
      <section className="relative py-20 sm:py-24">
        <div className="mx-auto w-full max-w-7xl px-5 sm:px-8">
          <Reveal>
            <div className="relative overflow-hidden rounded-3xl border border-brand-500/25 bg-gradient-to-br from-ink-800 via-ink-850 to-brand-950/60 p-8 sm:p-12">
              <div className="absolute inset-0 bg-grid opacity-50" />
              <div className="relative flex flex-col items-start gap-6 lg:flex-row lg:items-center lg:justify-between">
                <div className="max-w-2xl">
                  <p className="flex items-center gap-2.5 text-[11px] font-semibold uppercase tracking-[0.24em] text-brand-300">
                    <BeadDots />
                    Own Technology
                  </p>
                  <h2 className="mt-4 font-display text-2xl font-bold leading-snug tracking-tight text-foreground sm:text-3xl">
                    {product.name} is developed, implemented and supported by{" "}
                    <span className="text-gradient">AGMA TEC&apos;s own team.</span>
                  </h2>
                  <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-[15px]">
                    From requirements and configuration to training and
                    long-term support — one accountable partner across the
                    entire lifecycle of your solution.
                  </p>
                </div>
                <Link
                  href="/contact"
                  className="group inline-flex shrink-0 items-center gap-2 rounded-full bg-brand-600 px-7 py-3.5 font-display text-[15px] font-semibold text-white shadow-[0_14px_44px_-10px_rgba(46,123,214,0.8)] transition-colors hover:bg-brand-500"
                >
                  Discuss your requirements
                  <ArrowUpRight className="size-4.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Rest of the suite ────────────────────────────────────── */}
      <section className="relative border-t border-border/60 py-20 sm:py-24">
        <div className="mx-auto w-full max-w-7xl px-5 sm:px-8">
          <Reveal>
            <h2 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Explore More of the{" "}
              <span className="text-gradient">Suite</span>
            </h2>
          </Reveal>
          <div className="mt-10 grid gap-5 md:grid-cols-2">
            {siblings.map((p, i) => (
              <RevealScale key={p.slug} delay={i * 0.08} className="h-full">
                <Link
                  href={`/products/${p.slug}`}
                  className="card-lift group flex h-full items-center gap-5 rounded-2xl border border-border bg-ink-850/85 p-6 sm:p-7"
                >
                  <span className="flex size-14 shrink-0 items-center justify-center rounded-xl border border-brand-500/25 bg-brand-500/10 text-brand-300">
                    <p.icon className="size-7" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-display text-lg font-bold tracking-wide text-foreground">
                      {p.name}
                    </span>
                    <span className="mt-0.5 block text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-300">
                      {p.full}
                    </span>
                    <span className="mt-1.5 block text-[13px] text-muted-foreground">
                      {p.scope}
                    </span>
                  </span>
                  <ArrowUpRight className="size-5 shrink-0 text-brand-400/60 transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-brand-300" />
                </Link>
              </RevealScale>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
