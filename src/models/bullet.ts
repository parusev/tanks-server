import { Coordinates } from './coordinates';
import { Direction } from './direction';

export interface Bullet extends Coordinates {
  id: string;
  userId: string;
  direction: Direction;
}
