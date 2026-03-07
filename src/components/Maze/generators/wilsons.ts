import type { Cell, Grid, MazeConfig, Position } from '../types';
import { positionKey } from '../utils';

function initializeGrid(rows: number, cols: number): Grid {
  return Array.from({ length: rows }, (_, row) =>
    Array.from({ length: cols }, (_, col): Cell => ({
      position: { row, col },
      walls: { north: true, south: true, east: true, west: true },
      state: 'unvisited',
    }))
  );
}

function getNeighbors(pos: Position, rows: number, cols: number): Position[] {
  const neighbors: Position[] = [];
  if (pos.row > 0)        neighbors.push({ row: pos.row - 1, col: pos.col });
  if (pos.row < rows - 1) neighbors.push({ row: pos.row + 1, col: pos.col });
  if (pos.col > 0)        neighbors.push({ row: pos.row, col: pos.col - 1 });
  if (pos.col < cols - 1) neighbors.push({ row: pos.row, col: pos.col + 1 });
  return neighbors;
}

function carvePassage(grid: Grid, from: Position, to: Position): void {
  const dr = to.row - from.row;
  const dc = to.col - from.col;
  const fromWalls = grid[from.row][from.col].walls;
  const toWalls   = grid[to.row][to.col].walls;

  if      (dr === -1) { fromWalls.north = false; toWalls.south = false; }
  else if (dr ===  1) { fromWalls.south = false; toWalls.north = false; }
  else if (dc ===  1) { fromWalls.east  = false; toWalls.west  = false; }
  else if (dc === -1) { fromWalls.west  = false; toWalls.east  = false; }
}

/**
 * Generates a perfect maze using Wilson's Algorithm (loop-erased random walk).
 * Produces a uniform spanning tree — every possible maze is equally likely,
 * and every generated maze is guaranteed to be fully solvable.
 */
export function generateMaze(config: MazeConfig): Grid {
  const { rows, cols } = config;
  const grid = initializeGrid(rows, cols);
  const inMaze = new Set<string>();

  // Seed the maze with one random cell
  const seedRow = Math.floor(Math.random() * rows);
  const seedCol = Math.floor(Math.random() * cols);
  inMaze.add(positionKey({ row: seedRow, col: seedCol }));

  while (inMaze.size < rows * cols) {
    // Pick a random cell not yet in the maze
    let startRow: number;
    let startCol: number;
    do {
      startRow = Math.floor(Math.random() * rows);
      startCol = Math.floor(Math.random() * cols);
    } while (inMaze.has(positionKey({ row: startRow, col: startCol })));

    // Perform a loop-erased random walk until we connect to the maze
    let current: Position = { row: startRow, col: startCol };
    const walk: Position[] = [current];
    const walkIndex = new Map<string, number>();
    walkIndex.set(positionKey(current), 0);

    while (!inMaze.has(positionKey(current))) {
      const neighbors = getNeighbors(current, rows, cols);
      const next = neighbors[Math.floor(Math.random() * neighbors.length)];
      const nextKey = positionKey(next);

      if (inMaze.has(nextKey)) {
        // Reached the maze — append and let the while condition exit
        walk.push(next);
        current = next;
      } else if (walkIndex.has(nextKey)) {
        // Loop detected — erase back to where we first visited next
        const loopIdx = walkIndex.get(nextKey)!;
        const removed = walk.splice(loopIdx + 1);
        removed.forEach(p => walkIndex.delete(positionKey(p)));
        current = next; // next === walk[loopIdx] === walk[walk.length - 1]
      } else {
        // Fresh cell — extend the walk
        walk.push(next);
        walkIndex.set(nextKey, walk.length - 1);
        current = next;
      }
    }

    // Carve passages along the completed walk and add cells to the maze
    for (let i = 0; i < walk.length - 1; i++) {
      carvePassage(grid, walk[i], walk[i + 1]);
      inMaze.add(positionKey(walk[i]));
    }
    // walk[walk.length - 1] is already in inMaze
  }

  return grid;
}
