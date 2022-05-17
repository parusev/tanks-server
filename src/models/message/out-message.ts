import { Bullet } from '../bullet';
import { GameWithStateDto } from '../dto/game-with-state.dto';
import { GameDto } from '../dto/game.dto';
import { GameConfig } from '../game-config';
import { Tank } from '../map-object/tank';

export const OutMessageTypes = {
  InitialStateSet: 'INITIAL_STATE_SET',
  GameCreated: 'GAME_CREATED',
  GameOpened: 'GAME_OPENED',
  GameOccupied: 'GAME_OCCUPIED',
  GamePrestarted: 'GAME_PRESTARTED',
  GameStartCountdown: 'GAME_START_COUNTDOWN',
  GameStarted: 'GAME_STARTED',
  GameDeleted: 'GAME_DELETED',
  GameEnded: 'GAME_ENDED',
  TankUpdated: 'TANK_UPDATED',
  BulletCreated: 'BULLET_CREATED',
  BulletUpdated: 'BULLET_UPDATED',
  BulletDestroyed: 'BULLET_DESTROYED',
  Error: 'ERROR',
} as const;

interface InitialStateSetOutMessage {
  type: typeof OutMessageTypes.InitialStateSet;
  gameConfig: GameConfig;
  games: GameDto[];
}

interface GameCreatedOutMessage {
  type: typeof OutMessageTypes.GameCreated;
  gameId: string;
}

interface GameDeletedOutMessage {
  type: typeof OutMessageTypes.GameDeleted;
  gameId: string;
}

interface GameOpenedOutMessage {
  type: typeof OutMessageTypes.GameOpened;
  game: GameWithStateDto;
  userId: string;
}

interface GameOccupiedOutMessage {
  type: typeof OutMessageTypes.GameOccupied;
  gameId: string;
}

interface GamePrestartedOutMessage {
  type: typeof OutMessageTypes.GamePrestarted;
  game: GameWithStateDto;
  userId: string;
}

interface GameStartCountdownOutMessage {
  type: typeof OutMessageTypes.GameStartCountdown;
  secondsLeft: number;
}

interface GameStartedOutMessage {
  type: typeof OutMessageTypes.GameStarted;
}

interface GameEndedOutMessage {
  type: typeof OutMessageTypes.GameEnded;
  gameId: string;
  winnerId: string;
}

interface TankUpdatedOutMessage {
  type: typeof OutMessageTypes.TankUpdated;
  tank: Tank;
}

interface BulletCreatedOutMessage {
  type: typeof OutMessageTypes.BulletCreated;
  bullet: Bullet;
}

interface BulletUpdatedOutMessage {
  type: typeof OutMessageTypes.BulletUpdated;
  bullet: Bullet;
}

interface BulletDestroyedOutMessage {
  type: typeof OutMessageTypes.BulletDestroyed;
  bulletId: string;
}

interface ErrorOutMessage {
  type: typeof OutMessageTypes.Error;
  message?: string;
}

export type OutMessage =
  | InitialStateSetOutMessage
  | GameCreatedOutMessage
  | GameOpenedOutMessage
  | GameOccupiedOutMessage
  | GamePrestartedOutMessage
  | GameStartCountdownOutMessage
  | GameStartedOutMessage
  | GameDeletedOutMessage
  | GameEndedOutMessage
  | TankUpdatedOutMessage
  | BulletCreatedOutMessage
  | BulletUpdatedOutMessage
  | BulletDestroyedOutMessage
  | ErrorOutMessage;
