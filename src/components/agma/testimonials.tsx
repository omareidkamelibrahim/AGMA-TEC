import { Quote } from "lucide-react";
import { SectionHeading } from "./section-heading";
import { Reveal, RevealScale } from "./reveal";

const QUOTES = [
  {
    quote:
      "AGMA TEC didn't just deliver a platform — they restructured how our teams work. The roadmap was honest, the demos were on time, and the results showed up in our P&L within two quarters.",
    name: "Managing Director",
    org: "Regional retail group",
    initials: "MD",
  },
  {
    quote:
      "We had five disconnected systems and zero visibility. Six months later we run our entire operation from one dashboard. Their engineers felt like part of our own team.",
    name: "Chief Operating Officer",
    org: "Logistics provider",
    initials: "CO",
  },
  {
    quote:
      "The migration was flawless — zero unplanned downtime across all facilities. What impressed us most was the knowledge transfer; our staff now own the system completely.",
    name: "Head of IT",
    org: "Manufacturing group",
    initials: "HI",
  },
];

export function Testimonials() {
  return (
    <section className="relative py-24 sm:py-32" aria-label="Client testimonials">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(40%_35%_at_90%_70%,rgba(22,51,91,0.35),transparent_70%)]" />
      <div className="mx-auto w-full max-w-7xl px-5 sm:px-8">
        <SectionHeading
          eyebrow="Client Voices"
          title={
            <>
              Partnerships that outlast{" "}
              <span className="text-gradient">the project.</span>
            </>
          }
        />

        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          {QUOTES.map((q, i) => (
            <RevealScale key={q.name + i} delay={i * 0.1} className="h-full">
              <figure className="card-lift relative flex h-full flex-col rounded-2xl border border-border bg-ink-850/85 p-8">
                <Quote className="size-7 text-brand-500/60" />
                <blockquote className="mt-5 flex-1 text-[15px] leading-relaxed text-foreground/85">
                  “{q.quote}”
                </blockquote>
                <figcaption className="mt-7 flex items-center gap-4 border-t border-border/60 pt-6">
                  <span className="flex size-11 items-center justify-center rounded-full border border-brand-500/30 bg-brand-500/12 font-display text-[13px] font-bold text-brand-300">
                    {q.initials}
                  </span>
                  <span>
                    <span className="block text-sm font-semibold text-foreground">
                      {q.name}
                    </span>
                    <span className="block text-[12.5px] text-muted-foreground">
                      {q.org}
                    </span>
                  </span>
                </figcaption>
              </figure>
            </RevealScale>
          ))}
        </div>
      </div>
    </section>
  );
}
