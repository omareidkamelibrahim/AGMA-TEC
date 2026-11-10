import { useId } from "react";
import { cn } from "@/lib/utils";

/**
 * Faithful SVG recreation of the AGMA TEC mark.
 * Geometry extracted from the original logo: six bead-circles fused by
 * metaball necks forming a triangular "A" (1-2-3 arrangement).
 * Luminous palette = brand blues brightened for dark backgrounds,
 * preserving the original luminance flow (bright bottom-left → deep top-right).
 */

const BEADS = [
  { cx: 42.5, cy: 14.5, fill: "#3E7ED2" }, // A apex
  { cx: 57.0, cy: 39.0, fill: "#2E5FA8" }, // B mid-right
  { cx: 72.5, cy: 63.5, fill: "#234A85" }, // C bottom-right
  { cx: 27.5, cy: 40.0, fill: "#4D97E9" }, // D mid-left
  { cx: 42.5, cy: 63.5, fill: "#2E6BC4" }, // E bottom-center
  { cx: 12.5, cy: 64.5, fill: "#5FA9F2" }, // F bottom-left (brightest)
];

const NECKS = [
  "M 33.21 20.00 Q 49.06 27.16 47.71 44.50 L 66.29 33.50 Q 50.44 26.34 51.79 9.00 Z",
  "M 47.87 44.77 Q 64.07 51.68 63.37 69.27 L 81.63 57.73 Q 65.43 50.82 66.13 33.23 Z",
  "M 18.40 45.81 Q 34.33 52.18 33.40 69.31 L 51.60 57.69 Q 35.67 51.32 36.60 34.19 Z",
];

export function AgmaMark({
  className,
  animated = false,
}: {
  className?: string;
  animated?: boolean;
}) {
  const uid = useId().replace(/[:]/g, "");
  return (
    <svg
      viewBox="0 0 85 79"
      fill="none"
      className={className}
      role="img"
      aria-label="AGMA TEC mark"
    >
      <defs>
        <linearGradient
          id={`${uid}-n1`}
          x1="42.5"
          y1="14.5"
          x2="57"
          y2="39"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#3E7ED2" />
          <stop offset="1" stopColor="#2E5FA8" />
        </linearGradient>
        <linearGradient
          id={`${uid}-n2`}
          x1="57"
          y1="39"
          x2="72.5"
          y2="63.5"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#2E5FA8" />
          <stop offset="1" stopColor="#234A85" />
        </linearGradient>
        <linearGradient
          id={`${uid}-n3`}
          x1="27.5"
          y1="40"
          x2="42.5"
          y2="63.5"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#4D97E9" />
          <stop offset="1" stopColor="#2E6BC4" />
        </linearGradient>
      </defs>
      <path d={NECKS[0]} fill={`url(#${uid}-n1)`} />
      <path d={NECKS[1]} fill={`url(#${uid}-n2)`} />
      <path d={NECKS[2]} fill={`url(#${uid}-n3)`} />
      {BEADS.map((b, i) => (
        <circle key={i} cx={b.cx} cy={b.cy} r={10.8} fill={b.fill}>
          {animated && (
            <animate
              attributeName="opacity"
              values="1;0.55;1"
              dur={`${2.4 + i * 0.35}s`}
              repeatCount="indefinite"
              begin={`${i * 0.28}s`}
            />
          )}
        </circle>
      ))}
    </svg>
  );
}

export function AgmaLogo({
  className,
  markClassName,
  showTagline = false,
  animated = false,
}: {
  className?: string;
  markClassName?: string;
  showTagline?: boolean;
  animated?: boolean;
}) {
  return (
    <span className={cn("inline-flex items-center gap-3", className)}>
      <AgmaMark className={cn("h-9 w-auto", markClassName)} animated={animated} />
      <span className="flex flex-col leading-none">
        <span className="font-display text-lg font-bold tracking-[0.18em] text-foreground">
          AGMA<span className="text-brand-400"> TEC</span>
        </span>
        {showTagline && (
          <span className="mt-1.5 text-[10px] font-medium uppercase tracking-[0.32em] text-brand-300/80">
            Digital Transformation
          </span>
        )}
      </span>
    </span>
  );
}
