import { useState, useEffect, useMemo, useCallback } from 'react';
import { positionKey } from '../utils';
import type { CellState, Grid, MazeData, SolverStep } from '../types';
import type { Solver } from '../solvers/types';

export type SolverStatus = 'idle' | 'running' | 'found' | 'not-found';

function speedToInterval(speed: number): number {
  // speed 1 → ~500 ms, speed 5 → ~45 ms, speed 10 → 16 ms (one per frame)
  return Math.max(16, Math.round(500 / Math.pow(speed, 1.5)));
}

/**
 * Mutates `map` in-place for a single solver step.
 * Callers must pass a freshly-copied Map so the previous state is never mutated.
 */
function applyStepMut(
  map: Map<string, CellState>,
  step: SolverStep,
  startKey: string,
  endKey: string,
): void {
  switch (step.type) {
    case 'visit': {
      const key = positionKey(step.position);
      if (key !== startKey && key !== endKey) map.set(key, 'visited');
      break;
    }
    case 'frontier': {
      for (const p of step.positions) {
        const key = positionKey(p);
        if (key !== startKey && key !== endKey && !map.has(key)) {
          map.set(key, 'frontier');
        }
      }
      break;
    }
    case 'path': {
      // Demote any remaining frontier cells so the explored area stays visible
      map.forEach((state, key) => {
        if (state === 'frontier') map.set(key, 'visited');
      });
      for (const p of step.positions) {
        const key = positionKey(p);
        if (key !== startKey && key !== endKey) map.set(key, 'path');
      }
      break;
    }
    case 'no-path':
      break;
  }
}

interface AnimState {
  /** Used to detect maze/solver changes without extra refs. */
  mazeData: MazeData;
  solver: Solver;
  stepIndex: number;
  isRunning: boolean;
  cellStates: Map<string, CellState>;
  pathIndices: Map<string, number>;
  solverStatus: SolverStatus;
}

function makeState(mazeData: MazeData, solver: Solver): AnimState {
  return {
    mazeData,
    solver,
    stepIndex: 0,
    isRunning: false,
    cellStates: new Map(),
    pathIndices: new Map(),
    solverStatus: 'idle',
  };
}

export interface UseAnimationEngineResult {
  displayGrid: Grid;
  pathIndices: ReadonlyMap<string, number>;
  isRunning: boolean;
  solverStatus: SolverStatus;
  startAnimation: () => void;
  pauseAnimation: () => void;
  resetAnimation: () => void;
}

export function useAnimationEngine(
  mazeData: MazeData,
  speed: number,
  solver: Solver,
): UseAnimationEngineResult {
  const [anim, setAnim] = useState<AnimState>(() => makeState(mazeData, solver));

  // Render-phase state adjustment on prop change (no extra effect needed).
  // https://react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes
  if (anim.mazeData !== mazeData || anim.solver !== solver) {
    setAnim(makeState(mazeData, solver));
  }

  const { steps } = useMemo(
    () => solver.solve(mazeData.grid, mazeData.start, mazeData.end),
    [mazeData, solver],
  );

  const intervalMs = useMemo(() => speedToInterval(speed), [speed]);

  const { isRunning } = anim;

  useEffect(() => {
    if (!isRunning) return;

    const startKey = positionKey(mazeData.start);
    const endKey   = positionKey(mazeData.end);

    let rafId: number;
    let lastTime: number | null = null;
    let timeDebt = 0;
    let alive = true;

    const tick = (now: number) => {
      if (!alive) return;

      if (lastTime !== null) {
        // Cap the delta to 500 ms so pausing the tab doesn't cause a burst of steps
        timeDebt += Math.min(now - lastTime, 500);
      }
      lastTime = now;

      // How many steps are due this frame? At high speed several may accumulate.
      // Cap at 8 to keep frames smooth even if the tab was briefly backgrounded.
      const batchSize = Math.min(Math.max(0, Math.floor(timeDebt / intervalMs)), 8);

      if (batchSize === 0) {
        rafId = requestAnimationFrame(tick);
        return;
      }

      timeDebt -= batchSize * intervalMs;

      // done is set synchronously inside the setState updater (updaters always
      // run synchronously before setState returns in non-concurrent batches).
      let done = false;

      setAnim(prev => {
        if (!prev.isRunning || prev.stepIndex >= steps.length) {
          done = true;
          return prev;
        }

        // Clone once per batch, then mutate for each step in the batch.
        const newCellStates = new Map(prev.cellStates);
        let stepIndex    = prev.stepIndex;
        let pathIndices  = prev.pathIndices;
        let solverStatus = prev.solverStatus as SolverStatus;
        let stillRunning = true;

        for (let i = 0; i < batchSize; i++) {
          if (stepIndex >= steps.length) { done = true; break; }

          const step = steps[stepIndex];

          if (step.type === 'path') {
            applyStepMut(newCellStates, step, startKey, endKey);
            const indices = new Map<string, number>();
            step.positions.forEach((p, idx) => indices.set(positionKey(p), idx));
            pathIndices  = indices;
            solverStatus = 'found';
            stillRunning = false;
            done         = true;
            stepIndex++;
            break;
          } else if (step.type === 'no-path') {
            solverStatus = 'not-found';
            stillRunning = false;
            done         = true;
            stepIndex++;
            break;
          } else {
            applyStepMut(newCellStates, step, startKey, endKey);
            solverStatus = 'running';
            stepIndex++;
          }
        }

        return {
          ...prev,
          cellStates: newCellStates,
          stepIndex,
          pathIndices,
          solverStatus,
          isRunning: stillRunning,
        };
      });

      if (done) {
        alive = false;
      } else {
        rafId = requestAnimationFrame(tick);
      }
    };

    rafId = requestAnimationFrame(tick);
    return () => {
      alive = false;
      cancelAnimationFrame(rafId);
    };
    // stepIndex intentionally omitted — the RAF loop tracks progress via
    // the functional setAnim updater and stops when done/paused.
  }, [isRunning, steps, intervalMs, mazeData.start, mazeData.end]);

  const displayGrid = useMemo<Grid>(
    () =>
      mazeData.grid.map(row =>
        row.map(cell => {
          const state = anim.cellStates.get(positionKey(cell.position)) ?? 'unvisited';
          // Reuse the original cell reference when state is unchanged to give
          // React.memo a stable reference and skip unnecessary comparisons.
          return state === cell.state ? cell : { ...cell, state };
        }),
      ),
    [mazeData.grid, anim.cellStates],
  );

  const startAnimation = useCallback(() => {
    setAnim(prev => {
      if (prev.solverStatus === 'found' || prev.solverStatus === 'not-found') return prev;
      return { ...prev, isRunning: true };
    });
  }, []);

  const pauseAnimation = useCallback(() => {
    setAnim(prev => ({ ...prev, isRunning: false }));
  }, []);

  const resetAnimation = useCallback(() => {
    setAnim(prev => makeState(prev.mazeData, prev.solver));
  }, []);

  return {
    displayGrid,
    pathIndices: anim.pathIndices,
    isRunning:   anim.isRunning,
    solverStatus: anim.solverStatus,
    startAnimation,
    pauseAnimation,
    resetAnimation,
  };
}
