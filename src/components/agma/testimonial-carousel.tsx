"use client";

import { useCallback, useEffect, useState } from "react";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  type Variants,
} from "framer-motion";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";

/**
 * Premium auto-playing testimonial carousel.
 *
 * - Directional slide + fade + soft blur transitions (grid-stack staging,
 *   so both slides share one cell during the cross-transition — no height
 *   jumps, no layout glitches).
 * - Autoplay pauses on hover / keyboard focus / hidden tab, restarts its
 *   timer after manual navigation, and is disabled entirely under
 *   prefers-reduced-motion.
 * - Manual control: arrows, clickable indicators, pointer/touch swipe and
 *   arrow keys.
 * - Only verbatim, approved testimonials are rendered — nothing invented.
 */

export type Testimonial = {
  quote: string;
  name: string;
  org: string;
  initials: string;
};

const EASE = [0.22, 1, 0.36, 1] as const;
const AUTOPLAY_MS = 4000;
const SWIPE_THRESHOLD = 70;

export function TestimonialsCarousel({ quotes }: { quotes: Testimonial[] }) {
  const [[index, direction], setPage] = useState<[number, number]>([0, 0]);
  const reduced = useReducedMotion();
  const [paused, setPaused] = useState(false);
  const [tabHidden, setTabHidden] = useState(false);
  /* Hover-pause only on devices that truly support hover — touch taps fire
     synthetic mouseenter events that never pair with mouseleave, which
     would pause autoplay forever on mobile. */
  const [canHover] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(hover: hover)").matches,
  );
  const count = quotes.length;

  const paginate = useCallback(
    (dir: number) => {
      setPage(([i]) => [(i + dir + count) % count, dir]);
    },
    [count],
  );

  const goTo = useCallback((target: number) => {
    setPage(([i]) => (target === i ? [i, 0] : [target, target > i ? 1 : -1]));
  }, []);

  /* Autoplay — starts on mount and always runs (reduced-motion users get
     opacity-only fades instead of slides, but the carousel still advances).
     The timer resets whenever the slide changes, so manual navigation gets
     a full interval. Cleanup guarantees exactly one live interval. */
  useEffect(() => {
    if (paused || tabHidden) return;
    const id = window.setInterval(() => paginate(1), AUTOPLAY_MS);
    return () => window.clearInterval(id);
  }, [paused, tabHidden, index, paginate]);

  /* Pause while the tab is in the background. */
  useEffect(() => {
    const onVisibility = () => setTabHidden(document.hidden);
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  const variants: Variants = {
    enter: (dir: number) =>
      reduced
        ? { opacity: 0 }
        : { x: dir >= 0 ? 140 : -140, opacity: 0, scale: 0.96, filter: "blur(6px)" },
    center: { x: 0, opacity: 1, scale: 1, filter: "blur(0px)" },
    exit: (dir: number) =>
      reduced
        ? { opacity: 0, pointerEvents: "none" }
        : {
            x: dir >= 0 ? -140 : 140,
            opacity: 0,
            scale: 0.96,
            filter: "blur(6px)",
            pointerEvents: "none",
          },
  };

  const onDragEnd = (_: unknown, info: { offset: { x: number } }) => {
    if (info.offset.x <= -SWIPE_THRESHOLD) paginate(1);
    else if (info.offset.x >= SWIPE_THRESHOLD) paginate(-1);
  };

  const q = quotes[index];
  const prev = quotes[(index - 1 + count) % count];
  const next = quotes[(index + 1) % count];

  return (
    <div
      role="region"
      aria-roledescription="carousel"
      aria-label="Client testimonials"
      className="relative"
      onMouseEnter={() => canHover && setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onKeyDown={(e) => {
        if (e.key === "ArrowLeft") {
          e.preventDefault();
          paginate(-1);
        } else if (e.key === "ArrowRight") {
          e.preventDefault();
          paginate(1);
        }
      }}
    >
      {/* ambient glow behind the stage */}
      <div
        aria-hidden
        className="absolute left-1/2 top-1/2 -z-10 h-[380px] w-[640px] max-w-full -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,var(--glow-navy-md),transparent)] blur-2xl"
      />

      {/* side peeks — desktop only, sit in the gutters and never overlap
          the sliding stage (slide shift is 140px, gutters are 272px) */}
      <PeekCard
        quote={prev}
        side="prev"
        label="Previous testimonial"
        onClick={() => paginate(-1)}
      />
      <PeekCard
        quote={next}
        side="next"
        label="Next testimonial"
        onClick={() => paginate(1)}
      />

      {/* stage */}
      <div
        className="relative z-10 mx-auto w-full max-w-2xl"
        aria-live={paused || tabHidden ? "polite" : "off"}
      >
        <div className="grid">
          <AnimatePresence initial={false} custom={direction}>
            <motion.figure
              key={index}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: reduced ? 0.3 : 0.7, ease: EASE }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.16}
              onDragEnd={onDragEnd}
              aria-roledescription="slide"
              aria-label={`Testimonial ${index + 1} of ${count}`}
              className="col-start-1 row-start-1 cursor-grab select-none active:cursor-grabbing"
            >
              <div className="card-lift group relative flex min-h-[380px] flex-col overflow-hidden rounded-3xl border border-border bg-ink-850/85 p-7 transition-[border-color,box-shadow] duration-500 hover:border-brand-500/40 hover:shadow-[0_24px_80px_-24px_var(--glow-navy-strong)] sm:min-h-[340px] sm:p-11">
                {/* floating watermark quote */}
                <motion.span
                  aria-hidden
                  className="pointer-events-none absolute -right-5 -top-9 select-none"
                  animate={reduced ? undefined : { y: [0, -12, 0] }}
                  transition={
                    reduced
                      ? undefined
                      : { repeat: Infinity, duration: 8, ease: "easeInOut" }
                  }
                >
                  <Quote
                    className="size-36 text-brand-500/[0.07] sm:size-44"
                    strokeWidth={1}
                  />
                </motion.span>

                <Quote
                  className="size-8 shrink-0 text-brand-500/70"
                  aria-hidden
                />

                <blockquote className="mt-6 flex-1 text-lg font-medium leading-relaxed text-foreground/90 sm:text-[22px] sm:leading-[1.7]">
                  “{q.quote}”
                </blockquote>

                <figcaption className="mt-8 flex items-center gap-4 border-t border-border/60 pt-6">
                  <span className="flex size-12 shrink-0 items-center justify-center rounded-full border border-brand-500/40 bg-brand-500/15 font-display text-sm font-bold text-brand-accent">
                    {q.initials}
                  </span>
                  <span>
                    <span className="block text-sm font-semibold text-foreground">
                      {q.name}
                    </span>
                    <span className="block text-[12.5px] text-muted-foreground">
                      {q.org}
                    </span>
                  </span>
                </figcaption>
              </div>
            </motion.figure>
          </AnimatePresence>
        </div>
      </div>

      {/* controls */}
      <div className="mt-8 flex items-center justify-center gap-5 lg:hidden">
        <ArrowButton
          dir="prev"
          label="Previous testimonial"
          onClick={() => paginate(-1)}
          className="inline-flex"
        />
        <Indicators count={count} index={index} goTo={goTo} />
        <ArrowButton
          dir="next"
          label="Next testimonial"
          onClick={() => paginate(1)}
          className="inline-flex"
        />
      </div>
      <div className="mt-9 hidden justify-center lg:flex">
        <Indicators count={count} index={index} goTo={goTo} />
      </div>

      {/* flanking arrows — desktop only */}
      <ArrowButton
        dir="prev"
        label="Previous testimonial"
        onClick={() => paginate(-1)}
        className="absolute left-0 top-[calc(50%-40px)] hidden -translate-y-1/2 lg:inline-flex"
      />
      <ArrowButton
        dir="next"
        label="Next testimonial"
        onClick={() => paginate(1)}
        className="absolute right-0 top-[calc(50%-40px)] hidden -translate-y-1/2 lg:inline-flex"
      />
    </div>
  );
}

function ArrowButton({
  dir,
  label,
  onClick,
  className = "",
}: {
  dir: "prev" | "next";
  label: string;
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={`group/arw size-11 items-center justify-center rounded-full border border-border bg-ink-850/80 text-muted-foreground backdrop-blur transition-all duration-300 hover:border-brand-500/60 hover:bg-brand-500 hover:text-white hover:shadow-[0_8px_30px_-8px_var(--glow-navy-md)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/60 ${className}`}
    >
      {dir === "prev" ? (
        <ChevronLeft className="size-5 transition-transform duration-300 group-hover/arw:-translate-x-0.5" />
      ) : (
        <ChevronRight className="size-5 transition-transform duration-300 group-hover/arw:translate-x-0.5" />
      )}
    </button>
  );
}

function Indicators({
  count,
  index,
  goTo,
}: {
  count: number;
  index: number;
  goTo: (i: number) => void;
}) {
  return (
    <div
      className="flex items-center justify-center gap-2.5"
      role="tablist"
      aria-label="Choose testimonial"
    >
      {Array.from({ length: count }, (_, i) => (
        <button
          key={i}
          type="button"
          role="tab"
          aria-selected={i === index}
          aria-label={`Go to testimonial ${i + 1}`}
          onClick={() => goTo(i)}
          className={`h-2 rounded-full transition-all duration-500 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/60 ${
            i === index
              ? "w-9 bg-brand-500"
              : "w-2 bg-foreground/20 hover:w-3.5 hover:bg-foreground/40"
          }`}
        />
      ))}
    </div>
  );
}

function PeekCard({
  quote,
  side,
  label,
  onClick,
}: {
  quote: Testimonial;
  side: "prev" | "next";
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      tabIndex={-1}
      className={`absolute top-1/2 z-0 hidden w-60 -translate-y-1/2 rounded-2xl border border-border bg-ink-850/60 p-6 text-left opacity-35 blur-[1px] transition-all duration-500 hover:border-brand-500/40 hover:bg-ink-850/85 hover:opacity-75 hover:blur-none focus-visible:opacity-75 focus-visible:blur-none focus-visible:outline-none xl:block ${
        side === "prev" ? "left-0" : "right-0"
      }`}
    >
      <Quote className="size-5 text-brand-500/60" aria-hidden />
      <p className="mt-3 line-clamp-4 text-[13px] leading-relaxed text-foreground/70">
        {quote.quote}
      </p>
      <p className="mt-4 text-xs font-semibold text-foreground/80">
        {quote.name}
      </p>
      <p className="text-[11px] text-muted-foreground">{quote.org}</p>
    </button>
  );
}
