import { ArrowUpRight } from "lucide-react";
import { SectionHeading } from "./section-heading";
import { RevealScale, Reveal } from "./reveal";

type Project = {
  category: string;
  title: string;
  text: string;
  metric: string;
  metricLabel: string;
  seed: number;
};

const PROJECTS: Project[] = [
  {
    category: "Retail & E-commerce",
    title: "Unified Commerce Platform",
    text: "Omnichannel storefront, inventory and loyalty engine consolidated into one cloud platform serving 200+ stores.",
    metric: "+38%",
    metricLabel: "online revenue in year one",
    seed: 7,
  },
  {
    category: "Logistics",
    title: "Smart Operations Dashboard",
    text: "Real-time fleet telematics and predictive maintenance, streamed into a single control tower for dispatch teams.",
    metric: "-31%",
    metricLabel: "fleet downtime",
    seed: 21,
  },
  {
    category: "Healthcare",
    title: "Patient Care Portal",
    text: "Secure appointments, tele-consultations and medical records with full audit trails, compliant with national health data rules.",
    metric: "50k+",
    metricLabel: "monthly active patients",
    seed: 33,
  },
  {
    category: "Manufacturing",
    title: "Cloud ERP Migration",
    text: "Legacy on-premise ERP re-platformed to Azure with zero unplanned downtime across 14 production facilities.",
    metric: "4×",
    metricLabel: "faster month-end reporting",
    seed: 48,
  },
];

/* Deterministic generative "bead constellation" art — original AGMA visual */
function ProjectArt({ seed }: { seed: number }) {
  const rnd = (n: number) => {
    const x = Math.sin(seed * 999 + n * 57.3) * 10000;
    return x - Math.floor(x);
  };
  const nodes = Array.from({ length: 7 }, (_, i) => ({
    x: 30 + rnd(i) * 300,
    y: 20 + rnd(i + 40) * 140,
    r: 4 + rnd(i + 80) * 7,
  }));
  const links = nodes.slice(0, 6).map((n, i) => ({ a: n, b: nodes[i + 1] }));
  return (
    <svg
      viewBox="0 0 360 180"
      className="absolute inset-0 h-full w-full"
      aria-hidden
    >
      <defs>
        <linearGradient id={`pa-${seed}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#12233E" />
          <stop offset="0.55" stopColor="#16335B" />
          <stop offset="1" stopColor="#0D1B30" />
        </linearGradient>
      </defs>
      <rect width="360" height="180" fill={`url(#pa-${seed})`} />
      {links.map((l, i) => (
        <line
          key={i}
          x1={l.a.x}
          y1={l.a.y}
          x2={l.b.x}
          y2={l.b.y}
          stroke="#5FA9F2"
          strokeOpacity="0.28"
          strokeWidth="1"
        />
      ))}
      {nodes.map((n, i) => (
        <g key={i}>
          <circle cx={n.x} cy={n.y} r={n.r + 6} fill="#3B8BE8" opacity="0.10" />
          <circle
            cx={n.x}
            cy={n.y}
            r={n.r}
            fill={i % 3 === 0 ? "#5FA9F2" : i % 3 === 1 ? "#2E7BD6" : "#1E4A8C"}
            opacity="0.85"
          />
        </g>
      ))}
      <circle cx="330" cy="24" r="46" fill="#3B8BE8" opacity="0.07" />
      <circle cx="18" cy="168" r="60" fill="#5FA9F2" opacity="0.06" />
    </svg>
  );
}

export function Work() {
  return (
    <section
      id="work"
      className="relative scroll-mt-24 border-t border-border/60 bg-ink-900/40 py-24 sm:py-32"
    >
      <div className="mx-auto w-full max-w-7xl px-5 sm:px-8">
        <SectionHeading
          eyebrow="Selected Work"
          title={
            <>
              Transformations we&apos;ve{" "}
              <span className="text-gradient">shipped and scaled.</span>
            </>
          }
          description="Representative engagements across the industries we know best. Every program delivered by an accountable, senior AGMA TEC team."
        />

        <div className="mt-14 grid gap-6 md:grid-cols-2">
          {PROJECTS.map((p, i) => (
            <RevealScale key={p.title} delay={(i % 2) * 0.1}>
              <article className="card-lift group overflow-hidden rounded-2xl border border-border bg-ink-850/85">
                <div className="relative h-44 overflow-hidden sm:h-48">
                  <ProjectArt seed={p.seed} />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink-850/85 via-transparent to-transparent" />
                  <span className="absolute left-5 top-5 rounded-full border border-brand-400/30 bg-ink-950/70 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-300 backdrop-blur-sm">
                    {p.category}
                  </span>
                  <div className="absolute bottom-5 right-5 flex items-center gap-2 rounded-xl border border-emerald-400/25 bg-ink-950/70 px-3.5 py-2 backdrop-blur-sm">
                    <span className="font-display text-lg font-bold text-emerald-300">
                      {p.metric}
                    </span>
                    <span className="max-w-28 text-[10.5px] leading-tight text-muted-foreground">
                      {p.metricLabel}
                    </span>
                  </div>
                </div>
                <div className="p-7">
                  <h3 className="flex items-center justify-between font-display text-xl font-semibold text-foreground">
                    {p.title}
                    <ArrowUpRight className="size-5 text-brand-400 opacity-0 transition-all duration-300 group-hover:translate-x-0.5 group-hover:opacity-100" />
                  </h3>
                  <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">
                    {p.text}
                  </p>
                </div>
              </article>
            </RevealScale>
          ))}
        </div>

        <Reveal delay={0.15}>
          <p className="mt-10 text-center text-sm text-muted-foreground">
            Detailed case studies available on request —{" "}
            <a
              href="#contact"
              className="font-medium text-brand-300 underline-offset-4 hover:underline"
            >
              ask for the ones relevant to your industry
            </a>
            .
          </p>
        </Reveal>
      </div>
    </section>
  );
}
