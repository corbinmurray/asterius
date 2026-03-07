import type { Position } from './types';

export function positionKey(pos: Position): string {
  return `${pos.row},${pos.col}`;
}
