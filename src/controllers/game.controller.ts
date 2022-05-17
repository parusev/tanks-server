import { Action } from '../actions/action';
import { CountdownGameStartCommand } from '../commands/countdown-game-start.command';
import { CreateGameCommand } from '../commands/create-game.command';
import { DeleteGameCommand } from '../commands/delete-game.command';
import { EndGameCommand } from '../commands/end-game.command';
import { JoinGameCommand } from '../commands/join-game.command';
import { StartGameCommand } from '../commands/start-game.command';
import { Bullet } from '../models/bullet';
import { Direction } from '../models/direction';
import { LevelConfig } from '../models/level-config';
import { MapObject } from '../models/map-object/map-object';
import { isTank } from '../models/map-object/tank';
import { User } from '../models/user';
import { State } from '../state/models/state';
import { Store } from '../store/models/store';
import { FieldUtils } from '../utils/field.utils';
import { GameConverter } from '../utils/game.converter';
import { IdUtils } from '../utils/id.utils';
import { LevelConfigUtils } from '../utils/level-config/level-config.utils';
import { BulletController } from './bullet.controller';
import { TankController } from './tank.controller';

export class GameController {
  private gameplayControllers: Map<string, GameplayControllers> = new Map();

  private gameStartTimeoutIdByGameId: Map<string, NodeJS.Timer> = new Map();

  public constructor(
    private readonly fieldUtils: FieldUtils,
    private readonly gameConverter: GameConverter,
    private readonly idUtils: IdUtils,
    private readonly levelConfigUtils: LevelConfigUtils,
    private readonly store: Store<State, Action>
  ) {
    this.handleBulletDelete = this.handleBulletDelete.bind(this);
  }

  private startGame(gameId: string) {
    new StartGameCommand(gameId, this.store).execute();
  }

  public createGame(levelConfig: LevelConfig, user: User) {
    const { id: userId } = user;

    const gameId = this.idUtils.generateId();

    new CreateGameCommand(
      this.gameConverter,
      gameId,
      levelConfig,
      this.store,
      user
    ).execute();

    const gameplayControllers = new Map(this.gameplayControllers);

    gameplayControllers.set(gameId, {
      bulletControllersByBulletId: new Map(),
      tankControllersByUserId: new Map(),
    });

    this.gameplayControllers = gameplayControllers;

    const tankController = new TankController(
      this.fieldUtils,
      gameId,
      this.store,
      userId
    );

    this.addTankController(tankController);
  }

  public joinGame(gameId: string, user: User): void {
    const { id: userId } = user;

    new JoinGameCommand(gameId, this.store, user).execute();

    const tankController = new TankController(
      this.fieldUtils,
      gameId,
      this.store,
      userId
    );

    this.addTankController(tankController);

    this.gameCountdown(gameId, 3);
  }

  private gameCountdown(gameId: string, secondsLeft: number) {
    const timeoutId = setTimeout(() => {
      if (secondsLeft > 0) {
        new CountdownGameStartCommand(
          gameId,
          secondsLeft,
          this.store
        ).execute();

        this.gameCountdown(gameId, secondsLeft - 1);
      } else {
        this.startGame(gameId);
      }
    }, 1000);

    this.gameStartTimeoutIdByGameId.set(gameId, timeoutId);
  }

  private deleteGame(gameId: string, winnerId?: string): void {
    const timeoutId = this.gameStartTimeoutIdByGameId.get(gameId);
    if (timeoutId) {
      clearTimeout(timeoutId);
      this.gameStartTimeoutIdByGameId.delete(gameId);
    }

    const gameControllers = this.gameplayControllers.get(gameId);

    gameControllers.bulletControllersByBulletId.forEach((bulletController) => {
      bulletController.onDestroy();
    });

    gameControllers.tankControllersByUserId.forEach((tankController) => {
      tankController.onDestroy();
    });

    const gameplayControllers = new Map(this.gameplayControllers);
    gameplayControllers.delete(gameId);

    this.gameplayControllers = gameplayControllers;

    if (winnerId) {
      new EndGameCommand(gameId, this.store, winnerId).execute();
    } else {
      new DeleteGameCommand(gameId, this.store).execute();
    }
  }

  public deleteGameByUserId(userId: string): void {
    const { getState } = this.store;

    const { gameIdByUserId } = getState();

    const gameId = gameIdByUserId.get(userId);

    if (gameId) {
      return this.deleteGame(gameId);
    }
  }

  public getLevelConfig(): LevelConfig {
    return this.levelConfigUtils.generateLevelConfig();
  }

  // #region Tanks

  public startMoveTank(
    gameId: string,
    userId: string,
    direction: Direction
  ): void {
    this.getTankController(gameId, userId).startMove(direction);
  }

  public stopTank(gameId: string, userId: string): void {
    this.getTankController(gameId, userId).stop();
  }

  private getTankController(gameId: string, userId: string): TankController {
    return this.gameplayControllers
      .get(gameId)
      .tankControllersByUserId.get(userId);
  }

  private addTankController(tankController: TankController): void {
    const { gameId, userId } = tankController;

    const gameplayControllers = new Map(this.gameplayControllers);

    const gameControllers = gameplayControllers.get(gameId);

    const tankControllersByUserId = new Map(
      gameControllers.tankControllersByUserId
    );

    tankControllersByUserId.set(userId, tankController);

    gameplayControllers.set(gameId, {
      ...gameControllers,
      tankControllersByUserId,
    });

    this.gameplayControllers = gameplayControllers;
  }

  // #endregion

  // #region Bullets

  public shoot(gameId: string, userId: string): void {
    const { getState } = this.store;

    const { games } = getState();

    const {
      state: { tanksByUserId },
    } = games.get(gameId);

    const { x, y, shotDirection } = tanksByUserId.get(userId);

    const bullet: Bullet = {
      id: this.idUtils.generateId(),
      userId,
      x,
      y,
      direction: shotDirection,
    };

    const bulletController = new BulletController(
      bullet,
      this.fieldUtils,
      gameId,
      this.handleBulletDelete,
      this.store
    );

    this.addBulletController(bulletController);

    bulletController.shoot();
  }

  private addBulletController(bulletController: BulletController): void {
    const {
      gameId,
      bullet: { id: bulletId },
    } = bulletController;

    const gameplayControllers = new Map(this.gameplayControllers);

    const gameControllers = gameplayControllers.get(gameId);

    const bulletControllersByBulletId = new Map(
      gameControllers.bulletControllersByBulletId
    );

    bulletControllersByBulletId.set(bulletId, bulletController);

    gameplayControllers.set(gameId, {
      ...gameControllers,
      bulletControllersByBulletId,
    });

    this.gameplayControllers = gameplayControllers;
  }

  private handleBulletDelete(
    gameId: string,
    userId: string,
    bulletId: string,
    target?: MapObject
  ): void {
    this.deleteDestroyedBulletController(gameId, bulletId);

    if (isTank(target)) {
      this.deleteGame(gameId, userId);
    }
  }

  private deleteDestroyedBulletController(
    gameId: string,
    bulletId: string
  ): void {
    const gameplayControllers = new Map(this.gameplayControllers);

    const gameControllers = gameplayControllers.get(gameId);

    const bulletControllersByBulletId = new Map(
      gameControllers.bulletControllersByBulletId
    );

    bulletControllersByBulletId.delete(bulletId);

    gameplayControllers.set(gameId, {
      ...gameControllers,
      bulletControllersByBulletId,
    });

    this.gameplayControllers = gameplayControllers;
  }

  // #endregion
}

interface GameplayControllers {
  bulletControllersByBulletId: Map<string, BulletController>;
  tankControllersByUserId: Map<string, TankController>;
}
