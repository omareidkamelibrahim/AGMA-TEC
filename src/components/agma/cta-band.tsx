import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AgmaMark } from "./logo";
import { Reveal } from "./reveal";

/**
 * Final call-to-action band. The homepage uses the default copy;
 * inner pages can pass their own via props (brand styles unchanged).
 */
export function CtaBand({
  eyebrow = "Ready When You Are",
  title = (
    <>
      Let&apos;s Build Something{" "}
      <span className="text-gradient">Intelligent Together.</span>
    </>
  ),
  description = "Discover how AGMA TEC can help your organization improve operations and achieve its digital transformation goals.",
  primaryLabel = "Contact Our Team",
  primaryHref = "/contact",
  secondaryLabel = "Explore Our Solutions",
  secondaryHref = "/products",
}: {
  eyebrow?: string;
  title?: React.ReactNode;
  description?: string;
  primaryLabel?: string;
  primaryHref?: string;
  secondaryLabel?: string;
  secondaryHref?: string;
}) {
  return (
    <section className="px-5 pb-24 sm:px-8 sm:pb-32" aria-label="Call to action">
      <Reveal>
        <div className="relative mx-auto max-w-7xl overflow-hidden rounded-3xl border border-brand-500/25 bg-gradient-to-br from-ink-800 via-ink-850 to-brand-950/60 px-7 py-16 text-center sm:px-12 sm:py-20">
          <div className="absolute inset-0 bg-grid opacity-60" />
          <div className="absolute -left-20 -top-24 size-72 rounded-full bg-brand-600/20 blur-3xl" />
          <div className="absolute -bottom-28 -right-16 size-80 rounded-full bg-brand-500/15 blur-3xl" />
          <AgmaMark className="absolute right-8 top-8 hidden h-16 w-auto opacity-15 md:block" />
          <AgmaMark className="absolute bottom-8 left-8 hidden h-16 w-auto opacity-10 md:block" />

          <div className="relative">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-brand-300">
              {eyebrow}
            </p>
            <h2 className="mx-auto mt-5 max-w-2xl font-display text-3xl font-bold leading-tight tracking-tight text-foreground sm:text-[2.6rem]">
              {title}
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-muted-foreground">
              {description}
            </p>
            <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
              <Button
                asChild
                size="lg"
                className="group h-13 rounded-full bg-brand-600 px-8 text-[15px] font-semibold text-white shadow-[0_14px_44px_-10px_rgba(46,123,214,0.8)] hover:bg-brand-500"
              >
                <Link href={primaryHref}>
                  {primaryLabel}
                  <ArrowRight className="size-4.5 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="h-13 rounded-full border-border bg-ink-900/50 px-8 text-[15px] font-medium text-foreground/90 hover:border-brand-500/40 hover:bg-ink-800/70"
              >
                <Link href={secondaryHref}>{secondaryLabel}</Link>
              </Button>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
