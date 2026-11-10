import {
  BrainCircuit,
  CloudLightning,
  Code2,
  Compass,
  PenTool,
  Smartphone,
  ArrowUpRight,
} from "lucide-react";
import { SectionHeading } from "./section-heading";
import { Reveal, RevealScale } from "./reveal";

const SERVICES = [
  {
    icon: Code2,
    title: "Custom Software Development",
    text: "Enterprise web platforms, portals and APIs engineered for scale — built on modern stacks, integrated with the systems you already run.",
    tags: ["Web platforms", "System integration", "APIs"],
  },
  {
    icon: Smartphone,
    title: "Mobile Applications",
    text: "Native-quality iOS and Android apps with a single, efficient codebase — from customer-facing products to field-operations tools.",
    tags: ["iOS & Android", "Flutter", "App-store delivery"],
  },
  {
    icon: CloudLightning,
    title: "Cloud & DevOps",
    text: "Migration, infrastructure-as-code and CI/CD pipelines that ship faster with less risk — monitored and optimized around the clock.",
    tags: ["Azure & AWS", "CI/CD", "Observability"],
  },
  {
    icon: BrainCircuit,
    title: "Data & AI Solutions",
    text: "Data pipelines, executive dashboards and applied AI — from predictive models to intelligent agents embedded in your workflows.",
    tags: ["BI dashboards", "Machine learning", "AI agents"],
  },
  {
    icon: PenTool,
    title: "UI/UX & Product Design",
    text: "Research-driven experience design and design systems that make complex enterprise products feel effortless — and unmistakably yours.",
    tags: ["Research", "Design systems", "Prototyping"],
  },
  {
    icon: Compass,
    title: "Digital Consulting",
    text: "Technology roadmaps, ERP advisory and process digitization strategy — a clear, sequenced path from where you are to where you need to be.",
    tags: ["Roadmapping", "ERP advisory", "Process digitization"],
  },
];

export function Services() {
  return (
    <section id="services" className="relative scroll-mt-24 border-t border-border/60 bg-ink-900/40 py-24 sm:py-32">
      <div className="absolute inset-0 -z-10 bg-dots opacity-30" />
      <div className="mx-auto grid w-full max-w-7xl gap-14 px-5 sm:px-8 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
        {/* Sticky left rail */}
        <div className="lg:sticky lg:top-32 lg:self-start">
          <SectionHeading
            align="left"
            eyebrow="What We Do"
            title={
              <>
                Capabilities that cover the{" "}
                <span className="text-gradient">whole transformation.</span>
              </>
            }
            description="Six disciplines, one accountable team. Start with a single engagement or let us own the entire journey — every capability plugs into the next."
          />
          <Reveal delay={0.24}>
            <a
              href="#contact"
              className="group mt-8 inline-flex items-center gap-2 font-display text-[15px] font-semibold text-brand-300 transition-colors hover:text-brand-200"
            >
              Discuss your initiative
              <ArrowUpRight className="size-4.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </a>
          </Reveal>
        </div>

        {/* Cards */}
        <div className="grid gap-5 sm:grid-cols-2">
          {SERVICES.map((s, i) => (
            <RevealScale key={s.title} delay={(i % 2) * 0.08} className="h-full">
              <article className="card-lift group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-ink-850/85 p-7">
                <div className="pointer-events-none absolute -right-14 -top-14 size-36 rounded-full bg-brand-600/0 blur-2xl transition-colors duration-500 group-hover:bg-brand-600/15" />
                <span className="flex size-12 items-center justify-center rounded-xl border border-brand-500/25 bg-brand-500/10 text-brand-300 transition-all duration-500 group-hover:border-brand-400/50 group-hover:bg-brand-500/20 group-hover:text-brand-200">
                  <s.icon className="size-6" />
                </span>
                <h3 className="mt-5 font-display text-lg font-semibold leading-snug text-foreground">
                  {s.title}
                </h3>
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
  );
}
