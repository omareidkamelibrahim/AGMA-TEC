"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  Clock,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Send,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SectionHeading } from "./section-heading";
import { Reveal, RevealScale } from "./reveal";

const SERVICE_OPTIONS = [
  "AGMA ERP",
  "AGMA CAFM",
  "AGMA CATERING",
  "Custom Software Development",
  "System Integration",
  "Not sure yet — advise me",
];

const INFO = [
  {
    icon: Mail,
    label: "Email us",
    value: "info@agmatec.com",
    href: "mailto:info@agmatec.com",
  },
  {
    icon: Phone,
    label: "Call us",
    value: "+20 (0) 2 0000 0000",
    href: "tel:+20000000000",
  },
  {
    icon: MapPin,
    label: "Find us",
    value: "Cairo, Egypt",
  },
  {
    icon: Clock,
    label: "Working hours",
    value: "Sun–Thu, 9:00–18:00",
  },
];

type FormState = {
  name: string;
  email: string;
  company: string;
  service: string;
  message: string;
};

const INITIAL: FormState = {
  name: "",
  email: "",
  company: "",
  service: "",
  message: "",
};

export function Contact({ heading = true }: { heading?: boolean }) {
  const [form, setForm] = useState<FormState>(INITIAL);
  const [submitting, setSubmitting] = useState(false);

  const set =
    (key: keyof FormState) =>
    (
      e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | string
    ) => {
      const value = typeof e === "string" ? e : e.target.value;
      setForm((f) => ({ ...f, [key]: value }));
    };

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = (await res.json()) as { ok: boolean; error?: string; message?: string };
      if (res.ok && data.ok) {
        toast.success("Message sent", {
          description: data.message,
        });
        setForm(INITIAL);
      } else {
        toast.error("Could not send", {
          description: data.error ?? "Please check your inputs and try again.",
        });
      }
    } catch {
      toast.error("Network error", {
        description: "Please check your connection and try again.",
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section
      id="contact"
      className={`relative scroll-mt-24 bg-ink-900/40 py-24 sm:py-32 ${
        heading ? "border-t border-border/60" : ""
      }`}
    >
      <div className="absolute inset-0 -z-10 bg-dots opacity-25" />
      <div className="mx-auto w-full max-w-7xl px-5 sm:px-8">
        {heading && (
          <SectionHeading
            eyebrow="Get In Touch"
            title={
              <>
                Tell us about your{" "}
                <span className="text-gradient">next move.</span>
              </>
            }
            description="A short conversation is enough to map the opportunity. No obligation, no jargon — just an expert assessment of your idea or challenge."
          />
        )}

        <div className={`grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:gap-14 ${heading ? "mt-14" : ""}`}>
          {/* Form */}
          <RevealScale>
            <form
              onSubmit={onSubmit}
              className="rounded-2xl border border-border bg-ink-850/85 p-7 sm:p-9"
              noValidate={false}
            >
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-[13px] text-foreground/80">
                    Full name *
                  </Label>
                  <Input
                    id="name"
                    required
                    value={form.name}
                    onChange={set("name")}
                    placeholder="Jane Cooper"
                    className="h-11 border-border bg-ink-800/70 placeholder:text-muted-foreground/50 focus-visible:border-brand-500/60 focus-visible:ring-brand-500/25"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-[13px] text-foreground/80">
                    Work email *
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    value={form.email}
                    onChange={set("email")}
                    placeholder="jane@company.com"
                    className="h-11 border-border bg-ink-800/70 placeholder:text-muted-foreground/50 focus-visible:border-brand-500/60 focus-visible:ring-brand-500/25"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company" className="text-[13px] text-foreground/80">
                    Company
                  </Label>
                  <Input
                    id="company"
                    value={form.company}
                    onChange={set("company")}
                    placeholder="Company Inc."
                    className="h-11 border-border bg-ink-800/70 placeholder:text-muted-foreground/50 focus-visible:border-brand-500/60 focus-visible:ring-brand-500/25"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="service" className="text-[13px] text-foreground/80">
                    What do you need?
                  </Label>
                  <Select value={form.service} onValueChange={set("service")}>
                    <SelectTrigger
                      id="service"
                      className="h-11 border-border bg-ink-800/70 data-[placeholder]:text-muted-foreground/50 focus-visible:border-brand-500/60 focus-visible:ring-brand-500/25"
                    >
                      <SelectValue placeholder="Select a service" />
                    </SelectTrigger>
                    <SelectContent className="border-border bg-ink-800">
                      {SERVICE_OPTIONS.map((s) => (
                        <SelectItem key={s} value={s} className="focus:bg-ink-700">
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="message" className="text-[13px] text-foreground/80">
                    Project details *
                  </Label>
                  <Textarea
                    id="message"
                    required
                    rows={5}
                    value={form.message}
                    onChange={set("message")}
                    placeholder="Tell us about your goals, timeline and any constraints…"
                    className="resize-none border-border bg-ink-800/70 placeholder:text-muted-foreground/50 focus-visible:border-brand-500/60 focus-visible:ring-brand-500/25"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={submitting}
                className="mt-7 h-12 w-full rounded-xl bg-brand-600 text-[15px] font-semibold text-white shadow-[0_12px_40px_-10px_rgba(46,123,214,0.7)] hover:bg-brand-500 light:hover:bg-brand-700 sm:w-auto sm:px-9"
              >
                {submitting ? (
                  <>
                    <Loader2 className="size-4.5 animate-spin" />
                    Sending…
                  </>
                ) : (
                  <>
                    Send Message
                    <Send className="size-4.5" />
                  </>
                )}
              </Button>
              <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
                By submitting, you agree to be contacted about your inquiry.
                Your data stays private — never shared, never sold.
              </p>
            </form>
          </RevealScale>

          {/* Info panel */}
          <div className="space-y-4">
            {INFO.map((item, i) => (
              <Reveal key={item.label} delay={i * 0.07}>
                <div className="card-lift flex items-center gap-4.5 rounded-2xl border border-border bg-ink-850/85 p-5">
                  <span className="flex size-12 shrink-0 items-center justify-center rounded-xl border border-brand-500/25 bg-brand-500/10 text-brand-accent">
                    <item.icon className="size-5.5" />
                  </span>
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                      {item.label}
                    </p>
                    {item.href ? (
                      <a
                        href={item.href}
                        className="mt-0.5 block font-medium text-foreground transition-colors hover:text-brand-accent"
                      >
                        {item.value}
                      </a>
                    ) : (
                      <p className="mt-0.5 font-medium text-foreground">{item.value}</p>
                    )}
                  </div>
                </div>
              </Reveal>
            ))}

            <Reveal delay={0.3}>
              <div className="relative overflow-hidden rounded-2xl border border-brand-500/25 bg-gradient-to-br from-brand-950/70 to-ink-850 p-6">
                <div className="absolute -right-10 -top-10 size-36 rounded-full bg-brand-500/15 blur-2xl" />
                <p className="font-display text-lg font-semibold text-foreground">
                  Prefer a quick call?
                </p>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  Book a free 30-minute discovery session — we&apos;ll assess
                  your current setup and outline what a first phase could look
                  like.
                </p>
                <a
                  href="mailto:info@agmatec.com?subject=Discovery%20session%20request"
                  className="mt-4 inline-flex items-center gap-2 font-display text-sm font-semibold text-brand-accent transition-colors hover:text-brand-accent-bright"
                >
                  Book a discovery session
                  <Send className="size-4" />
                </a>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
