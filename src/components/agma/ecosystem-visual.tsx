"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";

/**
 * Digital Transformation Ecosystem — the hero's right-side visual.
 *
 * A code-built cinematic composition (no images, no extra libraries):
 *   L0  ambient navy aura (theme-adaptive glows)
 *   L1  orbital rings with satellites drifting along elliptical paths
 *   L2  network of enterprise nodes linked to the core, with data
 *       particles travelling the connection lines (SMIL)
 *   L3  the central technology core: layered translucent hex faces,
 *       rotating dashed ring, conic light-sweep, breathing orb and the
 *       six AGMA logo beads hovering at its heart
 *   L4  floating glass interface fragments (analytics, telemetry, mesh)
 *
 * Every colour resolves through --eco-* / --glow-* CSS variables, so the
 * identical composition serves dark and light themes. All motion is
 * transform/opacity only, pauses off-screen, honours prefers-reduced-motion
 * and answers pointer movement with gentle depth parallax on desktop.
 */

const EASE = [0.22, 1, 0.36, 1] as const;

/* ─── Geometry (600×600 viewBox, core centre 300,300) ──────────────────── */

type NodeSpec = { x: number; y: number; chip?: boolean };

const NODES: NodeSpec[] = [
  { x: 300, y: 64, chip: true },
  { x: 436, y: 120 },
  { x: 540, y: 300 },
  { x: 436, y: 480 },
  { x: 300, y: 536, chip: true },
  { x: 164, y: 480 },
  { x: 60, y: 300 },
  { x: 164, y: 120 },
  { x: 392, y: 74 },
];

/* Connections node → core (first 9) and node → node (rest). */
const LINKS = [
  "M 300 74 Q 292 112 300 152",
  "M 436 120 Q 415 150 389 182",
  "M 540 300 Q 500 292 452 300",
  "M 436 480 Q 415 450 389 418",
  "M 300 526 Q 308 488 300 448",
  "M 164 480 Q 185 450 211 418",
  "M 60 300 Q 100 308 148 300",
  "M 164 120 Q 185 150 211 182",
  "M 392 74 Q 378 120 356 163",
  "M 172 122 Q 226 84 288 68",
  "M 536 292 Q 502 196 444 128",
  "M 292 532 Q 220 512 172 478",
  "M 68 308 Q 106 400 158 472",
  "M 396 84 Q 424 96 432 116",
];

/* Data particles riding selected links (SMIL animateMotion);
   `at` = resting spot on the link when motion is reduced. */
const PARTICLES = [
  { d: LINKS[0], dur: 5.2, begin: -1.2, at: [300, 74] },
  { d: LINKS[1], dur: 6.8, begin: -2.4, at: [436, 120] },
  { d: "M 452 300 Q 500 292 540 300", dur: 6, begin: -0.5, at: [452, 300] },
  { d: LINKS[3], dur: 7.4, begin: -3.6, at: [436, 480] },
  { d: LINKS[11], dur: 5.6, begin: -4.1, at: [292, 532] },
  { d: "M 211 182 Q 185 150 164 120", dur: 6.4, begin: -2, at: [211, 182] },
];
const PARTICLES_DETAIL = [
  { d: LINKS[9], dur: 7, begin: -1.8, at: [172, 122] },
  { d: LINKS[4], dur: 5.4, begin: -2.9, at: [300, 526] },
];

/* Orbital ellipses with satellite phases; `at` = static spot when motion is reduced. */
const ORBIT_A = "M 42 300 a 258 98 0 1 0 516 0 a 258 98 0 1 0 -516 0";
const ORBIT_B = "M 110 300 a 190 64 0 1 0 380 0 a 190 64 0 1 0 -380 0";
const ORBIT_C = "M 16 300 a 284 118 0 1 0 568 0 a 284 118 0 1 0 -568 0";
const SATELLITES_A = [
  { dur: 30, begin: -6, at: [42, 300] },
  { dur: 30, begin: -21, at: [558, 300] },
  { dur: 45, begin: -12, at: [300, 398] },
];

/* The six AGMA beads — logo geometry scaled 0.5 around (42.5, 40). */
const BEADS = [
  { dx: 0, dy: -12.75, tier: 2 },
  { dx: 7.25, dy: -0.5, tier: 3 },
  { dx: 15, dy: 11.75, tier: 3 },
  { dx: -7.5, dy: 0, tier: 1 },
  { dx: 0, dy: 11.75, tier: 2 },
  { dx: -15, dy: 12.25, tier: 1 },
];

const hexPoints = (r: number, cx = 300, cy = 300) =>
  Array.from({ length: 6 }, (_, i) => {
    const a = (Math.PI / 180) * (60 * i - 30);
    return `${(cx + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a)).toFixed(1)}`;
  }).join(" ");

/* ─── Sub-components ───────────────────────────────────────────────────── */

function OrbitLayer({ reduce }: { reduce: boolean }) {
  return (
    <svg
      viewBox="0 0 600 600"
      className="absolute inset-0 h-full w-full"
      aria-hidden
    >
      <g transform="rotate(-16 300 300)">
        <path
          d={ORBIT_A}
          fill="none"
          className="eco-stroke-soft"
          strokeWidth={1}
          strokeDasharray="1 7"
          strokeLinecap="round"
        />
        {SATELLITES_A.map((s, i) => (
          <g key={i} transform={reduce ? `translate(${s.at[0]} ${s.at[1]})` : undefined}>
            <circle r={7} className="eco-fill-node" opacity={0.16} />
            <circle r={2.8} className="eco-fill-node" />
            {!reduce && (
              <animateMotion dur={`${s.dur}s`} begin={`${s.begin}s`} repeatCount="indefinite" path={ORBIT_A} />
            )}
          </g>
        ))}
      </g>
      <g transform="rotate(22 300 300)">
        <path
          d={ORBIT_B}
          fill="none"
          className="eco-stroke-soft"
          strokeWidth={1}
          strokeDasharray="1 7"
          strokeLinecap="round"
          opacity={0.8}
        />
        <g transform={reduce ? "translate(300 236)" : undefined}>
          <circle r={6} className="eco-fill-node" opacity={0.16} />
          <circle r={2.4} className="eco-fill-node" />
          {!reduce && (
            <animateMotion dur="24s" begin="-4s" repeatCount="indefinite" path={ORBIT_B} />
          )}
        </g>
      </g>
      <g transform="rotate(6 300 300)" className="hidden md:block">
        <path
          d={ORBIT_C}
          fill="none"
          className="eco-stroke-soft"
          strokeWidth={1}
          strokeDasharray="1 9"
          strokeLinecap="round"
          opacity={0.55}
        />
        <g transform={reduce ? "translate(300 418)" : undefined}>
          <circle r={5} className="eco-fill-node" opacity={0.12} />
          <circle r={2} className="eco-fill-node" opacity={0.7} />
          {!reduce && (
            <animateMotion dur="55s" begin="-20s" repeatCount="indefinite" path={ORBIT_C} />
          )}
        </g>
      </g>
    </svg>
  );
}

function NetworkLayer({ reduce }: { reduce: boolean }) {
  return (
    <svg
      viewBox="0 0 600 600"
      className="absolute inset-0 h-full w-full"
      aria-hidden
    >
      {/* connection lines — drawn on entrance */}
      {LINKS.map((d, i) => (
        <motion.path
          key={i}
          d={d}
          fill="none"
          className="eco-stroke-line"
          strokeWidth={i < 9 ? 1.1 : 0.9}
          strokeLinecap="round"
          opacity={i < 9 ? 1 : 0.55}
          initial={reduce ? false : { pathLength: 0, opacity: 0 }}
          animate={reduce ? undefined : { pathLength: 1, opacity: i < 9 ? 1 : 0.55 }}
          transition={{ duration: 1.3, delay: 0.55 + i * 0.07, ease: EASE }}
        />
      ))}

      {/* enterprise nodes */}
      {NODES.map((n, i) => (
        <motion.g
          key={i}
          transform={`translate(${n.x} ${n.y})`}
          initial={reduce ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.95 + i * 0.07, ease: EASE }}
        >
          {n.chip ? (
            <>
              <circle r={17} className="eco-fill-node eco-pulse eco-anim" opacity={0.14} style={{ animationDelay: `${i * 0.55}s` }} />
              <rect x={-13} y={-9} width={26} height={18} rx={5} className="eco-fill-face eco-stroke-line" strokeWidth={1} />
              <circle cx={-6} r={1.6} className="eco-fill-node" />
              <circle cx={0} r={1.6} className="eco-fill-node" />
              <circle cx={6} r={1.6} className="eco-fill-node" />
            </>
          ) : (
            <>
              <circle r={10} className="eco-fill-node eco-pulse eco-anim" opacity={0.22} style={{ animationDelay: `${i * 0.55}s` }} />
              <circle r={6.5} fill="none" className="eco-stroke-soft" strokeWidth={1} />
              <circle r={3.2} className="eco-fill-node" />
            </>
          )}
        </motion.g>
      ))}

      {/* secondary detail nodes — desktop only */}
      <g className="hidden md:block">
        {[
          [208, 84],
          [44, 216],
          [236, 522],
          [540, 180],
        ].map(([x, y], i) => (
          <g key={i} transform={`translate(${x} ${y})`}>
            <circle r={6} className="eco-fill-node" opacity={0.14} />
            <circle r={2.4} className="eco-fill-node" opacity={0.8} />
          </g>
        ))}
        {/* ambient plus-marks */}
        {[
          [516, 88],
          [96, 120],
          [68, 392],
        ].map(([x, y], i) => (
          <g key={i} transform={`translate(${x} ${y})`} className="eco-stroke-line" strokeWidth={1} strokeLinecap="round" opacity={0.4}>
            <line x1={-4} y1={0} x2={4} y2={0} />
            <line x1={0} y1={-4} x2={0} y2={4} />
          </g>
        ))}
      </g>

      {/* data particles travelling the links */}
      <motion.g
        initial={reduce ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.3, ease: EASE }}
      >
        {PARTICLES.map((p, i) => (
          <g key={i} transform={reduce ? `translate(${p.at[0]} ${p.at[1]})` : undefined}>
            <circle r={4.6} className="eco-fill-particle" opacity={0.22} />
            <circle r={2} className="eco-fill-particle" />
            {!reduce && (
              <animateMotion dur={`${p.dur}s`} begin={`${p.begin}s`} repeatCount="indefinite" path={p.d} />
            )}
          </g>
        ))}
        <g className="hidden md:block">
          {PARTICLES_DETAIL.map((p, i) => (
            <g key={i} transform={reduce ? `translate(${p.at[0]} ${p.at[1]})` : undefined}>
              <circle r={4} className="eco-fill-particle" opacity={0.18} />
              <circle r={1.7} className="eco-fill-particle" opacity={0.85} />
              {!reduce && (
                <animateMotion dur={`${p.dur}s`} begin={`${p.begin}s`} repeatCount="indefinite" path={p.d} />
              )}
            </g>
          ))}
        </g>
      </motion.g>
    </svg>
  );
}

function CoreLayer({ reduce }: { reduce: boolean }) {
  const uid = useId().replace(/[:]/g, "");
  return (
    <div className="eco-anim animate-float-y-slow h-full w-full">
      <div className="eco-sway eco-anim relative h-full w-full">
        {/* conic light-sweep on the outer ring */}
        <div className="eco-conic absolute inset-0 rounded-full" />
        <svg viewBox="0 0 600 600" className="absolute inset-0 h-full w-full" aria-hidden>
          <defs>
            <radialGradient id={`${uid}-orb`}>
              <stop offset="0%" className="eco-stop-orb-inner" style={{ stopOpacity: 0.95 }} />
              <stop offset="42%" className="eco-stop-orb" style={{ stopOpacity: 0.55 }} />
              <stop offset="100%" className="eco-stop-orb" style={{ stopOpacity: 0 }} />
            </radialGradient>
            <linearGradient id={`${uid}-ring`} x1="0%" y1="0%" x2="80%" y2="100%">
              <stop offset="0%" className="eco-stop-orb-inner" />
              <stop offset="100%" className="eco-stop-orb" />
            </linearGradient>
          </defs>

          {/* rotating dashed halo */}
          <g className="eco-anim" style={{ animation: "eco-conic-rot 70s linear infinite", transformOrigin: "300px 300px" }}>
            <circle cx={300} cy={300} r={132} fill="none" className="eco-stroke-line" strokeWidth={1} strokeDasharray="2 9" opacity={0.5} />
          </g>

          {/* gradient ring */}
          <circle cx={300} cy={300} r={118} fill="none" stroke={`url(#${uid}-ring)`} strokeWidth={1.3} opacity={0.65} />

          {/* cardinal ticks */}
          <g className="eco-stroke-line" strokeWidth={1} opacity={0.5} strokeLinecap="round">
            <line x1={300} y1={176} x2={300} y2={162} />
            <line x1={424} y1={300} x2={438} y2={300} />
            <line x1={300} y1={424} x2={300} y2={438} />
            <line x1={176} y1={300} x2={162} y2={300} />
          </g>

          {/* layered translucent hex faces */}
          <polygon points={hexPoints(96)} className="eco-fill-face-2" strokeWidth={1} strokeLinejoin="round" style={{ stroke: "var(--eco-line)", strokeOpacity: 0.6 }} />
          <g className="eco-sway eco-anim">
            <polygon points={hexPoints(68)} className="eco-fill-face" strokeWidth={1} strokeLinejoin="round" style={{ stroke: "var(--eco-line)", strokeOpacity: 0.7 }} />
            <polygon points={hexPoints(42)} className="eco-fill-face" strokeWidth={1} strokeLinejoin="round" style={{ stroke: "var(--eco-line)", strokeOpacity: 0.45 }} opacity={0.9} />
          </g>

          {/* breathing orb */}
          <circle cx={300} cy={300} r={54} fill={`url(#${uid}-orb)`} className="eco-anim animate-pulse-soft" />
          <circle cx={300} cy={300} r={22} className="eco-fill-orb-inner" opacity={0.28} />

          {/* six AGMA beads hovering at the core's heart */}
          {BEADS.map((b, i) => (
            <g
              key={i}
              className="eco-bob eco-anim"
              style={{
                animationDelay: `${i * 0.4}s`,
                animationDuration: `${5.5 + i * 0.3}s`,
              }}
            >
              <circle
                cx={300 + b.dx}
                cy={300 + b.dy}
                r={9.5}
                className={i % 2 === 0 ? "eco-fill-orb" : "eco-fill-node"}
                opacity={0.18}
              />
              <circle
                cx={300 + b.dx}
                cy={300 + b.dy}
                r={5.4}
                style={{ fill: `var(--eco-bead-${b.tier})` }}
              />
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
}

/* ─── Main component ───────────────────────────────────────────────────── */

export function EcosystemVisual() {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const [canParallax, setCanParallax] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(pointer: fine)");
    const update = () => setCanParallax(mq.matches && window.innerWidth >= 768);
    update();
    mq.addEventListener("change", update);
    window.addEventListener("resize", update);
    return () => {
      mq.removeEventListener("change", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  /* Pause every animation while the visual is outside the viewport. */
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        const paused = !entry.isIntersecting;
        el.toggleAttribute("data-eco-paused", paused);
        el.querySelectorAll("svg").forEach((svg) => {
          try {
            if (paused) svg.pauseAnimations?.();
            else svg.unpauseAnimations?.();
          } catch {
            /* SMIL control unsupported — CSS pause still applies */
          }
        });
      },
      { threshold: 0.05 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  /* Pointer parallax (desktop, fine pointers, motion allowed). */
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const smx = useSpring(mx, { stiffness: 55, damping: 16, mass: 0.6 });
  const smy = useSpring(my, { stiffness: 55, damping: 16, mass: 0.6 });
  const x0 = useTransform(smx, (v) => v * 4);
  const y0 = useTransform(smy, (v) => v * 4);
  const x1 = useTransform(smx, (v) => v * 7);
  const y1 = useTransform(smy, (v) => v * 7);
  const x2 = useTransform(smx, (v) => v * 10);
  const y2 = useTransform(smy, (v) => v * 10);
  const x3 = useTransform(smx, (v) => v * 14);
  const y3 = useTransform(smy, (v) => v * 14);
  const x4 = useTransform(smx, (v) => v * 18);
  const y4 = useTransform(smy, (v) => v * 18);

  const { scrollY } = useScroll();
  const scrollTilt = useTransform(scrollY, [0, 800], [0, 10]);

  const interactive = canParallax && !reduce;
  const onPointerMove = (e: ReactPointerEvent) => {
    if (!interactive || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    mx.set(((e.clientX - r.left) / r.width) * 2 - 1);
    my.set(((e.clientY - r.top) / r.height) * 2 - 1);
  };
  const onPointerLeave = () => {
    mx.set(0);
    my.set(0);
  };

  return (
    <div
      ref={ref}
      role="img"
      aria-label="Abstract visual of AGMA TEC's connected digital ecosystem — an intelligent technology core linked with enterprise systems, cloud infrastructure and data intelligence"
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      className="relative mx-auto aspect-square w-full max-w-[540px] select-none lg:max-w-[600px]"
    >
      {/* L0 — ambient aura */}
      <motion.div className="absolute inset-0" style={{ x: x0, y: y0 }}>
        <div
          className="eco-anim animate-pulse-soft absolute inset-[6%] rounded-full bg-[radial-gradient(closest-side,var(--glow-navy-strong),transparent_72%)] blur-2xl"
          style={{ animationDuration: "7.5s" }}
        />
        <div className="absolute inset-[22%] rounded-full bg-[radial-gradient(closest-side,var(--glow-navy-md),transparent_70%)] blur-xl" />
      </motion.div>

      {/* L1 — orbital system (subtle scroll drift) */}
      <motion.div
        className="absolute inset-0"
        style={{ x: x1, y: y1, ...(reduce ? {} : { rotate: scrollTilt }) }}
      >
        <OrbitLayer reduce={!!reduce} />
      </motion.div>

      {/* L2 — network + data flow */}
      <motion.div className="absolute inset-0" style={{ x: x2, y: y2 }}>
        <NetworkLayer reduce={!!reduce} />
      </motion.div>

      {/* L3 — central technology core */}
      <motion.div
        className="absolute inset-0"
        style={{ x: x3, y: y3 }}
        initial={reduce ? false : { opacity: 0, scale: 0.72 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.15, delay: 0.15, ease: EASE }}
      >
        <CoreLayer reduce={!!reduce} />
      </motion.div>

      {/* L4 — floating interface fragments */}
      {/* analytics bars */}
      <motion.div
        className="absolute left-[1%] top-[15%] scale-90 sm:scale-100"
        initial={reduce ? false : { opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 1.15, ease: EASE }}
      >
        <motion.div style={{ x: x4, y: y4 }}>
        <div className="glass eco-chip eco-anim animate-float-y rounded-2xl px-4 py-3 shadow-[0_18px_50px_-20px_rgba(2,8,20,0.75)] backdrop-blur-xl light:shadow-[0_18px_50px_-24px_rgba(12,76,151,0.28)]">
          <span className="mb-2 block h-1 w-10 rounded-full bg-muted-foreground/40" />
          <div className="flex h-6 items-end gap-1.5">
            {[10, 18, 13, 22, 15].map((h, i) => (
              <span
                key={i}
                className="eco-bar eco-anim w-1.5 rounded-sm"
                style={{
                  height: h,
                  background: "var(--eco-node)",
                  opacity: 0.45 + i * 0.13,
                  animationDelay: `${i * 0.35}s`,
                }}
              />
            ))}
          </div>
        </div>
        </motion.div>
      </motion.div>

      {/* telemetry sparkline */}
      <motion.div
        className="absolute bottom-[13%] right-[1%] scale-90 sm:scale-100"
        initial={reduce ? false : { opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 1.35, ease: EASE }}
      >
        <motion.div style={{ x: x4, y: y4 }}>
        <div className="glass eco-chip eco-anim animate-float-y-slow rounded-2xl px-4 py-3 shadow-[0_18px_50px_-20px_rgba(2,8,20,0.75)] backdrop-blur-xl light:shadow-[0_18px_50px_-24px_rgba(12,76,151,0.28)]">
          <svg width="118" height="34" viewBox="0 0 118 34" fill="none" aria-hidden>
            <path
              d="M2 26 C 18 20, 26 30, 40 22 S 64 8, 78 16 S 104 24, 112 12"
              stroke="var(--eco-node)"
              strokeWidth={1.5}
              strokeLinecap="round"
              strokeDasharray="4 4"
              className="eco-anim animate-dash"
            />
            <circle cx={112} cy={12} r={5} className="eco-fill-node eco-anim animate-pulse-soft" opacity={0.25} />
            <circle cx={112} cy={12} r={2.4} className="eco-fill-node" />
          </svg>
        </div>
        </motion.div>
      </motion.div>

      {/* integration mesh — desktop only */}
      <motion.div
        className="absolute right-[5%] top-[8%] hidden scale-90 sm:block sm:scale-100"
        initial={reduce ? false : { opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 1.55, ease: EASE }}
      >
        <motion.div style={{ x: x4, y: y4 }}>
        <div
          className="glass eco-chip eco-anim animate-float-y rounded-2xl px-4 py-3 shadow-[0_18px_50px_-20px_rgba(2,8,20,0.75)] backdrop-blur-xl light:shadow-[0_18px_50px_-24px_rgba(12,76,151,0.28)]"
          style={{ animationDelay: "1.2s" }}
        >
          <svg width="64" height="34" viewBox="0 0 64 34" fill="none" aria-hidden>
            <path d="M8 26 L32 7 L56 24 L8 26" stroke="var(--eco-line)" strokeWidth={1} fill="none" />
            <circle cx={32} cy={7} r={5.5} className="eco-fill-node eco-anim animate-pulse-soft" opacity={0.22} />
            <circle cx={8} cy={26} r={2.2} className="eco-fill-node" opacity={0.8} />
            <circle cx={32} cy={7} r={2.6} className="eco-fill-node" />
            <circle cx={56} cy={24} r={2.2} className="eco-fill-node" opacity={0.8} />
          </svg>
        </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
