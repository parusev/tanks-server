import { AbstractAction } from './abstract-action';
import { StoreListener } from './store-listener';

export interface Store<TState, TAction extends AbstractAction> {
  getState: () => TState;
  dispatch: (action: TAction) => void;
  subscribe: (listener: StoreListener<TAction>) => () => void;
}
