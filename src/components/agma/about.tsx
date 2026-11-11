import {
  Eye,
  Goal,
  Users,
  BadgeCheck,
  Layers,
  LineChart,
} from "lucide-react";
import { SectionHeading } from "./section-heading";
import { Reveal, RevealScale } from "./reveal";
import { AgmaMark } from "./logo";

/**
 * The four About content elements (shared by the homepage teaser and
 * the /about page). Concise corporate copy — no excessive paragraphs.
 */
export const PILLARS = [
  {
    icon: Users,
    title: "Who We Are",
    text: "AGMA TEC is an enterprise technology company specializing in integrated business management solutions. We develop our own line of software products and combine them with hands-on implementation expertise.",
  },
  {
    icon: Goal,
    title: "Our Mission",
    text: "To simplify how organizations operate. We turn fragmented, manual processes into streamlined digital workflows that save time, reduce cost and give leadership full visibility over the business.",
  },
  {
    icon: Eye,
    title: "Our Vision",
    text: "To be the long-term technology partner organizations rely on — where every business runs on intelligent, connected systems and technology becomes a driver of continuous growth.",
  },
  {
    icon: BadgeCheck,
    title: "Why AGMA TEC",
    text: "Because we own what we build. Proven products, expert implementation and continuous support come from one accountable team — not a chain of vendors.",
  },
];

/** Enduring working principles — established AGMA TEC positioning. */
export const VALUES = [
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
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(50%_40%_at_85%_15%,var(--glow-navy),transparent_70%)]" />

      <div className="mx-auto w-full max-w-7xl px-5 sm:px-8">
        <div className="grid items-start gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
          {/* Left — sticky intro */}
          <div className="lg:sticky lg:top-32">
            <SectionHeading
              align="left"
              eyebrow="About AGMA TEC"
              title={
                <>
                  Technology That{" "}
                  <span className="text-gradient">Moves Businesses Forward.</span>
                </>
              }
            />
            <Reveal delay={0.2}>
              <p className="mt-6 text-base leading-relaxed text-muted-foreground sm:text-lg">
                Like the six beads of our logo — separate nodes fused into one
                stronger shape — AGMA TEC connects the disconnected parts of an
                organization: people, processes, data and technology. Our
                integrated solutions support the full operational core of a
                business, from finance and HR to facilities and food services.
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

          {/* Right — the four content elements */}
          <div className="grid gap-5 sm:grid-cols-2">
            {PILLARS.map((p, i) => (
              <RevealScale key={p.title} delay={i * 0.08} className="h-full">
                <article className="card-lift flex h-full flex-col rounded-2xl border border-border bg-ink-850/85 p-7 sm:p-8">
                  <span className="flex size-12 shrink-0 items-center justify-center rounded-xl border border-brand-500/25 bg-brand-500/10 text-brand-accent">
                    <p.icon className="size-6" />
                  </span>
                  <h3 className="mt-5 font-display text-xl font-semibold text-foreground">
                    {p.title}
                  </h3>
                  <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">
                    {p.text}
                  </p>
                </article>
              </RevealScale>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
