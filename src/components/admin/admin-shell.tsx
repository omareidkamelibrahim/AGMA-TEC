"use client";

import { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Banknote,
  CalendarDays,
  Handshake,
  Hash,
  Inbox,
  LayoutDashboard,
  LogOut,
  Megaphone,
  Menu,
  Moon,
  Package,
  ShieldCheck,
  Sparkles,
  Sun,
  Users,
} from "lucide-react";
import { useTheme } from "next-themes";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const NAV = [
  { group: "Main", items: [
    { href: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
    { href: "/admin/employees", label: "Employees", icon: Users },
    { href: "/admin/leave", label: "Leave Requests", icon: CalendarDays },
    { href: "/admin/payroll", label: "Payroll", icon: Banknote },
  ]},
  { group: "Website", items: [
    { href: "/admin/products", label: "Products", icon: Package },
    { href: "/admin/services", label: "Services", icon: Sparkles },
    { href: "/admin/clients", label: "Clients & Quotes", icon: Handshake },
    { href: "/admin/inquiries", label: "Inquiries", icon: Inbox },
    { href: "/admin/newsletter", label: "Newsletter", icon: Megaphone },
  ]},
  { group: "Settings", items: [
    { href: "/admin/settings/numbering", label: "Numbering Series", icon: Hash },
  ]},
];

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <nav className="flex flex-col gap-6" aria-label="Admin">
      {NAV.map((group) => (
        <div key={group.group}>
          <p className="px-3 pb-2 text-[10.5px] font-semibold uppercase tracking-[0.18em] text-muted-foreground/70">
            {group.group}
          </p>
          <ul className="flex flex-col gap-1">
            {group.items.map((item) => {
              const active = item.exact
                ? pathname === item.href
                : pathname === item.href || pathname.startsWith(item.href + "/");
              const Icon = item.icon;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onNavigate}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors duration-300",
                      active
                        ? "bg-brand-500/15 text-brand-accent-bright"
                        : "text-muted-foreground hover:bg-ink-800/70 hover:text-foreground",
                    )}
                  >
                    {active && (
                      <span className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-brand-500" />
                    )}
                    <Icon className={cn("size-4.5", active ? "text-brand-accent-bright" : "text-muted-foreground group-hover:text-brand-accent")} />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}

const emptySubscribe = () => () => {};

function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();

  // Hydration-safe: `false` on the server snapshot and during hydration,
  // `true` after mount. The stored theme is only known client-side, so the
  // first render must be deterministic (sun icon, "switch to light") and
  // the real state applied in a post-hydration re-render — no mismatch.
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
  const light = mounted && resolvedTheme === "light";

  return (
    <button
      type="button"
      onClick={() => setTheme(light ? "dark" : "light")}
      aria-label={light ? "Switch to dark mode" : "Switch to light mode"}
      className="flex size-9 items-center justify-center rounded-lg border border-border bg-ink-850/70 text-muted-foreground transition-colors hover:border-brand-500/40 hover:text-foreground"
    >
      {light ? <Moon className="size-4" /> : <Sun className="size-4" />}
    </button>
  );
}

function Brand({ badgeClassName }: { badgeClassName?: string }) {
  return (
    <Link href="/admin" className="flex items-center gap-3 px-1">
      <Image src="/logo.svg" alt="AGMA TEC logo" width={34} height={34} className="size-8.5" />
      <span className="flex flex-col leading-tight">
        <span className="font-display text-[15px] font-bold tracking-[0.14em] text-foreground">
          AGMA <span className="text-brand-accent-bright">TEC</span>
        </span>
        <span className={cn("text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground", badgeClassName)}>
          Admin Panel
        </span>
      </span>
    </Link>
  );
}

function UserChip() {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-ink-850/70 py-1.5 pl-1.5 pr-3">
      <span className="flex size-8 items-center justify-center rounded-lg bg-brand-500/20 text-brand-accent-bright">
        <ShieldCheck className="size-4.5" />
      </span>
      <span className="hidden leading-tight sm:block">
        <span className="block text-[12.5px] font-semibold text-foreground">Super Admin</span>
        <span className="block text-[10.5px] text-muted-foreground">admin@agma.com</span>
      </span>
    </div>
  );
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );

  return (
    <div className="flex min-h-screen bg-ink-900/40">
      {/* ambient brand wash */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(45%_30%_at_85%_0%,var(--glow-navy),transparent_70%)]"
      />

      {/* desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col gap-8 border-r border-border bg-ink-950/90 px-4 py-6 backdrop-blur lg:flex">
        <Brand />
        <div className="flex-1 overflow-y-auto">
          <NavLinks />
        </div>
        <div className="rounded-xl border border-border bg-ink-900/60 p-3">
          <p className="flex items-center gap-2 text-[12px] font-semibold text-foreground">
            <LogOut className="size-3.5 text-muted-foreground" />
            Back to website
          </p>
          <Link
            href="/"
            className="mt-2 inline-flex text-[12px] font-medium text-brand-accent transition-colors hover:text-brand-accent-bright"
          >
            agmatec.com →
          </Link>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col lg:pl-64">
        {/* topbar */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b border-border bg-background/80 px-4 backdrop-blur-md sm:px-6">
          <div className="flex items-center gap-3">
            {/* mobile nav — mount-gated: Radix derives aria-controls ids from
                useId, whose tree position differs between the SSR pass and
                client hydration (Next 16 dev), producing a hydration mismatch.
                Rendering the Sheet client-side only, behind a same-size
                placeholder, removes the mismatch with zero layout shift. */}
            {mounted ? (
              <Sheet open={open} onOpenChange={setOpen}>
                <SheetTrigger
                  aria-label="Open navigation"
                  className="flex size-9 items-center justify-center rounded-lg border border-border bg-ink-850/70 text-muted-foreground transition-colors hover:text-foreground lg:hidden"
                >
                  <Menu className="size-4.5" />
                </SheetTrigger>
                <SheetContent side="left" className="w-72 border-border bg-ink-950 p-5 [&>button]:text-muted-foreground">
                  <SheetTitle className="sr-only">Admin navigation</SheetTitle>
                  <Brand />
                  <div className="mt-8">
                    <NavLinks onNavigate={() => setOpen(false)} />
                  </div>
                  <Link
                    href="/"
                    className="mt-8 inline-flex text-[12.5px] font-medium text-brand-accent hover:text-brand-accent-bright"
                  >
                    Back to website →
                  </Link>
                </SheetContent>
              </Sheet>
            ) : (
              <div
                aria-hidden
                className="size-9 shrink-0 rounded-lg border border-border bg-ink-850/70 lg:hidden"
              />
            )}
            <Badge
              variant="outline"
              className="hidden border-brand-500/30 bg-brand-500/10 text-[10.5px] font-semibold uppercase tracking-[0.16em] text-brand-accent sm:inline-flex"
            >
              HR Suite
            </Badge>
          </div>
          <div className="flex items-center gap-2.5">
            <ThemeToggle />
            <UserChip />
          </div>
        </header>

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
