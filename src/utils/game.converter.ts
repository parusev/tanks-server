import { GameStateDto } from '../models/dto/game-state.dto';
import { GameWithStateDto } from '../models/dto/game-with-state.dto';
import { Game } from '../models/game';
import { GameState } from '../models/game-state';
import { Landscape } from '../models/landscape/landscape';
import { Level } from '../models/level';
import { LevelConfig } from '../models/level-config';
import { Tank } from '../models/map-object/tank';
import { TankConfig } from '../models/tank-config';
import { FieldUtils } from './field.utils';

export class GameConverter {
  constructor(private readonly fieldUtils: FieldUtils) {}

  public convertLevelConfigToLevel(level: LevelConfig): Level {
    const { width, height, walls, tanks } = level;

    const landscape: Landscape = new Map(
      walls.map((wall) => [this.fieldUtils.createLandscapeKey(wall), wall])
    );

    return {
      width,
      height,
      landscape,
      startTanks: tanks.map((tank) => this.convertTankConfigToTank(tank)),
    };
  }

  public convertGameToGameWithStateDto(game: Game): GameWithStateDto {
    const { id, state } = game;
    return {
      id,
      state: this.convertGameStateToGameStateDto(state),
    };
  }

  private convertGameStateToGameStateDto(gameState: GameState): GameStateDto {
    const {
      status,
      level: { width, height, landscape },
      tanksByUserId,
      bullets,
    } = gameState;

    return {
      status,
      width,
      height,
      walls: [...landscape.values()],
      tanksByUserId: Object.fromEntries(tanksByUserId),
      bullets: Object.fromEntries(bullets),
      secondsLeft: 0,
    };
  }

  private convertTankConfigToTank(tankConfig: TankConfig): Tank {
    return {
      ...tankConfig,
      userId: null,
      isMoving: false,
    };
  }
}
