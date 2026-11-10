import { Blocks, Building2, Handshake } from "lucide-react";
import Link from "next/link";
import { SectionHeading } from "./section-heading";
import { Reveal, RevealScale } from "./reveal";

/**
 * Verified logo lists. Only add logos that exist in /public and are
 * confirmed by the company — never placeholder or fictional brands.
 *
 * To publish real logos:
 *   1. Drop files into /public/clients/ or /public/partners/
 *   2. Add an entry: { src: "/clients/<file>.png", alt: "<Client name>" }
 * The layout renders automatically once an entry exists.
 */
const CLIENT_LOGOS: { src: string; alt: string }[] = [];
const PARTNER_LOGOS: { src: string; alt: string }[] = [];

function LogoGrid({ logos }: { logos: { src: string; alt: string }[] }) {
  return (
    <ul className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
      {logos.map((logo) => (
        <li
          key={logo.src}
          className="flex h-20 items-center justify-center rounded-xl border border-border/80 bg-ink-900/80 p-4"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={logo.src}
            alt={logo.alt}
            loading="lazy"
            className="max-h-full max-w-full object-contain opacity-80 transition-opacity duration-300 hover:opacity-100"
          />
        </li>
      ))}
    </ul>
  );
}

/**
 * The two distinct groups — Clients and Technology Partners.
 * Rendered on the homepage (teaser) and on the /clients page.
 */
export function ClientPartnerGroups() {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* ── A. Our Clients ─────────────────────────────────────────── */}
      <RevealScale className="h-full">
        <div className="flex h-full flex-col rounded-2xl border border-border bg-ink-850/85 p-8">
          <div className="flex items-center gap-4">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-xl border border-brand-500/25 bg-brand-500/10 text-brand-300">
              <Building2 className="size-6" />
            </span>
            <div>
              <h3 className="font-display text-xl font-semibold text-foreground">
                Our Clients
              </h3>
              <p className="mt-0.5 text-[13px] text-muted-foreground">
                Organizations that run their operations with AGMA TEC.
              </p>
            </div>
          </div>

          {CLIENT_LOGOS.length > 0 ? (
            <LogoGrid logos={CLIENT_LOGOS} />
          ) : (
            <div className="relative mt-6 flex-1 overflow-hidden rounded-xl border border-border/70 bg-ink-900/60 p-6">
              <div className="absolute inset-0 bg-dots opacity-25" />
              <div className="relative">
                <p className="text-sm leading-relaxed text-foreground/80">
                  We&apos;re proud to work with organizations across retail,
                  logistics, manufacturing and beyond — supporting their
                  operations with our own technology.
                </p>
                <p className="mt-3 border-t border-border/60 pt-3 text-[13px] leading-relaxed text-muted-foreground">
                  Detailed client references are available upon request.
                </p>
              </div>
            </div>
          )}
        </div>
      </RevealScale>

      {/* ── B. Our Technology Partners ─────────────────────────────── */}
      <RevealScale delay={0.1} className="h-full">
        <div className="flex h-full flex-col rounded-2xl border border-border bg-ink-850/85 p-8">
          <div className="flex items-center gap-4">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-xl border border-brand-500/25 bg-brand-500/10 text-brand-300">
              <Blocks className="size-6" />
            </span>
            <div>
              <h3 className="font-display text-xl font-semibold text-foreground">
                Our Technology Partners
              </h3>
              <p className="mt-0.5 text-[13px] text-muted-foreground">
                Platforms and ecosystems our solutions integrate with.
              </p>
            </div>
          </div>

          {PARTNER_LOGOS.length > 0 ? (
            <LogoGrid logos={PARTNER_LOGOS} />
          ) : (
            <div className="relative mt-6 flex-1 overflow-hidden rounded-xl border border-border/70 bg-ink-900/60 p-6">
              <div className="absolute inset-0 bg-dots opacity-25" />
              <div className="relative">
                <p className="text-sm leading-relaxed text-foreground/80">
                  AGMA solutions are engineered to integrate with proven
                  enterprise platforms and infrastructure, so your technology
                  investments keep working together.
                </p>
                <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-border/60 pt-3">
                  <p className="inline-flex items-center gap-2 text-[13px] text-muted-foreground">
                    <Handshake className="size-4 text-brand-300" />
                    Technology partnership inquiries are welcome.
                  </p>
                  <Link
                    href="/contact"
                    className="text-[13px] font-semibold text-brand-300 transition-colors hover:text-brand-200"
                  >
                    Start a conversation
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </RevealScale>
    </div>
  );
}

export function Clients() {
  return (
    <section
      id="clients"
      className="relative scroll-mt-24 py-24 sm:py-32"
    >
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(40%_35%_at_10%_25%,rgba(22,51,91,0.35),transparent_70%)]" />

      <div className="mx-auto w-full max-w-7xl px-5 sm:px-8">
        <SectionHeading
          eyebrow="Clients & Partners"
          title={
            <>
              Trusted by Our <span className="text-gradient">Clients &amp; Partners</span>
            </>
          }
          description="Building successful relationships through technology, collaboration, and shared growth."
        />

        <div className="mt-14">
          <ClientPartnerGroups />
        </div>
      </div>
    </section>
  );
}
