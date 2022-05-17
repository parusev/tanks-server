import { Bullet } from '../bullet';
import { GameStatus } from '../game-status';
import { Tank } from '../map-object/tank';
import { Wall } from '../map-object/wall';

export interface GameStateDto {
  status: GameStatus;
  width: number;
  height: number;
  walls: Wall[];
  tanksByUserId: Record<string, Tank>;
  bullets: Record<string, Bullet>;
  secondsLeft: number;
}
