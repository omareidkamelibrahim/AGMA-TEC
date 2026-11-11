"use client";

import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes";
import { Toaster } from "sonner";
import { useSyncExternalStore } from "react";

const emptySubscribe = () => () => {};

/** Toaster that follows the active color theme (dark styles unchanged). */
function ThemedToaster() {
  const { resolvedTheme } = useTheme();

  // Hydration-safe: the stored theme is only known client-side, so the first
  // render must be deterministic ("dark") and the real theme applied after
  // mount — otherwise light-theme users get a server/client attribute mismatch.
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
  const light = mounted && resolvedTheme === "light";
  return (
    <Toaster
      theme={light ? "light" : "dark"}
      position="bottom-right"
      toastOptions={
        light
          ? {
              style: {
                background: "#ffffff",
                border: "1px solid rgba(12, 76, 151, 0.18)",
                color: "#0f2547",
              },
            }
          : {
              style: {
                background: "#0D1B30",
                border: "1px solid rgba(122,164,224,0.2)",
                color: "#E9F0FA",
              },
            }
      }
    />
  );
}

/**
 * Theme provider — class strategy on <html>, dark-first default (brand
 * identity). next-themes injects a pre-paint script so the stored theme
 * is applied before first render: no flash, persisted across sessions.
 */
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem={false}
      disableTransitionOnChange
    >
      {children}
      <ThemedToaster />
    </NextThemesProvider>
  );
}
