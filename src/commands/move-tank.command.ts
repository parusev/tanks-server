import { Action } from '../actions/action';
import { GameplayActionTypes } from '../actions/gameplay-action';
import { tankStep } from '../constants/tank-step';
import { GameIsNotFoundError } from '../errors/game-is-not-found.error';
import { Direction } from '../models/direction';
import { Tank } from '../models/map-object/tank';
import { State } from '../state/models/state';
import { Store } from '../store/models/store';
import { FieldUtils } from '../utils/field.utils';
import { Command } from './command';

export class MoveTankCommand extends Command {
  constructor(
    private readonly direction: Direction,
    private readonly fieldUtils: FieldUtils,
    private readonly gameId: string,
    private readonly store: Store<State, Action>,
    private readonly userId: string
  ) {
    super();
  }

  public execute(): void {
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
      state: { level, tanksByUserId },
    } = game;

    const currentTank = tanksByUserId.get(this.userId);

    const { x: currentTankX, y: currentTankY, shotDirection } = currentTank;

    if (this.direction !== shotDirection) {
      dispatch({
        type: GameplayActionTypes.TankMoved,
        gameId: this.gameId,
        tank: {
          ...currentTank,
          shotDirection: this.direction,
          isMoving: false,
        },
      });

      return;
    }

    const { x, y } = this.fieldUtils.takeStep({
      level,
      tanksByUserId,
      userId: this.userId,
      coordinates: {
        x: currentTankX,
        y: currentTankY,
      },
      direction: this.direction,
      tankSizeInBlocks,
      step: tankStep,
      canIntersect: false,
    });

    if (
      x === currentTankX &&
      y === currentTankY &&
      this.direction === shotDirection
    ) {
      return;
    }

    const tank: Tank = {
      userId: this.userId,
      x,
      y,
      shotDirection: this.direction,
      isMoving: true,
    };

    dispatch({
      type: GameplayActionTypes.TankMoved,
      gameId: this.gameId,
      tank,
    });
  }
}
