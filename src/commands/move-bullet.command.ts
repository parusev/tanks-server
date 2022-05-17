import { Action } from '../actions/action';
import { GameplayActionTypes } from '../actions/gameplay-action';
import { bulletStep } from '../constants/bullet-step';
import { GameIsNotFoundError } from '../errors/game-is-not-found.error';
import { MapObject } from '../models/map-object/map-object';
import { State } from '../state/models/state';
import { Store } from '../store/models/store';
import { FieldUtils } from '../utils/field.utils';
import { Command } from './command';

export class MoveBulletCommand extends Command {
  constructor(
    private readonly bulletId: string,
    private readonly fieldUtils: FieldUtils,
    private readonly gameId: string,
    private readonly store: Store<State, Action>,
    private readonly userId: string
  ) {
    super();
  }

  public execute(): MoveBulletResult {
    const { dispatch, getState } = this.store;

    const {
      gameConfig: { tankSizeInBlocks },
      games,
    } = getState();

    const game = games.get(this.gameId);

    if (game === undefined) {
      throw new GameIsNotFoundError();
    }

    const {
      state: { level, tanksByUserId, bullets },
    } = game;

    const currentBullet = bullets.get(this.bulletId);

    const { x: currentBulletX, y: currentBulletY, direction } = currentBullet;

    const { x, y, target } = this.fieldUtils.takeStep({
      level,
      tanksByUserId,
      userId: this.userId,
      coordinates: {
        x: currentBulletX,
        y: currentBulletY,
      },
      direction,
      tankSizeInBlocks,
      step: bulletStep,
      canIntersect: true,
    });

    const isBulletMoving = x !== currentBulletX || y !== currentBulletY;

    if (isBulletMoving) {
      dispatch({
        type: GameplayActionTypes.BulletUpdated,
        gameId: this.gameId,
        bullet: {
          ...currentBullet,
          x,
          y,
        },
      });
    }

    return {
      target,
      isBulletMoving,
    };
  }
}

interface MoveBulletResult {
  target?: MapObject;
  isBulletMoving: boolean;
}
