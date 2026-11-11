import type { Metadata } from "next";
import { PageHero } from "@/components/agma/page-hero";
import { ClientPartnerGroups } from "@/components/agma/clients";
import { TestimonialsGrid } from "@/components/agma/testimonials";
import { Reveal } from "@/components/agma/reveal";
import { CtaBand } from "@/components/agma/cta-band";

// Client logos & testimonials are DB-managed from the admin dashboard.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Our Clients & Partners",
  description:
    "Trusted by our clients and partners — building successful relationships through technology, collaboration, and shared growth.",
};

export default function ClientsPage() {
  return (
    <>
      <PageHero
        eyebrow="Clients & Partners"
        title={
          <>
            Trusted by Our{" "}
            <span className="text-gradient">Clients &amp; Partners</span>
          </>
        }
        description="Building successful relationships through technology, collaboration, and shared growth."
      />

      {/* ── Two distinct groups ───────────────────────────────────── */}
      <section className="relative pb-20 sm:pb-24">
        <div className="mx-auto w-full max-w-7xl px-5 sm:px-8">
          <ClientPartnerGroups />
        </div>
      </section>

      {/* ── Client voices ─────────────────────────────────────────── */}
      <section
        className="relative border-t border-border/60 bg-ink-900/40 py-20 sm:py-24"
        aria-label="Client testimonials"
      >
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(40%_35%_at_90%_70%,var(--glow-navy),transparent_70%)]" />
        <div className="mx-auto w-full max-w-7xl px-5 sm:px-8">
          <Reveal>
            <div>
              <span className="inline-flex items-center gap-2.5 rounded-full border border-brand-500/25 bg-brand-500/10 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.24em] text-brand-accent">
                Client Testimonials
              </span>
              <h2 className="mt-6 font-display text-3xl font-bold leading-[1.12] tracking-tight text-foreground sm:text-4xl">
                What Our Clients Say{" "}
                <span className="text-gradient">About Us</span>
              </h2>
              <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
                Real experiences. Meaningful partnerships. Measurable business
                value.
              </p>
            </div>
          </Reveal>
          <div className="mt-14">
            <TestimonialsGrid />
          </div>
        </div>
      </section>

      <CtaBand
        eyebrow="Let's Work Together"
        title={
          <>
            Become Our <span className="text-gradient">Next Success Story.</span>
          </>
        }
        description="Whether you're looking for a solution or a partnership, we'd love to hear from you."
        primaryLabel="Contact Our Team"
        primaryHref="/contact"
        secondaryLabel="Explore Our Solutions"
        secondaryHref="/products"
      />
    </>
  );
}
