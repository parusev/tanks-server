import { Bullet } from '../models/bullet';
import { MapObject } from '../models/map-object/map-object';
import { Tank } from '../models/map-object/tank';

export const GameplayActionTypes = {
  TankMoved: 'TANK_MOVED',
  TankStopped: 'TANK_STOPPED',
  BulletCreated: 'BULLET_CREATED',
  BulletUpdated: 'BULLET_UPDATED',
  BulletDestroyed: 'BULLET_DESTROYED',
} as const;

interface TankMovedAction {
  type: typeof GameplayActionTypes.TankMoved;
  gameId: string;
  tank: Tank;
}

interface TankStoppedAction {
  type: typeof GameplayActionTypes.TankStopped;
  gameId: string;
  userId: string;
}

interface BulletCreatedAction {
  type: typeof GameplayActionTypes.BulletCreated;
  gameId: string;
  bullet: Bullet;
}

interface BulletUpdatedAction {
  type: typeof GameplayActionTypes.BulletUpdated;
  gameId: string;
  bullet: Bullet;
}

interface BulletDestroyedAction {
  type: typeof GameplayActionTypes.BulletDestroyed;
  gameId: string;
  bulletId: string;
  target?: MapObject;
}

export type GameplayAction =
  | TankMovedAction
  | TankStoppedAction
  | BulletCreatedAction
  | BulletUpdatedAction
  | BulletDestroyedAction;
