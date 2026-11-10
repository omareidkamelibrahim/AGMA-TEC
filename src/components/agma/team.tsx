import Link from "next/link";
import {
  ArrowUpRight,
  ClipboardCheck,
  Code2,
  LifeBuoy,
  Workflow,
} from "lucide-react";
import { SectionHeading } from "./section-heading";
import { Reveal, RevealScale } from "./reveal";

/**
 * Real team profiles. AGMA TEC does not publish invented people —
 * add named members only when approved names/photos exist.
 *
 * To publish a member:
 *   1. Drop the photo into /public/team/ (optional — an initials
 *      avatar is rendered automatically when no photo is given)
 *   2. Add an entry: { name: "Full Name", role: "Job title", photo: "/team/<file>.jpg" }
 * Member cards render automatically between the heading and the
 * discipline grid once an entry exists.
 */
const TEAM_MEMBERS: { name: string; role: string; photo?: string }[] = [];

/** The disciplines every AGMA TEC engagement runs through — one team, end to end. */
const DISCIPLINES = [
  {
    icon: Code2,
    title: "Software Engineering",
    text: "Architects and developers who design, build and continuously evolve the AGMA product suite.",
  },
  {
    icon: Workflow,
    title: "Implementation & Consulting",
    text: "Specialists who map every solution to real business processes — from configuration and data migration to go-live.",
  },
  {
    icon: LifeBuoy,
    title: "Training & Support",
    text: "The people behind every successful handover: user training, responsive helpdesk and continuous product updates.",
  },
  {
    icon: ClipboardCheck,
    title: "Project Delivery",
    text: "A single point of accountability that keeps every engagement on scope, on schedule and clearly communicated.",
  },
];

function initialsOf(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]!.toUpperCase())
    .join("");
}

/** Reusable member grid — renders only when real profiles exist. */
export function TeamGrid() {
  if (TEAM_MEMBERS.length === 0) return null;
  return (
    <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {TEAM_MEMBERS.map((m, i) => (
        <RevealScale key={m.name} delay={i * 0.08} className="h-full">
          <figure className="card-lift flex h-full flex-col items-center rounded-2xl border border-border bg-ink-850/85 p-7 text-center">
            {m.photo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={m.photo}
                alt={m.name}
                loading="lazy"
                className="size-20 rounded-full border border-brand-500/30 object-cover"
              />
            ) : (
              <span className="flex size-20 items-center justify-center rounded-full border border-brand-500/30 bg-brand-500/12 font-display text-xl font-bold text-brand-300">
                {initialsOf(m.name)}
              </span>
            )}
            <figcaption className="mt-5">
              <span className="block font-display text-[15px] font-semibold text-foreground">
                {m.name}
              </span>
              <span className="mt-1 block text-[13px] text-muted-foreground">
                {m.role}
              </span>
            </figcaption>
          </figure>
        </RevealScale>
      ))}
    </div>
  );
}

export function Team() {
  return (
    <section
      id="team"
      className="relative scroll-mt-24 py-24 sm:py-32"
      aria-label="Our team"
    >
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(40%_35%_at_85%_25%,rgba(22,51,91,0.35),transparent_70%)]" />

      <div className="mx-auto w-full max-w-7xl px-5 sm:px-8">
        <SectionHeading
          eyebrow="Our Team"
          title={
            <>
              The People Behind{" "}
              <span className="text-gradient">the Technology.</span>
            </>
          }
          description="Engineers, consultants and support specialists working side by side — so every AGMA solution is delivered and cared for by the same team that built it."
        />

        <TeamGrid />

        {/* Discipline grid — how the team is organized */}
        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {DISCIPLINES.map((d, i) => (
            <RevealScale key={d.title} delay={i * 0.08} className="h-full">
              <article className="card-lift flex h-full flex-col rounded-2xl border border-border bg-ink-850/85 p-7">
                <span className="flex size-12 shrink-0 items-center justify-center rounded-xl border border-brand-500/25 bg-brand-500/10 text-brand-300">
                  <d.icon className="size-6" />
                </span>
                <h3 className="mt-5 font-display text-[17px] font-semibold text-foreground">
                  {d.title}
                </h3>
                <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">
                  {d.text}
                </p>
              </article>
            </RevealScale>
          ))}
        </div>

        {/* One-team strip */}
        <Reveal delay={0.15}>
          <div className="relative mt-10 overflow-hidden rounded-2xl border border-border bg-ink-850/80 p-8 sm:p-9">
            <div className="absolute inset-0 bg-dots opacity-40" />
            <div className="relative flex flex-wrap items-center justify-between gap-6">
              <div className="max-w-2xl">
                <p className="font-display text-lg font-semibold text-foreground">
                  One accountable team — from the first demo to daily support.
                </p>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  When you work with AGMA TEC, you work directly with the
                  people who build, implement and support your systems.
                </p>
              </div>
              <Link
                href="/contact"
                className="group inline-flex items-center gap-2 rounded-full border border-brand-500/30 bg-brand-500/10 px-6 py-3 text-sm font-semibold text-brand-300 transition-colors hover:border-brand-400/40 hover:bg-brand-500/15 hover:text-brand-200"
              >
                Talk to our team
                <ArrowUpRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
