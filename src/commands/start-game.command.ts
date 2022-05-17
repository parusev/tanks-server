import { Action } from '../actions/action';
import { GameActionTypes } from '../actions/game-action';
import { GameHasWrongStatusError } from '../errors/game-has-wrong-status.error';
import { GameIsNotFoundError } from '../errors/game-is-not-found.error';
import { GameStatuses } from '../models/game-status';
import { State } from '../state/models/state';
import { Store } from '../store/models/store';
import { Command } from './command';

export class StartGameCommand extends Command {
  constructor(
    private readonly gameId: string,
    private readonly store: Store<State, Action>
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
      state: { status },
    } = game;

    if (status !== GameStatuses.Ready) {
      throw new GameHasWrongStatusError();
    }

    dispatch({
      type: GameActionTypes.GameActivated,
      gameId: this.gameId,
    });
  }
}
