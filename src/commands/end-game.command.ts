import { Action } from '../actions/action';
import { GameActionTypes } from '../actions/game-action';
import { GameIsNotFoundError } from '../errors/game-is-not-found.error';
import { State } from '../state/models/state';
import { Store } from '../store/models/store';
import { Command } from './command';

export class EndGameCommand extends Command {
  constructor(
    private readonly gameId: string,
    private readonly store: Store<State, Action>,
    private readonly winnerId: string
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

    const { users } = game;

    const userIds = users.map(({ id }) => id);

    dispatch({
      type: GameActionTypes.GameEnded,
      gameId: this.gameId,
      winnerId: this.winnerId,
      userIds,
    });
  }
}
