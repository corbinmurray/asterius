import { cn } from "@/lib/utils";
import type { SolverStatus } from "./hooks/useAnimationEngine";

export const STATUS_LABEL: Record<SolverStatus, string> = {
  idle: "Ready",
  running: "Solving…",
  found: "Path found",
  "not-found": "No path",
} as const;

export const STATUS_DETAIL: Record<SolverStatus, string> = {
  idle: "Select an algorithm and press Solve.",
  running: "Algorithm is exploring the maze…",
  found: "A valid path was discovered!",
  "not-found": "This maze has no solution.",
} as const;

export function statusDotClass(status: SolverStatus): string {
  return cn(
    "shrink-0",
    status === "idle" && "fill-muted-foreground/40 text-muted-foreground/40",
    status === "running" && "fill-primary/70 text-primary/70 animate-pulse",
    status === "found" && "fill-primary text-primary",
    status === "not-found" && "fill-destructive text-destructive",
  );
}

export function statusCardClass(status: SolverStatus): string {
  return cn(
    "flex items-start gap-3 p-4 rounded-xl border",
    status === "found" && "bg-primary/8 border-primary/25",
    status === "not-found" && "bg-destructive/8 border-destructive/25",
    status === "running" && "bg-muted border-border",
    status === "idle" && "bg-muted/60 border-border",
  );
}

export function statusLabelClass(status: SolverStatus): string {
  return cn(
    "text-sm font-semibold leading-none",
    status === "found" && "text-primary",
    status === "not-found" && "text-destructive",
    (status === "running" || status === "idle") && "text-foreground",
  );
}

/** Compact pill class for algorithm ToggleGroupItems in the mobile bottom bar */
export const ALGO_PILL_CLASS = [
  "flex-1 h-9 px-1.5 text-xs font-semibold truncate min-w-0",
  "data-[state=on]:bg-primary/10 data-[state=on]:border-primary/35 data-[state=on]:dark:text-primary-foreground",
].join(" ");

/** Full-size card class for algorithm selector buttons (desktop sidebar + mobile sheet) */
export function algoCardClass(isSelected: boolean): string {
  return cn(
    "w-full flex flex-col items-start gap-1.5 px-4 py-3 rounded-xl border text-left",
    "transition-colors duration-150",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
    isSelected
      ? "bg-primary/10 border-primary/35 shadow-sm"
      : "bg-background border-border hover:border-primary/25 hover:bg-muted/50",
  );
}
