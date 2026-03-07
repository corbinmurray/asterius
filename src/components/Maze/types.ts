export type Direction = 'north' | 'south' | 'east' | 'west';

export interface Walls {
  north: boolean;
  south: boolean;
  east: boolean;
  west: boolean;
}

export interface Position {
  row: number;
  col: number;
}

export type CellState = 'unvisited' | 'visited' | 'frontier' | 'path' | 'start' | 'end';

export interface Cell {
  position: Position;
  walls: Walls;
  state: CellState;
}

export type Grid = Cell[][];

export interface MazeConfig {
  rows: number;
  cols: number;
}

export interface MazeData {
  grid: Grid;
  start: Position;
  end: Position;
}

export type SolverStep =
  | { type: 'visit'; position: Position }
  | { type: 'frontier'; positions: Position[] }
  | { type: 'path'; positions: Position[] }
  | { type: 'no-path' };

export interface SolverResult {
  steps: SolverStep[];
  pathLength: number;
}

export const DEFAULT_MAZE_CONFIG: MazeConfig = {
  rows: 21,
  cols: 21,
};
