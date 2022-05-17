import { Action } from '../actions/action';
import { GameActionTypes } from '../actions/game-action';
import { GameplayActionTypes } from '../actions/gameplay-action';
import { Game } from '../models/game';
import { GameStatuses } from '../models/game-status';
import { Reducer } from '../store/models/reducer';
import { State } from './models/state';

function addOrReplaceGame(state: State, game: Game): State {
  const { games: currentGames } = state;
  const { id: gameId } = game;

  const games = new Map(currentGames);
  games.set(gameId, game);

  return { ...state, games };
}

export const reducer: Reducer<Action, State> = function (
  action: Action,
  state: State
): State {
  const { type } = action;

  switch (type) {
    case GameActionTypes.GameCreated: {
      const {
        game,
        game: { id: gameId, users },
      } = action;

      const { gameIdByUserId: currentGameIdByUserId } = state;
      const gameIdByUserId = new Map(currentGameIdByUserId);

      users.forEach(({ id: userId }) => {
        gameIdByUserId.set(userId, gameId);
      });

      return addOrReplaceGame({ ...state, gameIdByUserId }, game);
    }
    case GameActionTypes.GameJoined: {
      const {
        gameId,
        user,
        user: { id: userId },
        tank,
      } = action;

      const { games, gameIdByUserId: currentGameIdByUserId } = state;

      const currentGame = games.get(gameId);

      const {
        users: currentUsers,
        state: currentState,
        state: { tanksByUserId: currentTanksByUserId },
      } = currentGame;

      const users = [...currentUsers, user];

      const tanksByUserId = new Map(currentTanksByUserId);

      tanksByUserId.set(userId, tank);

      const game: Game = {
        ...currentGame,
        users,
        state: { ...currentState, status: GameStatuses.Ready, tanksByUserId },
      };

      const gameIdByUserId = new Map(currentGameIdByUserId);
      gameIdByUserId.set(userId, gameId);

      return addOrReplaceGame({ ...state, gameIdByUserId }, game);
    }
    case GameActionTypes.GameActivated: {
      const { gameId } = action;

      const { games } = state;

      const currentGame = games.get(gameId);

      const game: Game = {
        ...currentGame,
        state: { ...currentGame.state, status: GameStatuses.Active },
      };

      return addOrReplaceGame(state, game);
    }
    case GameActionTypes.GameDeleted:
    case GameActionTypes.GameEnded: {
      const { gameId } = action;

      const { games: currentGames, gameIdByUserId: currentGameIdByUserId } =
        state;

      const { users } = currentGames.get(gameId);

      const gameIdByUserId = new Map(currentGameIdByUserId);

      users.forEach(({ id: userId }) => {
        gameIdByUserId.delete(userId);
      });

      const games = new Map(currentGames);
      games.delete(gameId);

      return { ...state, games, gameIdByUserId };
    }
    case GameplayActionTypes.TankMoved: {
      const {
        gameId,
        tank,
        tank: { userId },
      } = action;

      const { games } = state;

      const currentGame = games.get(gameId);

      const {
        state: currentState,
        state: { tanksByUserId: currentTanksByUserId },
      } = currentGame;

      const tanksByUserId = new Map(currentTanksByUserId);
      tanksByUserId.set(userId, tank);

      const game: Game = {
        ...currentGame,
        state: { ...currentState, tanksByUserId },
      };

      return addOrReplaceGame(state, game);
    }
    case GameplayActionTypes.TankStopped: {
      const { gameId, userId } = action;

      const { games } = state;

      const currentGame = games.get(gameId);

      const {
        state: currentState,
        state: { tanksByUserId: currentTanksByUserId },
      } = currentGame;

      const currentTank = currentTanksByUserId.get(userId);

      const tank = {
        ...currentTank,
        isMoving: false,
      };

      const tanksByUserId = new Map(currentTanksByUserId);
      tanksByUserId.set(userId, tank);

      const game: Game = {
        ...currentGame,
        state: { ...currentState, tanksByUserId },
      };

      return addOrReplaceGame(state, game);
    }
    case GameplayActionTypes.BulletCreated:
    case GameplayActionTypes.BulletUpdated: {
      const {
        gameId,
        bullet,
        bullet: { id: bulletId },
      } = action;

      const { games } = state;

      const currentGame = games.get(gameId);

      const {
        state: currentState,
        state: { bullets: currentBullets },
      } = currentGame;

      const bullets = new Map(currentBullets);
      bullets.set(bulletId, bullet);

      const game: Game = {
        ...currentGame,
        state: { ...currentState, bullets },
      };

      return addOrReplaceGame(state, game);
    }
    case GameplayActionTypes.BulletDestroyed: {
      const { gameId, bulletId } = action;

      const { games } = state;

      const currentGame = games.get(gameId);

      const {
        state: currentState,
        state: { bullets: currentBullets },
      } = currentGame;

      const bullets = new Map(currentBullets);
      bullets.delete(bulletId);

      const game: Game = {
        ...currentGame,
        state: { ...currentState, bullets },
      };

      return addOrReplaceGame(state, game);
    }
    default:
      return state;
  }
};
