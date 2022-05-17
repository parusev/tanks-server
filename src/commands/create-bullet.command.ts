import { Action } from '../actions/action';
import { GameplayActionTypes } from '../actions/gameplay-action';
import { GameIsNotFoundError } from '../errors/game-is-not-found.error';
import { Bullet } from '../models/bullet';
import { State } from '../state/models/state';
import { Store } from '../store/models/store';
import { Command } from './command';

export class CreateBulletCommand extends Command {
  constructor(
    private readonly bullet: Bullet,
    private readonly gameId: string,
    private readonly store: Store<State, Action>
  ) {
    super();
  }

  public execute(): void {
    const { dispatch, getState } = this.store;

    const { games } = getState();

    const game = games.get(this.gameId);

    if (game === undefined) {
      throw new GameIsNotFoundError();
    }

    dispatch({
      type: GameplayActionTypes.BulletCreated,
      gameId: this.gameId,
      bullet: this.bullet,
    });
  }
}
