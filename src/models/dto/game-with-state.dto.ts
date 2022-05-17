import { GameStateDto } from './game-state.dto';
import { GameDto } from './game.dto';

export interface GameWithStateDto extends GameDto {
  state: GameStateDto;
}
