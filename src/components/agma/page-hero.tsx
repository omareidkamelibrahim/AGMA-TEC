import { cn } from "@/lib/utils";
import { BeadDots } from "./section-heading";
import { Reveal } from "./reveal";

/**
 * Consistent page header band for all inner pages.
 * Uses the same backdrop treatment as the homepage hero —
 * existing brand tokens only.
 */
export function PageHero({
  eyebrow,
  title,
  description,
  children,
  className,
}: {
  eyebrow: string;
  title: React.ReactNode;
  description?: string;
  /** Optional extra content rendered below the description */
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <section className="relative overflow-hidden pt-32 pb-14 sm:pt-40 sm:pb-16">
      {/* backdrop — same treatment as homepage hero */}
      <div className="absolute inset-0 -z-20 bg-grid bg-grid-fade" />
      <div className="absolute inset-0 -z-20 bg-[radial-gradient(55%_45%_at_18%_20%,var(--glow-navy-strong),transparent_70%)]" />
      <div className="absolute inset-0 -z-20 bg-[radial-gradient(45%_40%_at_82%_30%,rgba(46,123,214,0.16),transparent_72%)]" />
      <div className="absolute inset-x-0 bottom-0 -z-10 h-24 bg-gradient-to-t from-background to-transparent" />

      <div className={cn("mx-auto w-full max-w-7xl px-5 sm:px-8", className)}>
        <Reveal>
          <span className="inline-flex items-center gap-2.5 rounded-full border border-brand-500/25 bg-brand-500/10 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.24em] text-brand-accent">
            <BeadDots />
            {eyebrow}
          </span>
        </Reveal>
        <Reveal delay={0.08}>
          <h1 className="mt-6 max-w-3xl font-display text-4xl font-bold leading-[1.08] tracking-tight text-foreground sm:text-5xl lg:text-[3.4rem]">
            {title}
          </h1>
        </Reveal>
        {description && (
          <Reveal delay={0.16}>
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              {description}
            </p>
          </Reveal>
        )}
        {children}
      </div>
    </section>
  );
}
