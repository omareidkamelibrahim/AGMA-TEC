import { Quote as QuoteIcon } from "lucide-react";
import { SectionHeading } from "./section-heading";
import { RevealScale } from "./reveal";
import { TestimonialsCarousel } from "./testimonial-carousel";
import { getTestimonials } from "@/lib/site-content";
import type { Quote } from "./testimonials-data";

/** Reusable card grid — homepage and /clients page. DB-backed. */
export async function TestimonialsGrid() {
  const quotes = await getTestimonials();
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {quotes.map((q, i) => (
        <RevealScale key={q.name + i} delay={i * 0.1} className="h-full">
          <figure className="card-lift relative flex h-full flex-col rounded-2xl border border-border bg-ink-850/85 p-8">
            <QuoteIcon className="size-7 text-brand-500/60" />
            <blockquote className="mt-5 flex-1 text-[15px] leading-relaxed text-foreground/85">
              “{q.quote}”
            </blockquote>
            <figcaption className="mt-7 flex items-center gap-4 border-t border-border/60 pt-6">
              <span className="flex size-11 items-center justify-center rounded-full border border-brand-500/30 bg-brand-500/12 font-display text-[13px] font-bold text-brand-accent">
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
  );
}

export async function Testimonials() {
  const quotes: Quote[] = await getTestimonials();
  return (
    <section
      id="testimonials"
      className="relative scroll-mt-24 border-t border-border/60 bg-ink-900/40 py-24 sm:py-32"
      aria-label="Client testimonials"
    >
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(40%_35%_at_90%_70%,var(--glow-navy),transparent_70%)]" />
      <div className="mx-auto w-full max-w-7xl px-5 sm:px-8">
        <SectionHeading
          eyebrow="Client Testimonials"
          title={
            <>
              What Our Clients Say{" "}
              <span className="text-gradient">About Us</span>
            </>
          }
          description="Real experiences. Meaningful partnerships. Measurable business value."
        />

        <div className="mt-14">
          <TestimonialsCarousel quotes={quotes} />
        </div>
      </div>
    </section>
  );
}
