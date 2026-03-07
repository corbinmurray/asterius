import { positionKey } from './utils';
import { MazeCell } from './MazeCell';
import type { Grid, Position } from './types';

interface MazeGridProps {
  grid: Grid;
  start: Position;
  end: Position;
  pathIndices: ReadonlyMap<string, number>;
}

export function MazeGrid({ grid, start, end, pathIndices }: MazeGridProps) {
  const rows = grid.length;
  const cols = grid[0]?.length ?? 0;

  return (
    <div
      role="grid"
      aria-label="Maze"
      className="w-full aspect-square"
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${cols}, 1fr)`,
        gridTemplateRows: `repeat(${rows}, 1fr)`,
        contain: 'layout style',
      }}
    >
      {grid.flat().map((cell) => {
        const { row: r, col: c } = cell.position;
        const isStart = r === start.row && c === start.col;
        const isEnd   = r === end.row   && c === end.col;
        const key = positionKey(cell.position);

        const displayCell = isStart
          ? { ...cell, state: 'start' as const }
          : isEnd
            ? { ...cell, state: 'end' as const }
            : cell;

        return (
          <MazeCell
            key={key}
            cell={displayCell}
            pathIndex={pathIndices.get(key)}
            pathLength={pathIndices.size}
          />
        );
      })}
    </div>
  );
}
