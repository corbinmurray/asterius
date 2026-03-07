import type { Grid, Position, SolverResult, SolverStep } from '../types';
import { positionKey } from '../utils';
import type { Solver } from './types';

const BATCH_SIZE = 4;

function getPassableNeighbors(grid: Grid, pos: Position): Position[] {
  const cell = grid[pos.row][pos.col];
  const neighbors: Position[] = [];

  if (!cell.walls.north && pos.row > 0)
    neighbors.push({ row: pos.row - 1, col: pos.col });
  if (!cell.walls.south && pos.row < grid.length - 1)
    neighbors.push({ row: pos.row + 1, col: pos.col });
  if (!cell.walls.west && pos.col > 0)
    neighbors.push({ row: pos.row, col: pos.col - 1 });
  if (!cell.walls.east && pos.col < grid[0].length - 1)
    neighbors.push({ row: pos.row, col: pos.col + 1 });

  return neighbors;
}

function reconstructPath(
  parent: Map<string, Position | null>,
  end: Position,
): Position[] {
  const path: Position[] = [];
  let current: Position | null = end;
  while (current !== null) {
    path.unshift(current);
    current = parent.get(positionKey(current)) ?? null;
  }
  return path;
}

export function runDfs(
  grid: Grid,
  start: Position,
  end: Position,
): SolverResult {
  const steps: SolverStep[] = [];
  const visited = new Set<string>();
  const parent = new Map<string, Position | null>();

  parent.set(positionKey(start), null);
  const stack: Position[] = [start];

  // Accumulate visit positions and flush as 'frontier' batches for smoother animation
  const visitBatch: Position[] = [];

  function flushBatch(): void {
    while (visitBatch.length >= BATCH_SIZE) {
      steps.push({ type: 'frontier', positions: visitBatch.splice(0, BATCH_SIZE) });
    }
  }

  function flushAll(): void {
    while (visitBatch.length > 0) {
      steps.push({ type: 'frontier', positions: visitBatch.splice(0, BATCH_SIZE) });
    }
  }

  while (stack.length > 0) {
    const current = stack.pop()!;
    const currentKey = positionKey(current);

    if (visited.has(currentKey)) continue;
    visited.add(currentKey);

    visitBatch.push(current);
    flushBatch();

    if (current.row === end.row && current.col === end.col) {
      flushAll();
      const path = reconstructPath(parent, end);
      steps.push({ type: 'path', positions: path });
      return { steps, pathLength: path.length };
    }

    for (const neighbor of getPassableNeighbors(grid, current)) {
      const neighborKey = positionKey(neighbor);
      if (!visited.has(neighborKey)) {
        // Only set parent if not already set (first discovery wins)
        if (!parent.has(neighborKey)) {
          parent.set(neighborKey, current);
        }
        stack.push(neighbor);
      }
    }
  }

  flushAll();
  steps.push({ type: 'no-path' });
  return { steps, pathLength: 0 };
}

export const dfsSolver: Solver = {
  name: 'DFS',
  description: 'Explores as deep as possible before backtracking — dramatic exploration, not optimal',
  solve: runDfs,
};
