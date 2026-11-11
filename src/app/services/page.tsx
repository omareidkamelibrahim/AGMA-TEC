import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Check } from "lucide-react";
import { PageHero } from "@/components/agma/page-hero";
import { Reveal, RevealScale } from "@/components/agma/reveal";
import { SectionHeading } from "@/components/agma/section-heading";
import { Process } from "@/components/agma/process";
import { CtaBand } from "@/components/agma/cta-band";
import { SERVICES } from "@/components/agma/services";

export const metadata: Metadata = {
  title: "Our Services",
  description:
    "Custom software development, mobile applications, cloud & DevOps, data & AI solutions, UI/UX design and digital consulting — delivered end to end by the same team that builds AGMA ERP, AGMA CAFM and AGMA CATERING.",
};

const FEATURES = [
  {
    image: "/services/engineering.jpg",
    alt: "AGMA TEC engineers reviewing an enterprise architecture diagram during a code review session",
    eyebrow: "Build",
    title: (
      <>
        Software that fits —{" "}
        <span className="text-gradient">because it is built for you.</span>
      </>
    ),
    text: "Off-the-shelf tools force your business to adapt to them. Our engineers do the opposite: custom web platforms, portals, APIs and mobile applications designed around the way your organization actually works — then integrated with the systems you already run, from accounting to warehouse floor.",
    points: [
      "Enterprise web platforms, portals & APIs",
      "Native-quality iOS & Android applications",
      "Deep integration with your existing stack",
    ],
  },
  {
    image: "/services/cloud-data.jpg",
    alt: "Modern data center corridor with blue server rack lights powering enterprise cloud workloads",
    eyebrow: "Modernize",
    title: (
      <>
        Cloud, data &{" "}
        <span className="text-gradient">intelligent operations.</span>
      </>
    ),
    text: "Infrastructure decisions made years ago should not decide what is possible tomorrow. We migrate workloads to Azure and AWS, automate delivery with CI/CD, and turn the data those systems produce into pipelines, executive dashboards and applied AI — intelligence embedded where decisions happen.",
    points: [
      "Cloud migration & infrastructure-as-code",
      "Data pipelines & executive BI dashboards",
      "Applied AI — from predictive models to agents",
    ],
  },
  {
    image: "/services/consulting.jpg",
    alt: "AGMA TEC consultants facilitating a digital transformation roadmap workshop with a client team",
    eyebrow: "Partner",
    title: (
      <>
        A partner through the{" "}
        <span className="text-gradient">whole transformation.</span>
      </>
    ),
    text: "Technology fails when it is dropped on people without a plan. Our consultants map processes, sequence the roadmap and prepare your teams before anything changes — and our designers make complex enterprise products feel effortless, with interfaces your staff actually want to use.",
    points: [
      "Technology roadmaps & ERP advisory",
      "Process digitization strategy",
      "Research-driven UI/UX & design systems",
    ],
  },
];

const ENGAGEMENTS = [
  {
    index: "01",
    title: "Build",
    text: "Bespoke software engineered around your workflows — platforms, portals, apps and APIs that off-the-shelf products cannot match.",
  },
  {
    index: "02",
    title: "Implement",
    text: "AGMA ERP, AGMA CAFM and AGMA CATERING configured, migrated and launched by the same team that develops them.",
  },
  {
    index: "03",
    title: "Run",
    text: "User training, responsive support and continuous product evolution — your systems keep improving long after go-live.",
  },
];

export default function ServicesPage() {
  return (
    <>
      <PageHero
        eyebrow="What We Do"
        title={
          <>
            Capability that covers{" "}
            <span className="text-gradient">the whole transformation.</span>
          </>
        }
        description="Six disciplines, one accountable team. Start with a single engagement or let us own the entire journey — every capability plugs into the next."
      />

      {/* ── Service disciplines ───────────────────────────────────── */}
      <section className="relative pb-8 pt-4 sm:pb-10" aria-label="Service disciplines">
        <div className="mx-auto w-full max-w-7xl px-5 sm:px-8">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {SERVICES.map((s, i) => (
              <RevealScale key={s.title} delay={(i % 3) * 0.08} className="h-full">
                <article className="card-lift group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-ink-850/85 p-7">
                  <div className="pointer-events-none absolute -right-14 -top-14 size-36 rounded-full bg-brand-600/0 blur-2xl transition-colors duration-500 group-hover:bg-brand-600/15" />
                  <div className="flex items-start justify-between gap-4">
                    <span className="flex size-12 shrink-0 items-center justify-center rounded-xl border border-brand-500/25 bg-brand-500/10 text-brand-accent transition-all duration-500 group-hover:border-brand-400/50 group-hover:bg-brand-500/20 group-hover:text-brand-accent-bright">
                      <s.icon className="size-6" />
                    </span>
                    <span
                      className="select-none font-display text-4xl font-bold leading-none text-brand-500/15"
                      aria-hidden
                    >
                      0{i + 1}
                    </span>
                  </div>
                  <h2 className="mt-5 font-display text-lg font-semibold leading-snug text-foreground">
                    {s.title}
                  </h2>
                  <p className="mt-2.5 flex-1 text-sm leading-relaxed text-muted-foreground">
                    {s.text}
                  </p>
                  <div className="mt-5 flex flex-wrap gap-2">
                    {s.tags.map((t) => (
                      <span
                        key={t}
                        className="rounded-full border border-border/80 bg-ink-800/70 px-3 py-1 text-[11px] font-medium text-foreground/60"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </article>
              </RevealScale>
            ))}
          </div>
        </div>
      </section>

      {/* ── Feature rows with imagery ─────────────────────────────── */}
      <section className="relative py-16 sm:py-20" aria-label="How we deliver">
        <div className="mx-auto w-full max-w-7xl space-y-16 px-5 sm:space-y-24 sm:px-8">
          {FEATURES.map((f, i) => (
            <div
              key={f.eyebrow}
              className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16"
            >
              <RevealScale className={i % 2 === 1 ? "lg:order-2" : ""}>
                <figure className="relative overflow-hidden rounded-3xl border border-border bg-ink-850/85">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={f.image}
                    alt={f.alt}
                    loading="lazy"
                    className="aspect-[7/4] w-full object-cover transition-transform duration-700 ease-out hover:scale-[1.03]"
                  />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink-900/25 via-transparent to-transparent" />
                  <figcaption className="absolute bottom-4 left-4 flex items-center gap-2 rounded-full border border-white/15 bg-[#050b16]/70 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-200 backdrop-blur-sm">
                    <span className="size-1.5 rounded-full bg-brand-400" aria-hidden />
                    {f.eyebrow}
                  </figcaption>
                </figure>
              </RevealScale>

              <div className={i % 2 === 1 ? "lg:order-1" : ""}>
                <Reveal>
                  <h2 className="font-display text-2xl font-bold leading-snug tracking-tight text-foreground sm:text-3xl">
                    {f.title}
                  </h2>
                </Reveal>
                <Reveal delay={0.08}>
                  <p className="mt-5 text-base leading-relaxed text-muted-foreground">
                    {f.text}
                  </p>
                </Reveal>
                <Reveal delay={0.16}>
                  <ul className="mt-6 space-y-3">
                    {f.points.map((pt) => (
                      <li key={pt} className="flex items-start gap-3 text-sm text-foreground/85">
                        <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border border-brand-500/30 bg-brand-500/10">
                          <Check className="size-3 text-brand-accent" />
                        </span>
                        {pt}
                      </li>
                    ))}
                  </ul>
                </Reveal>
                <Reveal delay={0.24}>
                  <Link
                    href="/contact"
                    className="group mt-8 inline-flex items-center gap-2 font-display text-[15px] font-semibold text-brand-accent transition-colors hover:text-brand-accent-bright"
                  >
                    Discuss this with our team
                    <ArrowUpRight className="size-4.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </Link>
                </Reveal>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Engagement models ─────────────────────────────────────── */}
      <section
        className="relative border-t border-border/60 bg-ink-900/40 py-20 sm:py-24"
        aria-label="Engagement models"
      >
        <div className="absolute inset-0 -z-10 bg-dots opacity-30" />
        <div className="mx-auto w-full max-w-7xl px-5 sm:px-8">
          <SectionHeading
            eyebrow="Ways to Work With Us"
            title={
              <>
                Three ways to put us{" "}
                <span className="text-gradient">to work.</span>
              </>
            }
            description="Whether you need a product implemented, a platform built from zero, or a team that keeps everything running — the accountability stays with us."
          />
          <div className="mt-14 grid gap-5 md:grid-cols-3">
            {ENGAGEMENTS.map((e, i) => (
              <RevealScale key={e.title} delay={i * 0.08} className="h-full">
                <article className="card-lift relative h-full overflow-hidden rounded-2xl border border-border bg-ink-850/85 p-8">
                  <span
                    className="absolute -right-4 -top-5 select-none font-display text-[6rem] font-bold leading-none text-brand-500/10"
                    aria-hidden
                  >
                    {e.index}
                  </span>
                  <span className="inline-flex items-center gap-2.5 rounded-full border border-brand-500/25 bg-brand-500/10 px-3.5 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-accent">
                    <span className="size-1.5 rounded-full bg-brand-500" aria-hidden />
                    Model {e.index}
                  </span>
                  <h3 className="mt-5 font-display text-xl font-semibold text-foreground">
                    {e.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    {e.text}
                  </p>
                </article>
              </RevealScale>
            ))}
          </div>
        </div>
      </section>

      {/* ── Delivery process ──────────────────────────────────────── */}
      <Process />

      <CtaBand />
    </>
  );
}
