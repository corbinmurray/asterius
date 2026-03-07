import { useState, useEffect, useCallback } from 'react';
import { MazeGrid } from './MazeGrid';
import { MazeControls } from './MazeControls';
import { MobileControlsBar } from './MobileControlsBar';
import { useMazeGenerator } from './hooks/useMazeGenerator';
import { useAnimationEngine } from './hooks/useAnimationEngine';
import { astarSolver } from './solvers/astar';
import { SOLVERS } from './solvers';
import type { Solver } from './solvers/types';

const STATUS_ANNOUNCEMENT: Record<string, string> = {
  idle:        '',
  running:     'Solving maze…',
  found:       'Path found',
  'not-found': 'No path found — this maze has no solution',
};

export function Maze() {
  const [speed, setSpeed] = useState(5);
  const [selectedSolver, setSelectedSolver] = useState<Solver>(astarSolver);
  const { mazeData, regenerate } = useMazeGenerator();
  const {
    displayGrid,
    pathIndices,
    isRunning,
    solverStatus,
    startAnimation,
    pauseAnimation,
    resetAnimation,
  } = useAnimationEngine(mazeData, speed, selectedSolver);

  const handleRegenerate = useCallback(() => {
    resetAnimation();
    regenerate();
  }, [resetAnimation, regenerate]);

  // Space key toggles solve/pause when focus is not on an interactive element
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isInteractive =
        target.tagName === 'BUTTON' ||
        target.tagName === 'INPUT' ||
        target.role === 'slider';
      if (e.code === 'Space' && !isInteractive) {
        e.preventDefault();
        if (isRunning) {
          pauseAnimation();
        } else if (solverStatus !== 'found' && solverStatus !== 'not-found') {
          startAnimation();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isRunning, solverStatus, startAnimation, pauseAnimation]);

  const controlsProps = {
    speed,
    onSpeedChange: setSpeed,
    onRegenerate: handleRegenerate,
    onSolve: startAnimation,
    onPause: pauseAnimation,
    onReset: resetAnimation,
    isRunning,
    solverStatus,
    solvers: SOLVERS,
    selectedSolver,
    onSolverChange: setSelectedSolver,
  };

  return (
    // pb-20 on mobile clears the fixed bottom action bar; desktop resets to 0
    <div className="flex flex-col gap-6 w-full h-full pb-20 xl:pb-0">
      {/* Screen-reader live region announces solver progress */}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {STATUS_ANNOUNCEMENT[solverStatus]}
      </div>

      {/* Two-column on xl+: maze fills left, controls sit beside it */}
      <div className="flex flex-col xl:flex-row gap-6 xl:gap-10 items-stretch w-full">
        {/* Grid is capped so the square never overflows the viewport.
            100svh (small = chrome always visible) minus header (4rem/64px) minus bottom bar (4rem/64px) plus a small buffer.
            On xl the sidebar constrains size naturally so we reset to full width. */}
        <div className="w-[min(100%,calc(100svh-9rem))] mx-auto xl:mx-0 xl:w-full xl:flex-1 xl:max-w-2xl">
          <MazeGrid
            grid={displayGrid}
            start={mazeData.start}
            end={mazeData.end}
            pathIndices={pathIndices}
          />
        </div>

        {/* Desktop-only sidebar — hidden on mobile; MobileControlsBar handles mobile UX */}
        <div className="hidden xl:flex xl:w-80 xl:shrink-0 xl:flex-col">
          <MazeControls {...controlsProps} />
        </div>
      </div>

      {/* Mobile-only: fixed bottom bar + settings bottom sheet */}
      <MobileControlsBar {...controlsProps} />
    </div>
  );
}
