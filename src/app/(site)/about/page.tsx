import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { PageHero } from "@/components/agma/page-hero";
import { PILLARS, VALUES } from "@/components/agma/about";
import { Reveal, RevealScale } from "@/components/agma/reveal";
import { AgmaMark } from "@/components/agma/logo";
import { Team } from "@/components/agma/team";
import { CtaBand } from "@/components/agma/cta-band";
import { getProducts } from "@/lib/site-content";

// Product strip reads DB-managed content.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "AGMA TEC is an enterprise technology company specializing in integrated business management solutions. We develop our own software products — AGMA ERP, AGMA CAFM and AGMA CATERING — and help organizations streamline operations and accelerate digital transformation.",
};

export default async function AboutPage() {
  const products = await getProducts();
  return (
    <>
      <PageHero
        eyebrow="About AGMA TEC"
        title={
          <>
            Technology That{" "}
            <span className="text-gradient">Moves Businesses Forward.</span>
          </>
        }
        description="AGMA TEC is an enterprise technology company specializing in integrated business management solutions — combining our own line of software products with hands-on implementation expertise."
      />

      {/* ── The four content elements ─────────────────────────────── */}
      <section className="relative py-16 sm:py-20">
        <div className="mx-auto w-full max-w-7xl px-5 sm:px-8">
          <div className="grid gap-5 sm:grid-cols-2">
            {PILLARS.map((p, i) => (
              <RevealScale key={p.title} delay={i * 0.08} className="h-full">
                <article className="card-lift flex h-full flex-col rounded-2xl border border-border bg-ink-850/85 p-7 sm:p-9">
                  <span className="flex size-12 shrink-0 items-center justify-center rounded-xl border border-brand-500/25 bg-brand-500/10 text-brand-accent">
                    <p.icon className="size-6" />
                  </span>
                  <h2 className="mt-5 font-display text-xl font-semibold text-foreground sm:text-2xl">
                    {p.title}
                  </h2>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-[15px]">
                    {p.text}
                  </p>
                </article>
              </RevealScale>
            ))}
          </div>
        </div>
      </section>

      {/* ── Brand story ───────────────────────────────────────────── */}
      <section className="relative border-t border-border/60 bg-ink-900/40 py-20 sm:py-24">
        <div className="absolute inset-0 -z-10 bg-dots opacity-30" />
        <div className="mx-auto w-full max-w-7xl px-5 sm:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-[0.95fr_1.05fr] lg:gap-16">
            <RevealScale>
              <div className="relative overflow-hidden rounded-3xl border border-border bg-ink-850/85 p-10 sm:p-14">
                <div className="absolute inset-0 bg-dots opacity-40" />
                <AgmaMark animated className="relative h-36 w-auto sm:h-44" />
                <p className="relative mt-8 font-display text-xl font-semibold text-foreground">
                  One connected shape
                </p>
                <p className="relative mt-2 text-sm leading-relaxed text-muted-foreground">
                  Our mark is our method: individual capabilities, fused into a
                  single structure that carries far more than each part could
                  alone.
                </p>
              </div>
            </RevealScale>
            <div>
              <Reveal>
                <span className="inline-flex items-center gap-2.5 rounded-full border border-brand-500/25 bg-brand-500/10 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.24em] text-brand-accent">
                  Our Story
                </span>
              </Reveal>
              <Reveal delay={0.08}>
                <h2 className="mt-6 font-display text-2xl font-bold leading-snug tracking-tight text-foreground sm:text-3xl">
                  Like the six beads of our logo —{" "}
                  <span className="text-gradient">separate nodes, one shape.</span>
                </h2>
              </Reveal>
              <Reveal delay={0.16}>
                <p className="mt-6 text-base leading-relaxed text-muted-foreground">
                  AGMA TEC exists to connect the disconnected parts of an
                  organization: people, processes, data and technology. We
                  build our own business management products and implement them
                  directly with our clients — so strategy, engineering,
                  deployment and support stay with one accountable team.
                </p>
              </Reveal>
              <Reveal delay={0.24}>
                <p className="mt-4 text-base leading-relaxed text-muted-foreground">
                  The result is technology that reflects how a business
                  actually runs: integrated, reliable and ready to grow with
                  the organization it serves.
                </p>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* ── How we work ───────────────────────────────────────────── */}
      <section className="relative py-20 sm:py-24">
        <div className="mx-auto w-full max-w-7xl px-5 sm:px-8">
          <Reveal>
            <h2 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              How We <span className="text-gradient">Work</span>
            </h2>
          </Reveal>
          <div className="mt-10 grid gap-5 sm:grid-cols-3">
            {VALUES.map((v, i) => (
              <RevealScale key={v.title} delay={i * 0.08} className="h-full">
                <div className="h-full rounded-2xl border border-border/80 bg-ink-850/85 p-7">
                  <span className="inline-flex items-center gap-1" aria-hidden>
                    <span className="h-1.5 w-1.5 rounded-full bg-brand-700" />
                    <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />
                    <span className="h-1.5 w-1.5 rounded-full bg-brand-300" />
                  </span>
                  <h3 className="mt-4 font-display text-[17px] font-semibold text-foreground">
                    {v.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {v.text}
                  </p>
                </div>
              </RevealScale>
            ))}
          </div>
        </div>
      </section>

      {/* ── Our team ──────────────────────────────────────────────── */}
      <Team />

      {/* ── Products strip ────────────────────────────────────────── */}
      <section className="relative border-t border-border/60 bg-ink-900/40 py-20 sm:py-24">
        <div className="mx-auto w-full max-w-7xl px-5 sm:px-8">
          <Reveal>
            <div className="flex flex-wrap items-end justify-between gap-6">
              <h2 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                Software We <span className="text-gradient">Own &amp; Build</span>
              </h2>
              <Link
                href="/products"
                className="group inline-flex items-center gap-2 font-display text-[15px] font-semibold text-brand-accent transition-colors hover:text-brand-accent-bright"
              >
                View all products
                <ArrowUpRight className="size-4.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
            </div>
          </Reveal>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {products.map((p, i) => (
              <RevealScale key={p.slug} delay={i * 0.08} className="h-full">
                <Link
                  href={`/products/${p.slug}`}
                  className="card-lift group flex h-full items-center gap-4 rounded-2xl border border-border bg-ink-850/85 p-6"
                >
                  <span className="flex size-12 shrink-0 items-center justify-center rounded-xl border border-brand-500/25 bg-brand-500/10 text-brand-accent">
                    <p.icon className="size-6" />
                  </span>
                  <span className="min-w-0">
                    <span className="block font-display text-[15px] font-bold tracking-wide text-foreground">
                      {p.name}
                    </span>
                    <span className="mt-0.5 block truncate text-[12px] text-muted-foreground">
                      {p.full}
                    </span>
                  </span>
                </Link>
              </RevealScale>
            ))}
          </div>
        </div>
      </section>

      <CtaBand />
    </>
  );
}
