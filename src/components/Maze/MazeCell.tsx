import { cn } from "@/lib/utils";
import { Flag, Play } from "lucide-react";
import { memo, useMemo } from "react";
import type { Cell, CellState } from "./types";

const STATE_BG: Record<CellState, string> = {
  unvisited: "bg-background",
  visited:   "bg-primary/15",
  frontier:  "bg-primary/65",
  path:      "bg-primary",
  start:     "bg-accent",
  end:       "bg-destructive",
};

/** CSS animation class applied on state entry. `prefers-reduced-motion` disables them in CSS. */
const STATE_ANIM: Partial<Record<CellState, string>> = {
  visited:  "maze-anim-visited",
  frontier: "maze-anim-frontier",
  // 'path' intentionally omitted: the outer cell must NOT re-animate when a previously
  // visible cell (visited/frontier) becomes a path cell — only the inner circle mounts
  // fresh and handles its own staggered entrance via maze-anim-circle.
  start:    "maze-anim-marker",
  end:      "maze-anim-marker",
};

// Distinct OKLCH colors for start/end that stand apart from the blue→violet→orange path gradient
const START_COLOR = "oklch(0.70 0.22 145)"; // vibrant emerald
const END_COLOR   = "oklch(0.78 0.16  55)"; // warm amber / gold

interface MazeCellProps {
  cell: Cell;
  pathIndex?: number;
  pathLength?: number;
}

/**
 * Interpolates an OKLCH path color and glow from blue-indigo → violet/magenta → red-orange.
 * Hue sweeps clockwise: 264° → 387°/27° over 123°.
 */
function getPathStyle(pathIndex: number, pathLength: number): React.CSSProperties {
  const progress = pathLength > 1 ? pathIndex / (pathLength - 1) : 0;
  const hue      = (264 + progress * 123) % 360;
  const l = 0.6, c = 0.2;
  const color = `oklch(${l} ${c} ${hue.toFixed(1)})`;
  return {
    background: color,
    boxShadow: `0 0 10px 3px oklch(${l} ${c} ${hue.toFixed(1)} / 0.45), inset 0 0 5px 0px oklch(1 0 0 / 0.12)`,
  };
}

export const MazeCell = memo(
  function MazeCell({ cell, pathIndex, pathLength }: MazeCellProps) {
    const { walls, state, position } = cell;

    const isMarker = state === "start" || state === "end";

    const hasPathGradient =
      state === "path" &&
      pathIndex  !== undefined &&
      pathLength !== undefined &&
      pathLength > 0;

    // Stagger path cells so the gradient ripple flows from start → end (max 2 s)
    const pathDelay = hasPathGradient ? Math.min(pathIndex! * 0.025, 2) : 0;

    const pathStyle = useMemo(
      () => (hasPathGradient ? getPathStyle(pathIndex!, pathLength!) : undefined),
      [hasPathGradient, pathIndex, pathLength],
    );

    // Sweep delay: stagger each stone so the flow pulse travels start → end, looping every 6 s
    const scanDelay = pathIndex !== undefined ? pathIndex * 0.015 + 3.0 : 3.0;

    const animClass  = STATE_ANIM[state];
    const animStyle  = pathDelay > 0 ? { animationDelay: `${pathDelay}s` } : undefined;

    return (
      <div
        role="gridcell"
        aria-label={`Row ${position.row + 1}, column ${position.col + 1}: ${state}`}
        className={cn(
          "relative flex items-center justify-center",
          hasPathGradient || isMarker ? "bg-background" : STATE_BG[state],
          "border border-foreground/50",
          !walls.north && "border-t-0",
          !walls.south && "border-b-0",
          !walls.east  && "border-r-0",
          !walls.west  && "border-l-0",
          animClass,
          // Raise the start cell above its siblings so the sonar ring
          // can expand in all 4 directions without being clipped by
          // adjacent cells painting on top.
          state === "start" && "z-10",
        )}
        style={animStyle}
      >
        {/* Stepping-stone circle — springs in with staggered delay via CSS animation */}
        {hasPathGradient && (
          <div
            className="absolute w-[70%] h-[70%] rounded-full maze-anim-circle"
            style={{ ...pathStyle, animationDelay: `${pathDelay}s` }}
          >
            {/* Flow wave clips to the rounded shape; hidden via CSS when reduced-motion is set */}
            <div
              className="maze-flow-wave absolute inset-0 rounded-full bg-white/60 pointer-events-none"
              style={{
                opacity: 0,
                animation: "path-flow 6s linear infinite both",
                animationDelay: `${scanDelay}s`,
              }}
            />
          </div>
        )}

        {/* ── Start marker ─────────────────────────────────────────────────────
            Emerald rounded square with a Play icon.
            A sonar-ping ring radiates outward after the spring entrance,
            signalling "this is where you begin".                              */}
        {state === "start" && (
          <div className="absolute inset-[8%]">
            {/* Sonar ring — scales up and fades out on a 2 s loop */}
            <div
              className="maze-start-pulse absolute inset-0 rounded-md border-2 pointer-events-none"
              style={{ borderColor: START_COLOR }}
            />
            {/* Filled marker */}
            <div
              className="relative size-full rounded-md flex items-center justify-center"
              style={{
                background:  START_COLOR,
                boxShadow: `0 0 8px 2px oklch(0.70 0.22 145 / 0.55)`,
              }}
            >
              <Play
                aria-hidden="true"
                className="size-[52%] text-white"
                strokeWidth={2.5}
              />
            </div>
          </div>
        )}

        {/* ── End marker ───────────────────────────────────────────────────────
            Warm amber rounded square with a Flag icon — the finish destination. */}
        {state === "end" && (
          <div
            className="absolute inset-[8%] rounded-md flex items-center justify-center"
            style={{
              background:  END_COLOR,
              boxShadow: `0 0 8px 2px oklch(0.78 0.16 55 / 0.55)`,
            }}
          >
            <Flag
              aria-hidden="true"
              className="size-[52%] text-white"
              strokeWidth={2.5}
            />
          </div>
        )}
      </div>
    );
  },
  // Only re-render when visible state changes — walls and position are immutable post-generation.
  (prev, next) =>
    prev.cell.state === next.cell.state &&
    prev.pathIndex  === next.pathIndex  &&
    prev.pathLength === next.pathLength,
);
