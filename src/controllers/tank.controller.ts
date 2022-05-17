import { Action } from '../actions/action';
import { MoveTankCommand } from '../commands/move-tank.command';
import { StopTankCommand } from '../commands/stop-tank.command';
import { Direction } from '../models/direction';
import { OnDestroy } from '../models/on-destroy';
import { State } from '../state/models/state';
import { Store } from '../store/models/store';
import { FieldUtils } from '../utils/field.utils';

export class TankController implements OnDestroy {
  private direction: Direction;

  private moveIntervalId: NodeJS.Timer;

  public constructor(
    private readonly fieldUtils: FieldUtils,
    public readonly gameId: string,
    private readonly store: Store<State, Action>,
    public readonly userId: string
  ) {}

  public onDestroy() {
    this.clearMoveInterval();
  }

  public startMove(direction: Direction): void {
    if (this.moveIntervalId !== undefined && direction === this.direction) {
      return;
    }

    this.clearMoveInterval();

    const { getState } = this.store;

    const {
      gameConfig: { eventInterval },
    } = getState();

    this.direction = direction;

    this.moveIntervalId = setInterval(() => this.move(), eventInterval);
    this.move();
  }

  private move() {
    try {
      new MoveTankCommand(
        this.direction,
        this.fieldUtils,
        this.gameId,
        this.store,
        this.userId
      ).execute();
    } catch (e) {
      console.error(`Error in MoveTankController.move: ${e}`);

      this.clearMoveInterval();
    }
  }

  public stop(): void {
    this.clearMoveInterval();

    new StopTankCommand(this.gameId, this.store, this.userId).execute();
  }

  private clearMoveInterval() {
    if (this.moveIntervalId !== undefined) {
      clearInterval(this.moveIntervalId);

      this.moveIntervalId = undefined;
    }
  }
}
