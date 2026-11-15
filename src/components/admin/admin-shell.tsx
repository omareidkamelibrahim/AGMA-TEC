"use client";

import { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  Bell,
  Building2,
  Handshake,
  Headset,
  Inbox,
  LayoutDashboard,
  LayoutTemplate,
  LogOut,
  Megaphone,
  Menu,
  MessageSquareQuote,
  Moon,
  Package,
  PanelBottom,
  PanelTop,
  ShieldCheck,
  Sparkles,
  Sun,
} from "lucide-react";
import { useTheme } from "next-themes";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

export type AdminUserInfo = { name: string; email: string; role: string };

const NAV = [
  { group: "Dashboard", items: [
    { href: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
  ]},
  { group: "Website", items: [
    { href: "/admin/website/header", label: "Header & Navigation", icon: PanelTop },
    { href: "/admin/website/sections", label: "Home Sections", icon: LayoutTemplate },
    { href: "/admin/website/footer", label: "Footer", icon: PanelBottom },
    { href: "/admin/products", label: "Products", icon: Package },
    { href: "/admin/services", label: "Services", icon: Sparkles },
    { href: "/admin/clients", label: "Clients", icon: Building2 },
    { href: "/admin/partners", label: "Partners", icon: Handshake },
    { href: "/admin/testimonials", label: "Testimonials", icon: MessageSquareQuote },
    { href: "/admin/inquiries", label: "Inquiries", icon: Inbox },
    { href: "/admin/newsletter", label: "Newsletter", icon: Megaphone },
  ]},
];

function NavLinks({ onNavigate, unread }: { onNavigate?: () => void; unread?: number }) {
  const pathname = usePathname();
  return (
    <nav className="flex flex-col gap-6" aria-label="Admin">
      {NAV.map((group) => (
        <div key={group.group}>
          <p className="px-3 pb-2 text-[10.5px] font-semibold uppercase tracking-[0.2em] text-brand-accent/70">
            {group.group}
          </p>
          <ul className="flex flex-col gap-1">
            {group.items.map((item) => {
              const active = item.exact
                ? pathname === item.href
                : pathname === item.href || pathname.startsWith(item.href + "/");
              const Icon = item.icon;
              const showBadge =
                item.href === "/admin/inquiries" && unread != null && unread > 0;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onNavigate}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors duration-300",
                      active
                        ? "bg-gradient-to-r from-brand-600 to-brand-500 text-white shadow-lg shadow-brand-600/25"
                        : "text-muted-foreground hover:bg-ink-800/70 hover:text-foreground",
                    )}
                  >
                    <Icon
                      className={cn(
                        "size-4.5",
                        active ? "text-white" : "text-muted-foreground group-hover:text-brand-accent",
                      )}
                    />
                    <span className="min-w-0 flex-1 truncate">{item.label}</span>
                    {showBadge && (
                      <span
                        className={cn(
                          "inline-flex min-w-5 items-center justify-center rounded-full px-1.5 py-0.5 text-[10px] font-bold",
                          active ? "bg-white/25 text-white" : "bg-red-500/90 text-white",
                        )}
                      >
                        {unread}
                      </span>
                    )}
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

function Brand() {
  return (
    <Link href="/admin" className="flex items-center gap-3 px-1">
      <Image src="/logo.svg" alt="AGMA TEC logo" width={34} height={34} className="size-8.5" />
      <span className="flex flex-col leading-tight">
        <span className="font-display text-[15px] font-bold tracking-[0.14em] text-foreground">
          AGMA <span className="text-brand-accent-bright">TEC</span>
        </span>
        <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
          Admin Console
        </span>
      </span>
    </Link>
  );
}

/** Lightweight unread-inquiries badge (60s stale time — cheap). */
function useUnreadCount() {
  const { data } = useQuery<number>({
    queryKey: ["admin-unread-badge"],
    queryFn: async () => {
      const res = await fetch("/api/admin/badge");
      if (!res.ok) throw new Error("Failed");
      const json = await res.json();
      return json.unread as number;
    },
    staleTime: 60_000,
    retry: 1,
  });
  return data;
}

function BellButton() {
  const unread = useUnreadCount();
  return (
    <Link
      href="/admin/inquiries"
      aria-label={unread ? `${unread} new inquiries` : "No new inquiries"}
      className="relative flex size-9 items-center justify-center rounded-lg border border-border bg-ink-850/70 text-muted-foreground transition-colors hover:border-brand-500/40 hover:text-foreground"
    >
      <Inbox className="size-4" />
      {unread != null && unread > 0 && (
        <span className="absolute -right-1.5 -top-1.5 flex min-w-4.5 items-center justify-center rounded-full bg-brand-500 px-1 py-px text-[9.5px] font-bold text-white shadow-md shadow-brand-600/40">
          {unread}
        </span>
      )}
    </Link>
  );
}

type NotificationRow = {
  id: string;
  name: string;
  company: string | null;
  message: string;
  status: string;
  createdAt: string;
};

function timeAgo(iso: string) {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return "just now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d ago`;
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

/** Notification icon — bell with unread badge and a feed of the latest inquiries. */
function NotificationBell() {
  const unread = useUnreadCount();
  const { data } = useQuery<{ rows: NotificationRow[] }>({
    queryKey: ["admin-notifications"],
    queryFn: async () => {
      const res = await fetch("/api/admin/inquiries");
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    staleTime: 60_000,
    retry: 1,
  });
  const rows = data?.rows?.slice(0, 5) ?? [];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          aria-label={unread ? `Notifications — ${unread} new inquiries` : "Notifications"}
          className="relative flex size-9 items-center justify-center rounded-lg border border-border bg-ink-850/70 text-muted-foreground outline-none transition-colors hover:border-brand-500/40 hover:text-foreground focus-visible:ring-2 focus-visible:ring-brand-500/30"
        >
          <Bell className="size-4" />
          {unread != null && unread > 0 && (
            <span className="absolute -right-1.5 -top-1.5 flex min-w-4.5 items-center justify-center rounded-full bg-red-500/90 px-1 py-px text-[9.5px] font-bold text-white shadow-md">
              {unread}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        sideOffset={10}
        className="w-80 border-border bg-ink-900/95 p-0 backdrop-blur-xl"
      >
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <span className="text-[13px] font-semibold text-foreground">Notifications</span>
          {unread != null && unread > 0 && (
            <span className="rounded-full bg-red-500/90 px-2 py-0.5 text-[10px] font-bold text-white">
              {unread} new
            </span>
          )}
        </div>
        <div className="max-h-80 overflow-y-auto">
          {rows.length === 0 ? (
            <p className="px-4 py-8 text-center text-[12.5px] text-muted-foreground">
              No inquiries yet.
            </p>
          ) : (
            rows.map((n) => (
              <Link
                key={n.id}
                href="/admin/inquiries"
                className="flex gap-3 border-b border-border/40 px-4 py-3 transition-colors last:border-0 hover:bg-brand-500/[0.06]"
              >
                <span
                  aria-hidden
                  className={cn(
                    "mt-1.5 size-2 shrink-0 rounded-full",
                    n.status === "New" ? "bg-brand-400" : "bg-border",
                  )}
                />
                <span className="min-w-0 flex-1">
                  <span className="flex items-baseline justify-between gap-2">
                    <span className="truncate text-[12.5px] font-semibold text-foreground">
                      {n.name}
                      {n.company ? ` · ${n.company}` : ""}
                    </span>
                    <span className="shrink-0 text-[10.5px] text-muted-foreground">
                      {timeAgo(n.createdAt)}
                    </span>
                  </span>
                  <span className="mt-0.5 line-clamp-2 block text-[11.5px] leading-relaxed text-muted-foreground">
                    {n.message}
                  </span>
                </span>
              </Link>
            ))
          )}
        </div>
        <Link
          href="/admin/inquiries"
          className="block border-t border-border px-4 py-2.5 text-center text-[12px] font-semibold text-brand-accent transition-colors hover:text-brand-accent-bright"
        >
          View all inquiries
        </Link>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function UserChip({ user }: { user: AdminUserInfo }) {
  const initials =
    user.name
      .split(/\s+/)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase() ?? "")
      .join("") || "A";

  async function signOut() {
    try {
      await fetch("/api/admin/auth/logout", { method: "POST" });
    } finally {
      window.location.assign("/admin/login");
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          aria-label="Account menu"
          className="flex items-center gap-2.5 rounded-xl border border-border bg-ink-850/70 py-1.5 pl-1.5 pr-3 outline-none transition-colors hover:border-brand-500/40 focus-visible:ring-2 focus-visible:ring-brand-500/30"
        >
          <span className="flex size-8 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-[12px] font-bold text-white">
            {initials}
          </span>
          <span className="hidden leading-tight sm:block">
            <span className="block text-[12.5px] font-semibold text-foreground">{user.name}</span>
            <span className="block text-[10.5px] text-muted-foreground">{user.role}</span>
          </span>
          <ShieldCheck className="hidden size-3.5 text-brand-accent sm:block" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={10} className="w-60 border-border bg-ink-900/95 backdrop-blur-xl">
        <DropdownMenuLabel className="px-3 py-2.5">
          <span className="block text-[13px] font-semibold text-foreground">{user.name}</span>
          <span className="block truncate text-[11px] font-normal text-muted-foreground">{user.email}</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-border" />
        <DropdownMenuItem
          onClick={signOut}
          className="gap-2 px-3 py-2.5 text-[12.5px] text-red-300 focus:bg-red-500/10 focus:text-red-200"
        >
          <LogOut className="size-3.5" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function AdminShell({
  children,
  user,
}: {
  children: React.ReactNode;
  user: AdminUserInfo;
}) {
  const [open, setOpen] = useState(false);
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
  const unread = useUnreadCount();

  return (
    <div className="flex min-h-screen bg-ink-900/40">
      {/* ambient brand wash */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(45%_30%_at_85%_0%,var(--glow-navy),transparent_70%)]"
      />

      {/* desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col gap-6 border-r border-border bg-ink-950/90 px-4 py-6 backdrop-blur lg:flex">
        <Brand />
        <div className="flex-1 overflow-y-auto">
          <NavLinks unread={unread} />
        </div>

        {/* website promo — manage what visitors see */}
        <div className="rounded-2xl border border-brand-500/25 bg-gradient-to-br from-brand-600/20 via-brand-500/8 to-transparent p-4">
          <p className="text-[12.5px] font-bold text-foreground">AGMA TEC Website</p>
          <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
            Everything you manage here publishes to agmatec.com instantly.
          </p>
          <Link
            href="/"
            className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-brand-500/40 bg-brand-500/15 px-3 py-2 text-[11.5px] font-semibold text-brand-accent-bright transition-colors hover:bg-brand-500/25"
          >
            View website
          </Link>
        </div>

        <div className="flex items-center gap-3 rounded-2xl border border-border bg-ink-900/60 p-4">
          <Headset className="size-5 shrink-0 text-brand-accent" />
          <p className="text-[11.5px] leading-tight text-muted-foreground">
            <span className="block font-semibold text-foreground">Need help?</span>
            <Link href="/contact" className="transition-colors hover:text-brand-accent">
              Contact the team
            </Link>
          </p>
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
                    <NavLinks onNavigate={() => setOpen(false)} unread={unread} />
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
          </div>
          <div className="flex items-center gap-2.5">
            <NotificationBell />
            <BellButton />
            <ThemeToggle />
            <UserChip user={user} />
          </div>
        </header>

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
