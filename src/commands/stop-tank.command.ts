import { Action } from '../actions/action';
import { GameplayActionTypes } from '../actions/gameplay-action';
import { GameIsNotFoundError } from '../errors/game-is-not-found.error';
import { State } from '../state/models/state';
import { Store } from '../store/models/store';
import { Command } from './command';

export class StopTankCommand extends Command {
  constructor(
    private readonly gameId: string,
    private readonly store: Store<State, Action>,
    private readonly userId: string
  ) {
    super();
  }

  public execute() {
    const { dispatch, getState } = this.store;

    const { games } = getState();

    const game = games.get(this.gameId);

    if (game === undefined) {
      throw new GameIsNotFoundError();
    }

    const {
      state: { tanksByUserId },
    } = game;

    const { isMoving } = tanksByUserId.get(this.userId);

    if (!isMoving) {
      return;
    }

    dispatch({
      type: GameplayActionTypes.TankStopped,
      gameId: this.gameId,
      userId: this.userId,
    });
  }
}
