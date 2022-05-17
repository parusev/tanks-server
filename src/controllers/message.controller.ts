import { Action } from '../actions/action';
import { GameActionTypes } from '../actions/game-action';
import { GameplayActionTypes } from '../actions/gameplay-action';
import { Game } from '../models/game';
import { GameConfig } from '../models/game-config';
import { GameStatuses } from '../models/game-status';
import { InMessage, InMessageTypes } from '../models/message/in-message';
import { OutMessage, OutMessageTypes } from '../models/message/out-message';
import { OnDestroy } from '../models/on-destroy';
import { User } from '../models/user';
import { State } from '../state/models/state';
import { Store } from '../store/models/store';
import { GameConverter } from '../utils/game.converter';
import { GameController } from './game.controller';
import { WebSocketController } from './websocket.controller';

export class MessageController implements OnDestroy {
  private unsubscribe: () => void;

  constructor(
    private readonly gameConfig: GameConfig,
    private readonly gameController: GameController,
    private readonly gameConverter: GameConverter,
    private readonly store: Store<State, Action>,
    private readonly webSocketController: WebSocketController
  ) {}

  public onDestroy() {
    this.unsubscribe();
  }

  public startListening() {
    this.webSocketController.getOnConnectMessage = () =>
      this.getOnConnectMessage();

    this.webSocketController.onMessage = (message, user) =>
      this.inMessageListener(message, user);

    this.webSocketController.onDisconnect = (userId: string) => {
      this.gameController.deleteGameByUserId(userId);
    };

    this.unsubscribe = this.store.subscribe((action: Action) =>
      this.actionListener(action)
    );
  }

  private getOnConnectMessage(): OutMessage {
    const { getState } = this.store;

    const { games: allGames } = getState();

    const games: Game[] = [];

    allGames.forEach((game) => {
      const {
        state: { status },
      } = game;

      if (status !== GameStatuses.Created) {
        return;
      }

      games.push(game);
    });

    return {
      type: OutMessageTypes.InitialStateSet,
      gameConfig: this.gameConfig,
      games,
    };
  }

  private inMessageListener(message: InMessage, user: User) {
    const { type } = message;
    const { id: userId } = user;

    switch (type) {
      case InMessageTypes.CreateGame: {
        const levelConfig = this.gameController.getLevelConfig();

        this.gameController.createGame(levelConfig, user);

        return;
      }
      case InMessageTypes.JoinGame: {
        const { gameId } = message;

        this.gameController.joinGame(gameId, user);

        return;
      }
      case InMessageTypes.DeleteGame: {
        this.gameController.deleteGameByUserId(userId);

        return;
      }
      case InMessageTypes.StartMoveTank: {
        const { gameId, direction } = message;

        this.gameController.startMoveTank(gameId, userId, direction);

        return;
      }
      case InMessageTypes.StopMoveTank: {
        const { gameId } = message;

        this.gameController.stopTank(gameId, userId);

        return;
      }
      case InMessageTypes.Shoot: {
        const { gameId, userId } = message;

        this.gameController.shoot(gameId, userId);

        return;
      }
      default:
        return;
    }
  }

  private actionListener(action: Action): void {
    const { type } = action;

    switch (type) {
      case GameActionTypes.GameCreated: {
        const {
          game,
          game: {
            id: gameId,
            users: {
              0: { id: userId },
            },
          },
        } = action;

        this.webSocketController.sendMessageToUser(userId, {
          type: OutMessageTypes.GameOpened,
          game: this.gameConverter.convertGameToGameWithStateDto(game),
          userId,
        });

        this.webSocketController.sendMessageToAllSockets({
          type: OutMessageTypes.GameCreated,
          gameId,
        });

        return;
      }
      case GameActionTypes.GameJoined: {
        const { gameId } = action;

        const { getState } = this.store;

        const { games } = getState();

        const game = games.get(gameId);

        const gamePrestartedMessage = {
          type: OutMessageTypes.GamePrestarted,
          game: this.gameConverter.convertGameToGameWithStateDto(game),
          userId: null, // It will be replaced with real user id in sendMessageToGameUsers
        };

        this.sendMessageToGameUsers(gamePrestartedMessage, gameId);

        this.webSocketController.sendMessageToAllSockets({
          type: OutMessageTypes.GameOccupied,
          gameId,
        });

        return;
      }
      case GameActionTypes.GameStartCountdown: {
        const { gameId, secondsLeft } = action;

        const gameStartCountdownMessage = {
          type: OutMessageTypes.GameStartCountdown,
          secondsLeft,
        };

        this.sendMessageToGameUsers(gameStartCountdownMessage, gameId);

        return;
      }
      case GameActionTypes.GameActivated: {
        const { gameId } = action;

        const gameStartedMessage = {
          type: OutMessageTypes.GameStarted,
        };

        this.sendMessageToGameUsers(gameStartedMessage, gameId);

        return;
      }
      case GameActionTypes.GameDeleted: {
        const { gameId } = action;

        this.webSocketController.sendMessageToAllSockets({
          type: OutMessageTypes.GameDeleted,
          gameId,
        });

        return;
      }
      case GameActionTypes.GameEnded: {
        const { gameId, winnerId, userIds } = action;

        const gameEndedMessage = {
          type: OutMessageTypes.GameEnded,
          gameId,
          winnerId,
        };

        userIds.forEach((userId) => {
          this.webSocketController.sendMessageToUser(userId, gameEndedMessage);
        });

        return;
      }
      case GameplayActionTypes.TankMoved: {
        const { gameId, tank } = action;

        const tankUpdatedMessage = {
          type: OutMessageTypes.TankUpdated,
          tank,
        };

        this.sendMessageToGameUsers(tankUpdatedMessage, gameId);

        return;
      }
      case GameplayActionTypes.TankStopped: {
        const { gameId, userId } = action;

        const { getState } = this.store;

        const { games } = getState();

        const {
          state: { tanksByUserId },
        } = games.get(gameId);

        const tank = { ...tanksByUserId.get(userId), isMoving: false };

        const tankUpdatedMessage = {
          type: OutMessageTypes.TankUpdated,
          tank,
        };

        this.sendMessageToGameUsers(tankUpdatedMessage, gameId);

        return;
      }
      case GameplayActionTypes.BulletCreated: {
        const { gameId, bullet } = action;

        const bulletCreatedMessage = {
          type: OutMessageTypes.BulletCreated,
          bullet,
        };

        this.sendMessageToGameUsers(bulletCreatedMessage, gameId);

        return;
      }
      case GameplayActionTypes.BulletUpdated: {
        const { gameId, bullet } = action;

        const bulletUpdatedMessage = {
          type: OutMessageTypes.BulletUpdated,
          bullet,
        };

        this.sendMessageToGameUsers(bulletUpdatedMessage, gameId);

        return;
      }
      case GameplayActionTypes.BulletDestroyed: {
        const { gameId, bulletId } = action;

        const bulletDestroyedMessage = {
          type: OutMessageTypes.BulletDestroyed,
          bulletId,
        };

        this.sendMessageToGameUsers(bulletDestroyedMessage, gameId);

        return;
      }
      default:
        return;
    }
  }

  private sendMessageToGameUsers(message: OutMessage, gameId: string) {
    const { getState } = this.store;

    const { games } = getState();

    const { users } = games.get(gameId);

    users.forEach(({ id: userId }) => {
      let messageWithUserId: OutMessage;

      if ('userId' in message) {
        messageWithUserId = { ...message, userId };
      }

      this.webSocketController.sendMessageToUser(
        userId,
        messageWithUserId ?? message
      );
    });
  }
}
