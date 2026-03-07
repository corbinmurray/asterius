import { cn } from "@/lib/utils";
import { Button, Slider } from "@corbinmurray/ui-components";
import { Circle, Pause, Play, RefreshCw, RotateCcw } from "lucide-react";
import type { SolverStatus } from "./hooks/useAnimationEngine";
import type { Solver } from "./solvers/types";
import {
  STATUS_DETAIL,
  STATUS_LABEL,
  algoCardClass,
  statusCardClass,
  statusDotClass,
  statusLabelClass,
} from "./controlsConfig";

interface MazeControlsProps {
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

export function MazeControls({
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
}: MazeControlsProps) {
  const isComplete = solverStatus === "found" || solverStatus === "not-found";

  return (
    <div className="flex flex-col gap-6 flex-1">
      {/* Status panel */}
      <div className={statusCardClass(solverStatus)} aria-hidden="true">
        <Circle
          className={cn("w-3 h-3", statusDotClass(solverStatus))}
          aria-hidden="true"
        />
        <div>
          <p className={statusLabelClass(solverStatus)}>{STATUS_LABEL[solverStatus]}</p>
          <p className="text-xs text-muted-foreground leading-snug mt-1">
            {STATUS_DETAIL[solverStatus]}
          </p>
        </div>
      </div>

      {/* Algorithm cards */}
      <div className="flex flex-col gap-2">
        <span id="algo-label" className="text-sm font-semibold text-foreground">
          Algorithm
        </span>
        <div className="flex flex-col gap-2" role="group" aria-labelledby="algo-label">
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
      <div className="flex flex-col gap-3">
        <div className="flex justify-between items-center">
          <label htmlFor="maze-speed" className="text-sm font-semibold text-foreground">
            Speed
          </label>
          <span className="text-xs font-medium tabular-nums text-muted-foreground bg-muted px-2 py-0.5 rounded-md">
            {speed} / 10
          </span>
        </div>
        <Slider
          id="maze-speed"
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

      {/* Action buttons */}
      <div className="flex flex-col gap-3 mt-auto">
        <Button
          variant="outline"
          onClick={onRegenerate}
          className="w-full gap-2 h-11 text-sm"
          aria-label="Generate a new maze"
        >
          <RefreshCw className="w-4 h-4 shrink-0" aria-hidden="true" />
          Generate New Maze
        </Button>

        {isComplete ? (
          <Button
            variant="outline"
            onClick={onReset}
            className={cn(
              "w-full gap-2 h-11 text-sm",
              solverStatus === "not-found" &&
                "border-destructive/50 text-destructive hover:bg-destructive/10",
            )}
            aria-label="Reset the solver"
          >
            <RotateCcw className="w-4 h-4 shrink-0" aria-hidden="true" />
            Reset Solver
          </Button>
        ) : isRunning ? (
          <Button
            onClick={onPause}
            className="w-full gap-2 h-11 text-sm"
            aria-label="Pause solving"
          >
            <Pause className="w-4 h-4 shrink-0" aria-hidden="true" />
            Pause
          </Button>
        ) : (
          <Button
            onClick={onSolve}
            className="w-full gap-2 h-11 text-sm"
            aria-label={solverStatus === "idle" ? "Start solving the maze" : "Resume solving"}
          >
            <Play className="w-4 h-4 shrink-0" aria-hidden="true" />
            {solverStatus === "idle" ? "Solve Maze" : "Resume"}
          </Button>
        )}
      </div>
    </div>
  );
}