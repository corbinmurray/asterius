import type { Grid, Position, SolverResult, SolverStep } from '../types';
import { positionKey } from '../utils';
import type { Solver } from './types';

function heuristic(a: Position, b: Position): number {
  return Math.abs(a.row - b.row) + Math.abs(a.col - b.col);
}

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

/**
 * Runs A* pathfinding on a generated maze grid.
 * Returns a full replay log of SolverSteps so the animation engine
 * can visualise the algorithm working step-by-step.
 */
export function runAstar(
  grid: Grid,
  start: Position,
  end: Position,
): SolverResult {
  const rows = grid.length;
  const cols = grid[0].length;
  const steps: SolverStep[] = [];

  // g[row][col] = best known cost from start
  const g: number[][] = Array.from({ length: rows }, () =>
    Array<number>(cols).fill(Infinity),
  );
  g[start.row][start.col] = 0;

  const openSet: Array<{ pos: Position; f: number }> = [
    { pos: start, f: heuristic(start, end) },
  ];
  const openSetKeys = new Set<string>([positionKey(start)]);
  const closedSet = new Set<string>();

  const parent = new Map<string, Position | null>();
  parent.set(positionKey(start), null);

  while (openSet.length > 0) {
    // Pop lowest-f cell (sort is O(n log n) — acceptable for ≤41×41 grids)
    openSet.sort((a, b) => a.f - b.f);
    const { pos: current } = openSet.shift()!;
    const currentKey = positionKey(current);

    if (closedSet.has(currentKey)) continue;
    closedSet.add(currentKey);
    openSetKeys.delete(currentKey);

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
      if (closedSet.has(neighborKey)) continue;

      const tentativeG = g[current.row][current.col] + 1;

      if (tentativeG < g[neighbor.row][neighbor.col]) {
        g[neighbor.row][neighbor.col] = tentativeG;
        parent.set(neighborKey, current);
        const f = tentativeG + heuristic(neighbor, end);

        if (!openSetKeys.has(neighborKey)) {
          openSet.push({ pos: neighbor, f });
          openSetKeys.add(neighborKey);
          frontierAdditions.push(neighbor);
        } else {
          // Update priority for an already-queued cell
          const existing = openSet.find(o => positionKey(o.pos) === neighborKey);
          if (existing) existing.f = f;
        }
      }
    }

    if (frontierAdditions.length > 0) {
      steps.push({ type: 'frontier', positions: frontierAdditions });
    }
  }

  steps.push({ type: 'no-path' });
  return { steps, pathLength: 0 };
}

export const astarSolver: Solver = {
  name: 'A*',
  description: 'Finds the shortest path using Manhattan distance as heuristic',
  solve: runAstar,
};
