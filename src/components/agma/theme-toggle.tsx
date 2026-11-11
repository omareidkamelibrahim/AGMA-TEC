"use client";

import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { useSyncExternalStore } from "react";
import { cn } from "@/lib/utils";

const emptySubscribe = () => () => {};

/**
 * Dark / Light mode toggle — Sun/Moon crossfade, matches the navbar's
 * circular icon buttons. Surface colors adapt via the ink-* token flip.
 */
export function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();

  // Avoid hydration mismatch: false on the server snapshot, true on client.
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );

  const isLight = mounted && resolvedTheme === "light";

  return (
    <button
      type="button"
      onClick={() => setTheme(isLight ? "dark" : "light")}
      aria-label="Toggle dark / light mode"
      title={isLight ? "Switch to dark mode" : "Switch to light mode"}
      className={cn(
        "relative flex size-10 shrink-0 items-center justify-center rounded-full border border-border bg-ink-800/60 text-muted-foreground transition-colors hover:bg-ink-700 hover:text-foreground focus-visible:outline-2 focus-visible:outline-brand-400",
        className
      )}
    >
      <span className="relative block size-5" aria-hidden>
        <Sun
          className={cn(
            "absolute inset-0 size-5 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
            isLight ? "rotate-0 scale-100 opacity-100" : "-rotate-90 scale-50 opacity-0"
          )}
        />
        <Moon
          className={cn(
            "absolute inset-0 size-5 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
            isLight ? "rotate-90 scale-50 opacity-0" : "rotate-0 scale-100 opacity-100"
          )}
        />
      </span>
    </button>
  );
}
