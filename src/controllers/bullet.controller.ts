import { Action } from '../actions/action';
import { CreateBulletCommand } from '../commands/create-bullet.command';
import { DestroyBulletCommand } from '../commands/destroy-bullet.command';
import { MoveBulletCommand } from '../commands/move-bullet.command';
import { Bullet } from '../models/bullet';
import { MapObject } from '../models/map-object/map-object';
import { OnDestroy } from '../models/on-destroy';
import { State } from '../state/models/state';
import { Store } from '../store/models/store';
import { FieldUtils } from '../utils/field.utils';

export class BulletController implements OnDestroy {
  private moveIntervalId: NodeJS.Timer;

  private destroyTimeoutId: NodeJS.Timer;

  constructor(
    public readonly bullet: Bullet,
    private readonly fieldUtils: FieldUtils,
    public readonly gameId: string,
    private readonly onBulletDelete: OnBulletDelete,
    private readonly store: Store<State, Action>
  ) {}

  public onDestroy() {
    if (this.moveIntervalId) {
      clearInterval(this.moveIntervalId);

      this.moveIntervalId = undefined;
    }

    if (this.destroyTimeoutId) {
      clearTimeout(this.destroyTimeoutId);

      this.destroyTimeoutId = undefined;
    }
  }

  public shoot() {
    if (this.moveIntervalId) {
      return;
    }

    const { getState } = this.store;

    const {
      gameConfig: { eventInterval },
    } = getState();

    this.moveIntervalId = setInterval(() => this.move(), eventInterval);

    this.create();
    this.move();
  }

  private create() {
    new CreateBulletCommand(this.bullet, this.gameId, this.store).execute();
  }

  private move() {
    const { id: bulletId, userId } = this.bullet;

    const { getState } = this.store;

    const {
      gameConfig: { eventInterval },
    } = getState();

    try {
      const { target, isBulletMoving } = new MoveBulletCommand(
        bulletId,
        this.fieldUtils,
        this.gameId,
        this.store,
        userId
      ).execute();

      if (!isBulletMoving || target !== undefined) {
        this.destroyTimeoutId = setTimeout(
          () => this.destroyBullet(target),
          eventInterval
        );
      }
    } catch (e) {
      console.error(`Error in BulletController.move: ${e}`);

      this.onDestroy();
    }
  }

  private destroyBullet(target?: MapObject): void {
    const { id: bulletId, userId } = this.bullet;

    this.onDestroy();

    try {
      new DestroyBulletCommand(
        bulletId,
        this.gameId,
        this.store,
        target
      ).execute();

      this.onBulletDelete(this.gameId, userId, bulletId, target);
    } catch (e) {
      console.error(`Error in BulletController.destroyBullet: ${e}`);
    }
  }
}

type OnBulletDelete = (
  gameId: string,
  userId: string,
  bulletId: string,
  target?: MapObject
) => void;
