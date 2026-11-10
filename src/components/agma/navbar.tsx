"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { AgmaLogo } from "./logo";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About Us" },
  { href: "/products", label: "Our Products" },
  { href: "/clients", label: "Clients & Partners" },
  { href: "/contact", label: "Contact Us" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

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
        <Link
          href="/"
          aria-label="AGMA TEC home"
          className="rounded-lg focus-visible:outline-2 focus-visible:outline-brand-400"
        >
          <AgmaLogo />
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-1 lg:flex">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              aria-current={isActive(l.href) ? "page" : undefined}
              className={cn(
                "relative rounded-full px-4 py-2 text-sm font-medium transition-colors",
                isActive(l.href)
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {isActive(l.href) && (
                <span className="absolute inset-0 rounded-full border border-brand-500/30 bg-brand-500/10" />
              )}
              <span className="relative">{l.label}</span>
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <Button
            asChild
            className="group rounded-full bg-brand-600 px-5 font-medium text-white shadow-[0_8px_30px_-8px_rgba(46,123,214,0.7)] hover:bg-brand-500"
          >
            <Link href="/contact">
              Start Your Project
              <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
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
                  <Link
                    key={l.href}
                    href={l.href}
                    onClick={() => setOpen(false)}
                    aria-current={isActive(l.href) ? "page" : undefined}
                    className={cn(
                      "rounded-xl px-4 py-3.5 font-display text-lg font-semibold transition-colors",
                      isActive(l.href)
                        ? "bg-brand-500/12 text-brand-300"
                        : "text-foreground/85 hover:bg-ink-700 hover:text-foreground"
                    )}
                  >
                    <span className="mr-3 text-xs font-normal text-brand-500/70">
                      0{i + 1}
                    </span>
                    {l.label}
                  </Link>
                ))}
              </nav>
              <Button
                asChild
                className="mt-auto h-12 rounded-xl bg-brand-600 text-base font-medium text-white hover:bg-brand-500"
              >
                <Link href="/contact" onClick={() => setOpen(false)}>
                  Start Your Project
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
