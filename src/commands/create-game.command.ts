import { Action } from '../actions/action';
import { GameActionTypes } from '../actions/game-action';
import { UserIsAlreadyPlayingError } from '../errors/user-is-already-playing.error';
import { Game } from '../models/game';
import { GameState } from '../models/game-state';
import { GameStatuses } from '../models/game-status';
import { LevelConfig } from '../models/level-config';
import { Tank } from '../models/map-object/tank';
import { User } from '../models/user';
import { State } from '../state/models/state';
import { Store } from '../store/models/store';
import { GameConverter } from '../utils/game.converter';
import { Command } from './command';

export class CreateGameCommand extends Command {
  constructor(
    private readonly gameConverter: GameConverter,
    private readonly gameId: string,
    private readonly levelConfig: LevelConfig,
    private readonly store: Store<State, Action>,
    private readonly user: User
  ) {
    super();
  }

  public execute() {
    const { dispatch, getState } = this.store;

    const { id: userId } = this.user;

    const { gameIdByUserId } = getState();

    if (gameIdByUserId.get(userId) !== undefined) {
      throw new UserIsAlreadyPlayingError();
    }

    const level = this.gameConverter.convertLevelConfigToLevel(
      this.levelConfig
    );

    const startTank = level.startTanks[0];

    const tank: Tank = {
      ...startTank,
      userId,
    };

    const tanksByUserId = new Map([[userId, tank]]);

    const state: GameState = {
      status: GameStatuses.Created,
      level,
      tanksByUserId,
      bullets: new Map(),
    };

    const game: Game = {
      id: this.gameId,
      users: [this.user],
      created: Date.now(),
      state,
    };

    dispatch({
      type: GameActionTypes.GameCreated,
      game,
    });
  }
}
