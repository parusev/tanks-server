import { Bullet } from './bullet';
import { GameStatus } from './game-status';
import { Level } from './level';
import { Tank } from './map-object/tank';

export interface GameState {
  status: GameStatus;
  level: Level;
  tanksByUserId: Map<string, Tank>;
  bullets: Map<string, Bullet>;
}
