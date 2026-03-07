import type { Grid, Position, SolverResult } from '../types';

export interface Solver {
  readonly name: string;
  readonly description: string;
  solve(grid: Grid, start: Position, end: Position): SolverResult;
}
