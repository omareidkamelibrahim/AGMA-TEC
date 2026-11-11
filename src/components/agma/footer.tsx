"use client";

import { useState } from "react";
import { toast } from "sonner";
import Link from "next/link";
import {
  ArrowRight,
  Facebook,
  Instagram,
  Linkedin,
  Loader2,
  Twitter,
} from "lucide-react";
import { AgmaLogo } from "./logo";
import { BeadDots } from "./section-heading";

const COLUMNS = [
  {
    title: "Company",
    links: [
      { label: "About us", href: "/about" },
      { label: "Services", href: "/services" },
      { label: "Our Products", href: "/products" },
      { label: "Clients & Partners", href: "/clients" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    title: "Products",
    links: [
      { label: "AGMA ERP", href: "/products/agma-erp" },
      { label: "AGMA CAFM", href: "/products/agma-cafm" },
      { label: "AGMA CATERING", href: "/products/agma-catering" },
      { label: "Request a Demo", href: "/contact" },
    ],
  },
];

const SOCIALS = [
  { icon: Linkedin, label: "LinkedIn", href: "https://www.linkedin.com" },
  { icon: Twitter, label: "X (Twitter)", href: "https://x.com" },
  { icon: Facebook, label: "Facebook", href: "https://www.facebook.com" },
  { icon: Instagram, label: "Instagram", href: "https://www.instagram.com" },
];

export function Footer() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);

  async function subscribe(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = (await res.json()) as { ok: boolean; error?: string; message?: string };
      if (res.ok && data.ok) {
        toast.success(data.message ?? "Subscribed!");
        setEmail("");
      } else {
        toast.error(data.error ?? "Please try again.");
      }
    } catch {
      toast.error("Network error — please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <footer className="relative border-t border-border/70 bg-ink-950">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-500/60 to-transparent" />

      <div className="mx-auto w-full max-w-7xl px-5 pb-10 pt-16 sm:px-8">
        <div className="grid gap-12 lg:grid-cols-[1.3fr_0.7fr_0.7fr_1.1fr]">
          {/* Brand */}
          <div>
            <AgmaLogo showTagline />
            <p className="mt-6 max-w-sm text-sm leading-relaxed text-muted-foreground">
              AGMA TEC is an enterprise technology solutions provider. We
              develop our own integrated software products — AGMA ERP, AGMA
              CAFM and AGMA CATERING — that help organizations streamline
              operations and accelerate digital transformation.
            </p>
            <div className="mt-7 flex gap-3">
              {SOCIALS.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noreferrer noopener"
                  aria-label={s.label}
                  className="flex size-10 items-center justify-center rounded-full border border-border bg-ink-850 text-muted-foreground transition-all hover:border-brand-500/50 hover:bg-brand-500 light:hover:bg-brand-700/15 hover:text-brand-accent"
                >
                  <s.icon className="size-4.5" />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {COLUMNS.map((col) => (
            <nav key={col.title} aria-label={col.title}>
              <h3 className="flex items-center gap-2.5 font-display text-sm font-semibold uppercase tracking-[0.2em] text-foreground">
                <BeadDots />
                {col.title}
              </h3>
              <ul className="mt-6 space-y-3.5">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link
                      href={l.href}
                      className="group inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-brand-accent"
                    >
                      <span className="h-px w-0 bg-brand-400 transition-all duration-300 group-hover:w-3" />
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}

          {/* Newsletter */}
          <div>
            <h3 className="flex items-center gap-2.5 font-display text-sm font-semibold uppercase tracking-[0.2em] text-foreground">
              <BeadDots />
              Stay Connected
            </h3>
            <p className="mt-6 text-sm leading-relaxed text-muted-foreground">
              Practical insights on software, cloud and AI — one short letter,
              once a month.
            </p>
            <form onSubmit={subscribe} className="mt-5">
              <div className="flex overflow-hidden rounded-xl border border-border bg-ink-850 transition-colors focus-within:border-brand-500/50">
                <label htmlFor="newsletter-email" className="sr-only">
                  Email address
                </label>
                <input
                  id="newsletter-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  className="w-full bg-transparent px-4 py-3 text-sm text-foreground outline-none placeholder:text-muted-foreground/50"
                />
                <button
                  type="submit"
                  disabled={busy}
                  aria-label="Subscribe to newsletter"
                  className="flex w-13 shrink-0 items-center justify-center bg-brand-600 text-white transition-colors hover:bg-brand-500 light:hover:bg-brand-700 disabled:opacity-60"
                >
                  {busy ? (
                    <Loader2 className="size-4.5 animate-spin" />
                  ) : (
                    <ArrowRight className="size-4.5" />
                  )}
                </button>
              </div>
            </form>
            <p className="mt-3 text-xs text-muted-foreground/70">
              No spam. Unsubscribe anytime.
            </p>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-border/60 pt-8 sm:flex-row">
          <p className="text-[13px] text-muted-foreground">
            © {new Date().getFullYear()} AGMA TEC — Enterprise Technology
            Solutions. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-[13px] text-muted-foreground">
            <Link href="/" className="transition-colors hover:text-brand-accent">
              Privacy Policy
            </Link>
            <Link href="/" className="transition-colors hover:text-brand-accent">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
