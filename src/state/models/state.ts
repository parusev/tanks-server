import { Game } from '../../models/game';
import { GameConfig } from '../../models/game-config';

export interface State {
  gameConfig: GameConfig;
  games: Map<string, Game>;
  gameIdByUserId: Map<string, string>;
}
