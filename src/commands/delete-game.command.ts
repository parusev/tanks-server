import { Action } from '../actions/action';
import { GameActionTypes } from '../actions/game-action';
import { GameIsNotFoundError } from '../errors/game-is-not-found.error';
import { State } from '../state/models/state';
import { Store } from '../store/models/store';
import { Command } from './command';

export class DeleteGameCommand extends Command {
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

    dispatch({
      type: GameActionTypes.GameDeleted,
      gameId: this.gameId,
    });
  }
}
