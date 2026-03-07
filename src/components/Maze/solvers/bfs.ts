import type { Grid, Position, SolverResult, SolverStep } from '../types';
import { positionKey } from '../utils';
import type { Solver } from './types';

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

export function runBfs(
  grid: Grid,
  start: Position,
  end: Position,
): SolverResult {
  const steps: SolverStep[] = [];
  const visited = new Set<string>();
  const parent = new Map<string, Position | null>();

  const startKey = positionKey(start);
  visited.add(startKey);
  parent.set(startKey, null);

  // Use an index pointer for O(1) dequeue performance
  const queue: Position[] = [start];
  let head = 0;

  while (head < queue.length) {
    const current = queue[head++];

    steps.push({ type: 'visit', position: current });

    if (current.row === end.row && current.col === end.col) {
      const path = reconstructPath(parent, end);
      steps.push({ type: 'path', positions: path });
      return { steps, pathLength: path.length };
    }

    const neighbors = getPassableNeighbors(grid, current);
    const frontierAdditions: Position[] = [];

    for (const neighbor of neighbors) {
      const neighborKey = positionKey(neighbor);
      if (!visited.has(neighborKey)) {
        visited.add(neighborKey);
        parent.set(neighborKey, current);
        queue.push(neighbor);
        frontierAdditions.push(neighbor);
      }
    }

    if (frontierAdditions.length > 0) {
      steps.push({ type: 'frontier', positions: frontierAdditions });
    }
  }

  steps.push({ type: 'no-path' });
  return { steps, pathLength: 0 };
}

export const bfsSolver: Solver = {
  name: 'BFS',
  description: 'Explores all neighbors level-by-level — guarantees the shortest path',
  solve: runBfs,
};
