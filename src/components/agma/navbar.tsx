"use client";

import { useEffect, useState } from "react";
import { ArrowRight, Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { AgmaLogo } from "./logo";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "#home", label: "Home" },
  { href: "#about", label: "About Us" },
  { href: "#products", label: "Our Products" },
  { href: "#clients", label: "Clients & Partners" },
  { href: "#contact", label: "Contact Us" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState("home");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const sections = LINKS.map((l) => document.querySelector(l.href)).filter(
      Boolean
    ) as Element[];
    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) setActive(`#${e.target.id}`);
        }
      },
      { rootMargin: "-38% 0px -55% 0px" }
    );
    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-500",
        scrolled
          ? "glass border-b border-border/80 py-3 shadow-[0_10px_40px_-15px_rgba(2,8,20,0.8)]"
          : "bg-transparent py-5"
      )}
    >
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-5 sm:px-8">
        <a
          href="#home"
          aria-label="AGMA TEC home"
          className="rounded-lg focus-visible:outline-2 focus-visible:outline-brand-400"
        >
          <AgmaLogo />
        </a>

        <nav aria-label="Primary" className="hidden items-center gap-1 lg:flex">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className={cn(
                "relative rounded-full px-4 py-2 text-sm font-medium transition-colors",
                active === l.href
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {active === l.href && (
                <span className="absolute inset-0 rounded-full border border-brand-500/30 bg-brand-500/10" />
              )}
              <span className="relative">{l.label}</span>
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <Button
            asChild
            className="group rounded-full bg-brand-600 px-5 font-medium text-white shadow-[0_8px_30px_-8px_rgba(46,123,214,0.7)] hover:bg-brand-500"
          >
            <a href="#contact">
              Start Your Project
              <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
            </a>
          </Button>
        </div>

        <div className="lg:hidden">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="rounded-full border-border bg-ink-800/60"
                aria-label="Open menu"
              >
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              aria-describedby={undefined}
              className="flex w-[86%] max-w-sm flex-col border-border bg-ink-900 p-6"
            >
              <SheetTitle>
                <span className="sr-only">Navigation menu</span>
                <AgmaLogo showTagline />
              </SheetTitle>
              <nav aria-label="Mobile" className="mt-10 flex flex-col gap-1.5">
                {LINKS.map((l, i) => (
                  <a
                    key={l.href}
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "rounded-xl px-4 py-3.5 font-display text-lg font-semibold transition-colors",
                      active === l.href
                        ? "bg-brand-500/12 text-brand-300"
                        : "text-foreground/85 hover:bg-ink-700 hover:text-foreground"
                    )}
                  >
                    <span className="mr-3 text-xs font-normal text-brand-500/70">
                      0{i + 1}
                    </span>
                    {l.label}
                  </a>
                ))}
              </nav>
              <Button
                asChild
                className="mt-auto h-12 rounded-xl bg-brand-600 text-base font-medium text-white hover:bg-brand-500"
              >
                <a href="#contact" onClick={() => setOpen(false)}>
                  Start Your Project
                  <ArrowRight className="size-4" />
                </a>
              </Button>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
