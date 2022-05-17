import { Action } from '../actions/action';
import { GameActionTypes } from '../actions/game-action';
import { GameHasWrongStatusError } from '../errors/game-has-wrong-status.error';
import { GameIsNotFoundError } from '../errors/game-is-not-found.error';
import { UserIsAlreadyPlayingError } from '../errors/user-is-already-playing.error';
import { GameStatuses } from '../models/game-status';
import { Tank } from '../models/map-object/tank';
import { User } from '../models/user';
import { State } from '../state/models/state';
import { Store } from '../store/models/store';
import { Command } from './command';

export class JoinGameCommand extends Command {
  constructor(
    private readonly gameId: string,
    private readonly store: Store<State, Action>,
    private readonly user: User
  ) {
    super();
  }

  public execute() {
    const { dispatch, getState } = this.store;

    const { id: userId } = this.user;

    const { games, gameIdByUserId } = getState();

    if (gameIdByUserId.get(userId) !== undefined) {
      throw new UserIsAlreadyPlayingError();
    }

    const game = games.get(this.gameId);

    if (game === undefined) {
      throw new GameIsNotFoundError();
    }

    const {
      state: {
        status,
        level: { startTanks },
      },
    } = game;

    if (status !== GameStatuses.Created) {
      throw new GameHasWrongStatusError();
    }

    const levelTank = startTanks[1];

    const tank: Tank = {
      ...levelTank,
      userId,
    };

    dispatch({
      type: GameActionTypes.GameJoined,
      gameId: this.gameId,
      user: this.user,
      tank,
    });
  }
}
