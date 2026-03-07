import type { SolverStatus } from "@/components/Maze/hooks/useAnimationEngine";
import type { Solver } from "@/components/Maze/solvers/types";
import { cn } from "@/lib/utils";
import {
  Button,
  Slider,
  ToggleGroup,
  ToggleGroupItem,
} from "@corbinmurray/ui-components";
import {
  Circle,
  Pause,
  Play,
  RefreshCw,
  RotateCcw,
  Settings,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useId, useState } from "react";
import {
  ALGO_PILL_CLASS,
  STATUS_DETAIL,
  STATUS_LABEL,
  algoCardClass,
  statusCardClass,
  statusDotClass,
  statusLabelClass,
} from "./controlsConfig";

interface MobileControlsBarProps {
  speed: number;
  onSpeedChange: (speed: number) => void;
  onRegenerate: () => void;
  onSolve: () => void;
  onPause: () => void;
  onReset: () => void;
  isRunning: boolean;
  solverStatus: SolverStatus;
  solvers: readonly Solver[];
  selectedSolver: Solver;
  onSolverChange: (solver: Solver) => void;
}

export function MobileControlsBar({
  speed,
  onSpeedChange,
  onRegenerate,
  onSolve,
  onPause,
  onReset,
  isRunning,
  solverStatus,
  solvers,
  selectedSolver,
  onSolverChange,
}: MobileControlsBarProps) {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const dialogId = useId();
  const isComplete = solverStatus === "found" || solverStatus === "not-found";

  useEffect(() => {
    if (!isSheetOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsSheetOpen(false);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isSheetOpen]);

  useEffect(() => {
    document.body.style.overflow = isSheetOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isSheetOpen]);

  return (
    <>
      {/* Backdrop */}
      <AnimatePresence>
        {isSheetOpen && (
          <motion.div
            key="mobile-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 z-40 bg-black/50 xl:hidden"
            onClick={() => setIsSheetOpen(false)}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      {/* Bottom sheet */}
      <AnimatePresence>
        {isSheetOpen && (
          <motion.div
            key="mobile-sheet"
            id={`${dialogId}-sheet`}
            role="dialog"
            aria-modal="true"
            aria-labelledby={`${dialogId}-title`}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 380, damping: 40 }}
            className="fixed bottom-0 inset-x-0 z-50 xl:hidden bg-background border-t border-border rounded-t-2xl shadow-2xl"
          >
            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-2" aria-hidden="true">
              <div className="w-10 h-1 rounded-full bg-muted-foreground/20" />
            </div>

            {/* Sheet content */}
            <div
              className="px-5 pb-6 space-y-5 overflow-y-auto max-h-[80svh] container mx-auto max-w-xl"
              style={{
                paddingBottom: "max(1.5rem, env(safe-area-inset-bottom))",
              }}
            >
              {/* Header */}
              <div className="flex items-center justify-between">
                <h2
                  id={`${dialogId}-title`}
                  className="text-base font-semibold text-foreground"
                >
                  Maze Settings
                </h2>
                <button
                  type="button"
                  onClick={() => setIsSheetOpen(false)}
                  className="p-2 rounded-lg hover:bg-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  aria-label="Close settings"
                >
                  <X className="size-4" aria-hidden="true" />
                </button>
              </div>

              {/* Status card — matches desktop exactly */}
              <div
                className={statusCardClass(solverStatus)}
                aria-live="polite"
                aria-atomic="true"
              >
                <Circle
                  className={cn("size-3 mt-0.5", statusDotClass(solverStatus))}
                  aria-hidden="true"
                />
                <div>
                  <p className={statusLabelClass(solverStatus)}>
                    {STATUS_LABEL[solverStatus]}
                  </p>
                  <p className="text-xs text-muted-foreground leading-snug mt-1">
                    {STATUS_DETAIL[solverStatus]}
                  </p>
                </div>
              </div>

              {/* Algorithm cards — same design as desktop sidebar */}
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-foreground">
                  Algorithm
                </h3>
                <div
                  className="flex flex-col gap-2"
                  role="group"
                  aria-label="Algorithm selection"
                >
                  {solvers.map((solver) => {
                    const isSelected = selectedSolver === solver;
                    return (
                      <button
                        key={solver.name}
                        type="button"
                        onClick={() => onSolverChange(solver)}
                        aria-pressed={isSelected}
                        className={algoCardClass(isSelected)}
                      >
                        <span
                          className={cn(
                            "text-sm font-semibold leading-none",
                            isSelected ? "text-primary" : "text-foreground",
                          )}
                        >
                          {solver.name}
                        </span>
                        <span className="text-xs text-muted-foreground leading-snug">
                          {solver.description}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Speed slider */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label
                    htmlFor="mobile-maze-speed"
                    className="text-sm font-semibold text-foreground"
                  >
                    Animation Speed
                  </label>
                  <span className="text-xs font-medium tabular-nums text-muted-foreground bg-muted px-2 py-0.5 rounded-md">
                    {speed} / 10
                  </span>
                </div>
                <Slider
                  id="mobile-maze-speed"
                  value={[speed]}
                  onValueChange={(vals) => onSpeedChange(vals[0] ?? speed)}
                  min={1}
                  max={10}
                  step={1}
                  aria-label="Animation speed"
                  className="py-1"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Slow</span>
                  <span>Fast</span>
                </div>
              </div>

              {/* Generate new maze */}
              <Button
                variant="outline"
                onClick={() => {
                  onRegenerate();
                  setIsSheetOpen(false);
                }}
                className="w-full gap-2 h-11 text-sm"
                aria-label="Generate a new maze"
              >
                <RefreshCw className="size-4 shrink-0" aria-hidden="true" />
                Generate New Maze
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Fixed bottom action bar */}
      <div
        className="fixed bottom-0 inset-x-0 z-30 xl:hidden"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="bg-background/95 backdrop-blur-md border-t border-border">
          <div className="flex items-center gap-4 px-4 py-3 max-w-lg mx-auto">
            {/* Algorithm pills — quick-switch without opening the sheet */}
            <ToggleGroup
              type="single"
              value={selectedSolver.name}
              onValueChange={(name) => {
                if (!name) return;
                const s = solvers.find((x) => x.name === name);
                if (s) onSolverChange(s);
              }}
              className="flex gap-1.5 flex-1 min-w-0"
              aria-label="Solving algorithm"
            >
              {solvers.map((solver) => (
                <ToggleGroupItem
                  key={solver.name}
                  value={solver.name}
                  variant="outline"
                  className={ALGO_PILL_CLASS}
                  aria-label={solver.name}
                >
                  {solver.name}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>

            {/* Primary action */}
            {isComplete ? (
              <Button
                variant="outline"
                size="sm"
                onClick={onReset}
                className={cn(
                  "gap-1.5 h-9 px-3 shrink-0 text-xs font-semibold",
                  solverStatus === "not-found" &&
                    "border-destructive/50 text-destructive hover:bg-destructive/10",
                )}
                aria-label="Reset the solver"
              >
                <RotateCcw className="size-3.5" aria-hidden="true" />
                Reset
              </Button>
            ) : isRunning ? (
              <Button
                size="sm"
                onClick={onPause}
                className="gap-1.5 h-9 px-3 shrink-0 text-xs font-semibold"
                aria-label="Pause solving"
              >
                <Pause className="size-3.5" aria-hidden="true" />
                Pause
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={onSolve}
                className="gap-1.5 h-9 px-3 shrink-0 text-xs font-semibold"
                aria-label={
                  solverStatus === "idle"
                    ? "Start solving the maze"
                    : "Resume solving"
                }
              >
                <Play className="size-3.5" aria-hidden="true" />
                {solverStatus === "idle" ? "Solve" : "Resume"}
              </Button>
            )}

            {/* Settings sheet trigger */}
            <button
              type="button"
              onClick={() => setIsSheetOpen(true)}
              className={cn(
                "size-9 rounded-xl border flex items-center justify-center transition-colors shrink-0",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                isSheetOpen
                  ? "bg-muted border-primary/35 text-primary"
                  : "bg-background border-border text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
              aria-label="Open maze settings"
              aria-expanded={isSheetOpen}
              aria-controls={`${dialogId}-sheet`}
            >
              <Settings className="size-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
