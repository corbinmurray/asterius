export { astarSolver } from './astar';
export { bfsSolver } from './bfs';
export { dfsSolver } from './dfs';
export type { Solver } from './types';

import { astarSolver } from './astar';
import { bfsSolver } from './bfs';
import { dfsSolver } from './dfs';
import type { Solver } from './types';

export const SOLVERS: readonly Solver[] = [astarSolver, bfsSolver, dfsSolver];
