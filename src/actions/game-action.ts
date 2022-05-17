import { Game } from '../models/game';
import { Tank } from '../models/map-object/tank';
import { User } from '../models/user';

export const GameActionTypes = {
  GameCreated: 'GAME_CREATED',
  GameJoined: 'GAME_JOINED',
  GameStartCountdown: 'GAME_START_COUNTDOWN',
  GameActivated: 'GAME_ACTIVATED',
  GameDeleted: 'GAME_DELETED',
  GameEnded: 'GAME_ENDED',
} as const;

interface GameCreatedAction {
  type: typeof GameActionTypes.GameCreated;
  game: Game;
}

interface GameJoinedAction {
  type: typeof GameActionTypes.GameJoined;
  gameId: string;
  user: User;
  tank: Tank;
}

interface GameStartCountdownAction {
  type: typeof GameActionTypes.GameStartCountdown;
  gameId: string;
  secondsLeft: number;
}

interface GameActivatedAction {
  type: typeof GameActionTypes.GameActivated;
  gameId: string;
}

interface GameDeletedAction {
  type: typeof GameActionTypes.GameDeleted;
  gameId: string;
}

interface GameEndedAction {
  type: typeof GameActionTypes.GameEnded;
  gameId: string;
  winnerId: string;
  userIds: string[];
}

export type GameAction =
  | GameCreatedAction
  | GameJoinedAction
  | GameStartCountdownAction
  | GameActivatedAction
  | GameDeletedAction
  | GameEndedAction;
