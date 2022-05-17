import { Action } from '../actions/action';
import { GameplayActionTypes } from '../actions/gameplay-action';
import { GameIsNotFoundError } from '../errors/game-is-not-found.error';
import { MapObject } from '../models/map-object/map-object';
import { State } from '../state/models/state';
import { Store } from '../store/models/store';
import { Command } from './command';

export class DestroyBulletCommand extends Command {
  constructor(
    private readonly bulletId: string,
    private readonly gameId: string,
    private readonly store: Store<State, Action>,
    private readonly target?: MapObject
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
      type: GameplayActionTypes.BulletDestroyed,
      gameId: this.gameId,
      bulletId: this.bulletId,
      target: this.target,
    });
  }
}
