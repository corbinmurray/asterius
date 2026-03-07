import { useState, useCallback } from 'react';
import { generateMaze } from '../generators/wilsons';
import { runAstar } from '../solvers/astar';
import { positionKey } from '../utils';
import { DEFAULT_MAZE_CONFIG } from '../types';
import type { MazeConfig, MazeData, Position } from '../types';

function randomPosition(rows: number, cols: number): Position {
  return {
    row: Math.floor(Math.random() * rows),
    col: Math.floor(Math.random() * cols),
  };
}

function createMazeData(config: MazeConfig): MazeData {
  const { rows, cols } = config;
  const minPathLength = Math.floor((rows + cols) / 2);

  for (let attempt = 0; attempt < 50; attempt++) {
    const grid = generateMaze(config);

    for (let posAttempt = 0; posAttempt < 30; posAttempt++) {
      const start = randomPosition(rows, cols);
      const end   = randomPosition(rows, cols);

      if (positionKey(start) === positionKey(end)) continue;

      const { pathLength } = runAstar(grid, start, end);
      if (pathLength >= minPathLength) {
        return { grid, start, end };
      }
    }
  }

  // Fallback: opposite corners are reliably far apart in Wilson's mazes
  const grid = generateMaze(config);
  return {
    grid,
    start: { row: 0, col: 0 },
    end:   { row: rows - 1, col: cols - 1 },
  };
}

interface UseMazeGeneratorResult {
  mazeData: MazeData;
  regenerate: () => void;
}

export function useMazeGenerator(
  rows: number = DEFAULT_MAZE_CONFIG.rows,
  cols: number = DEFAULT_MAZE_CONFIG.cols,
): UseMazeGeneratorResult {
  const [mazeData, setMazeData] = useState<MazeData>(() =>
    createMazeData({ rows, cols }),
  );

  const regenerate = useCallback(() => {
    setMazeData(createMazeData({ rows, cols }));
  }, [rows, cols]);

  return { mazeData, regenerate };
}
