import { AbstractAction } from './abstract-action';

export type Reducer<TAction extends AbstractAction, TState> = (
  action: TAction,
  state: TState
) => TState;
