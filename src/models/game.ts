import { GameState } from './game-state';
import { User } from './user';

export interface Game {
  id: string;
  users: User[];
  created: number;
  state: GameState;
}
