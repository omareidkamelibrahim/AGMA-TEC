"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Eye, EyeOff, Loader2, LogIn, TriangleAlert } from "lucide-react";

export function LoginForm() {
  const params = useSearchParams();
  const nextPath = params.get("next") ?? "/admin";
  const safeNext = nextPath.startsWith("/admin") ? nextPath : "/admin";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setError(null);
    setBusy(true);
    try {
      const res = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(json.error ?? "Sign-in failed. Please try again.");
        setBusy(false);
        return;
      }
      window.location.assign(safeNext);
    } catch {
      setError("Network error — please try again.");
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mt-7 space-y-4" noValidate>
      {error && (
        <div
          role="alert"
          className="flex items-start gap-2.5 rounded-xl border border-red-500/30 bg-red-500/10 px-3.5 py-2.5 text-[12.5px] font-medium text-red-300"
        >
          <TriangleAlert className="mt-px size-4 shrink-0" />
          {error}
        </div>
      )}

      <div className="space-y-1.5">
        <label htmlFor="email" className="block text-[12px] font-semibold text-foreground">
          Email
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@agma.tech"
          className="h-11 w-full rounded-xl border border-border bg-ink-850/70 px-3.5 text-[13.5px] text-foreground placeholder:text-muted-foreground/60 outline-none transition-colors focus:border-brand-500/60 focus:ring-2 focus:ring-brand-500/20"
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="password" className="block text-[12px] font-semibold text-foreground">
          Password
        </label>
        <div className="relative">
          <input
            id="password"
            type={show ? "text" : "password"}
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="h-11 w-full rounded-xl border border-border bg-ink-850/70 px-3.5 pr-11 text-[13.5px] text-foreground placeholder:text-muted-foreground/60 outline-none transition-colors focus:border-brand-500/60 focus:ring-2 focus:ring-brand-500/20"
          />
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            aria-label={show ? "Hide password" : "Show password"}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
          >
            {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
      </div>

      <button
        type="submit"
        disabled={busy}
        className="mt-2 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 text-[13.5px] font-semibold text-white shadow-lg shadow-brand-600/30 transition-all hover:from-brand-500 hover:to-brand-400 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {busy ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            Signing in…
          </>
        ) : (
          <>
            <LogIn className="size-4" />
            Sign in
          </>
        )}
      </button>
    </form>
  );
}
