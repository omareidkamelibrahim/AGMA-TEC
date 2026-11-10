"use client";

const TECH = [
  "Microsoft Azure",
  "AWS",
  ".NET",
  "React",
  "Next.js",
  "Node.js",
  "Flutter",
  "Kubernetes",
  "PostgreSQL",
  "Power BI",
  "Dynamics 365",
  "Python",
];

export function TechMarquee() {
  const row = [...TECH, ...TECH];
  return (
    <section
      aria-label="Technologies we work with"
      className="relative mt-20 border-y border-border/70 bg-ink-900/60 py-6 sm:mt-24"
    >
      <div className="marquee-mask pause-on-hover overflow-hidden">
        <div className="flex w-max animate-marquee items-center gap-12 pr-12">
          {row.map((t, i) => (
            <span
              key={`${t}-${i}`}
              className="flex items-center gap-12 whitespace-nowrap"
            >
              <span className="font-display text-[15px] font-medium tracking-wide text-foreground/45 transition-colors hover:text-brand-300">
                {t}
              </span>
              <span className="size-1.5 rounded-full bg-brand-700/70" aria-hidden />
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
