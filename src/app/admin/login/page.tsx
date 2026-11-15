import type { Metadata } from "next";
import Image from "next/image";
import { Suspense } from "react";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Sign in — AGMA TEC Admin",
  description: "Sign in to the AGMA TEC administration dashboard.",
  robots: { index: false, follow: false },
};

const POINTS = [
  {
    title: "Website content",
    body: "Products, services, testimonials and client logos publish to agmatec.com instantly.",
  },
  {
    title: "Workforce suite",
    body: "Employee records, leave approvals, payroll runs and document expiry tracking.",
  },
  {
    title: "Customer funnel",
    body: "Inquiries and newsletter signups with status pipeline, analytics and CSV exports.",
  },
];

export default function AdminLoginPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-ink-950 px-4 py-10">
      {/* ambient brand wash */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(50%_40%_at_80%_0%,var(--glow-navy),transparent_70%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(40%_35%_at_0%_100%,rgba(59,130,246,0.12),transparent_70%)]"
      />

      <div className="relative z-10 grid w-full max-w-5xl items-center gap-10 lg:grid-cols-[1.1fr_1fr]">
        {/* brand panel */}
        <section className="hidden lg:block">
          <div className="flex items-center gap-3">
            <Image src="/logo.svg" alt="AGMA TEC logo" width={44} height={44} className="size-11" />
            <span className="flex flex-col leading-tight">
              <span className="font-display text-xl font-bold tracking-[0.14em] text-foreground">
                AGMA <span className="text-brand-accent-bright">TEC</span>
              </span>
              <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                Admin Console
              </span>
            </span>
          </div>

          <h1 className="mt-8 font-display text-4xl font-extrabold leading-tight text-foreground">
            One console for the
            <span className="block bg-gradient-to-r from-brand-400 to-brand-accent-bright bg-clip-text text-transparent">
              website & the workforce.
            </span>
          </h1>
          <p className="mt-4 max-w-md text-[14px] leading-relaxed text-muted-foreground">
            Sign in to manage everything your visitors see and everything your
            team needs — from catalogue content to the 158-person HR suite.
          </p>

          <ul className="mt-8 space-y-4">
            {POINTS.map((p) => (
              <li key={p.title} className="flex gap-3.5">
                <span className="mt-1.5 size-2 shrink-0 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 shadow-md shadow-brand-600/40" />
                <span>
                  <span className="block text-[13.5px] font-semibold text-foreground">{p.title}</span>
                  <span className="block text-[12.5px] leading-relaxed text-muted-foreground">{p.body}</span>
                </span>
              </li>
            ))}
          </ul>
        </section>

        {/* form card */}
        <section className="mx-auto w-full max-w-md rounded-3xl border border-border bg-ink-900/80 p-7 shadow-2xl shadow-black/40 backdrop-blur-xl sm:p-9">
          {/* mobile brand */}
          <div className="mb-7 flex items-center gap-3 lg:hidden">
            <Image src="/logo.svg" alt="AGMA TEC logo" width={36} height={36} className="size-9" />
            <span className="font-display text-lg font-bold tracking-[0.14em] text-foreground">
              AGMA <span className="text-brand-accent-bright">TEC</span>
            </span>
          </div>

          <h2 className="font-display text-[22px] font-bold text-foreground">Welcome back</h2>
          <p className="mt-1 text-[13px] text-muted-foreground">
            Sign in to the AGMA TEC admin dashboard.
          </p>

          <Suspense>
            <LoginForm />
          </Suspense>

          <p className="mt-7 border-t border-border/70 pt-5 text-center text-[11.5px] text-muted-foreground">
            Protected area · AGMA TEC internal use only
          </p>
        </section>
      </div>
    </div>
  );
}
