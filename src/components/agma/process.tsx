import { Compass, PenTool, Code2, Rocket } from "lucide-react";
import { SectionHeading } from "./section-heading";
import { Reveal } from "./reveal";

const STEPS = [
  {
    icon: Compass,
    step: "01",
    title: "Discover & Strategize",
    text: "We immerse in your business — stakeholder interviews, process audits, technical assessment — and shape a roadmap with measurable outcomes.",
    output: "Transformation roadmap & business case",
  },
  {
    icon: PenTool,
    step: "02",
    title: "Design & Prototype",
    text: "User research, journey mapping and rapid prototyping turn the strategy into something you can see, click and challenge before a line of production code.",
    output: "Validated prototypes & design system",
  },
  {
    icon: Code2,
    step: "03",
    title: "Build & Integrate",
    text: "Agile delivery in two-week increments: clean architecture, rigorous code review, and deep integration with your ERP, CRM and data platforms.",
    output: "Production-ready platform, integrated",
  },
  {
    icon: Rocket,
    step: "04",
    title: "Deploy & Scale",
    text: "Zero-downtime launches, team enablement and 24/7 monitoring — then continuous iteration as usage, data and ambition grow.",
    output: "Always-on operations & growth loop",
  },
];

export function Process() {
  return (
    <section id="process" className="relative scroll-mt-24 py-24 sm:py-32">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(45%_35%_at_10%_60%,var(--glow-navy-md),transparent_70%)]" />

      <div className="mx-auto w-full max-w-7xl px-5 sm:px-8">
        <SectionHeading
          eyebrow="How We Work"
          title={
            <>
              A delivery process{" "}
              <span className="text-gradient">without the black box.</span>
            </>
          }
          description="Four connected phases — like the beads of our mark, each one linked to the next. You see progress every two weeks, with a demo you can actually use."
        />

        <div className="relative mt-16 lg:mt-20">
          {/* connecting spine (desktop) */}
          <div
            aria-hidden
            className="absolute left-0 right-0 top-[52px] hidden h-px bg-gradient-to-r from-transparent via-brand-600/50 to-transparent lg:block"
          />
          {/* connecting spine (mobile) */}
          <div
            aria-hidden
            className="absolute bottom-8 left-[52px] top-8 w-px bg-gradient-to-b from-transparent via-brand-600/50 to-transparent sm:block lg:hidden"
          />

          <ol className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
            {STEPS.map((s, i) => (
              <Reveal key={s.step} delay={i * 0.1}>
                <li className="group relative flex gap-5 sm:flex-col lg:px-2">
                  <div className="relative shrink-0">
                    <span className="relative z-10 flex size-[72px] items-center justify-center rounded-full border border-brand-500/30 bg-ink-850 text-brand-accent shadow-[0_0_36px_-8px_rgba(46,123,214,0.5)] transition-all duration-500 group-hover:border-brand-400/60 group-hover:text-brand-accent-bright">
                      <s.icon className="size-7" />
                    </span>
                    <span className="absolute -right-1 -top-1 z-20 flex size-6 items-center justify-center rounded-full bg-brand-600 font-display text-[10px] font-bold text-white shadow-lg">
                      {i + 1}
                    </span>
                  </div>
                  <div className="lg:mt-6">
                    <p className="font-display text-xs font-semibold uppercase tracking-[0.22em] text-brand-400 light:text-brand-accent">
                      {s.step}
                    </p>
                    <h3 className="mt-2 font-display text-xl font-semibold text-foreground">
                      {s.title}
                    </h3>
                    <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">
                      {s.text}
                    </p>
                    <p className="mt-4 inline-flex rounded-lg border border-border/70 bg-ink-850/70 px-3 py-1.5 text-[11.5px] font-medium text-brand-accent/90">
                      {s.output}
                    </p>
                  </div>
                </li>
              </Reveal>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
