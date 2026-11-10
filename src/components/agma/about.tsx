import { Eye, Goal, Handshake, Layers, LineChart, Users } from "lucide-react";
import { SectionHeading, BeadDots } from "./section-heading";
import { Reveal, RevealScale } from "./reveal";
import { AgmaMark } from "./logo";

const PILLARS = [
  {
    icon: Goal,
    title: "Our Mission",
    text: "To make enterprise-grade technology accessible to every ambitious organization — designing digital products that remove friction, unlock data and create measurable growth.",
  },
  {
    icon: Eye,
    title: "Our Vision",
    text: "A world where every business, regardless of size, operates on connected, intelligent systems — where technology feels less like a tool and more like a competitive instinct.",
  },
  {
    icon: Handshake,
    title: "Our Promise",
    text: "We act as your long-term transformation partner, not a vendor. Transparent roadmaps, measurable outcomes and a team that treats your product like our own.",
  },
];

const VALUES = [
  {
    icon: Layers,
    title: "Engineering depth",
    text: "Senior architects and engineers on every engagement — no bait-and-switch staffing.",
  },
  {
    icon: LineChart,
    title: "Outcome obsession",
    text: "We measure success in KPIs moved, not tickets closed. Every sprint maps to business value.",
  },
  {
    icon: Users,
    title: "True partnership",
    text: "Your team works side-by-side with ours. Knowledge transfer is built into every delivery.",
  },
];

export function About() {
  return (
    <section id="about" className="relative scroll-mt-24 py-24 sm:py-32">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(50%_40%_at_85%_15%,rgba(22,51,91,0.35),transparent_70%)]" />

      <div className="mx-auto w-full max-w-7xl px-5 sm:px-8">
        <div className="grid items-start gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
          {/* Left — sticky intro */}
          <div className="lg:sticky lg:top-32">
            <SectionHeading
              align="left"
              eyebrow="Who We Are"
              title={
                <>
                  A transformation partner{" "}
                  <span className="text-gradient">built on connection.</span>
                </>
              }
            />
            <Reveal delay={0.2}>
              <p className="mt-6 text-base leading-relaxed text-muted-foreground sm:text-lg">
                Like the six beads of our logo — separate nodes fused into one
                stronger shape — AGMA TEC exists to connect the disconnected
                parts of a business: people, processes, data and technology.
                Founded by engineers and enterprise consultants, we deliver the
                full transformation journey: strategy, design, engineering and
                always-on operations.
              </p>
            </Reveal>
            <Reveal delay={0.28}>
              <div className="relative mt-10 overflow-hidden rounded-2xl border border-border bg-ink-850/80 p-8">
                <div className="absolute inset-0 bg-dots opacity-40" />
                <div className="relative flex items-center gap-6">
                  <AgmaMark animated className="h-20 w-auto shrink-0" />
                  <div>
                    <p className="font-display text-lg font-semibold text-foreground">
                      One connected shape
                    </p>
                    <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                      Our mark is our method: individual capabilities, fused
                      into a single structure that carries far more than each
                      part could alone.
                    </p>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>

          {/* Right — pillars + values */}
          <div className="space-y-5">
            {PILLARS.map((p, i) => (
              <RevealScale key={p.title} delay={i * 0.08}>
                <article className="card-lift rounded-2xl border border-border bg-ink-850/85 p-7 sm:p-8">
                  <div className="flex items-start gap-5">
                    <span className="flex size-12 shrink-0 items-center justify-center rounded-xl border border-brand-500/25 bg-brand-500/10 text-brand-300">
                      <p.icon className="size-6" />
                    </span>
                    <div>
                      <h3 className="font-display text-xl font-semibold text-foreground">
                        {p.title}
                      </h3>
                      <p className="mt-2.5 leading-relaxed text-muted-foreground">
                        {p.text}
                      </p>
                    </div>
                  </div>
                </article>
              </RevealScale>
            ))}

            <Reveal delay={0.1}>
              <div className="grid gap-5 pt-4 sm:grid-cols-3">
                {VALUES.map((v) => (
                  <div
                    key={v.title}
                    className="rounded-2xl border border-border/80 bg-ink-900/70 p-5"
                  >
                    <BeadDots className="mb-3" />
                    <h4 className="font-display text-[15px] font-semibold text-foreground">
                      {v.title}
                    </h4>
                    <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">
                      {v.text}
                    </p>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
