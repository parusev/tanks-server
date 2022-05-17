import { AbstractAction } from './models/abstract-action';
import { Reducer } from './models/reducer';
import { Store } from './models/store';
import { StoreListener } from './models/store-listener';

export function createStore<TState, TAction extends AbstractAction>(
  reducer: Reducer<TAction, TState>,
  initialState: TState
): Store<TState, TAction> {
  let state = initialState;
  let listeners: StoreListener<TAction>[] = [];

  function getState(): TState {
    return state;
  }

  function dispatch(action: TAction): void {
    state = reducer(action, state);

    listeners.forEach((listener) => listener(action));
  }

  function subscribe(listener: StoreListener<TAction>) {
    let isSubscribed = true;

    listeners = [...listeners, listener];

    return function unsubscribe() {
      if (!isSubscribed) {
        return;
      }

      isSubscribed = false;
      listeners = listeners.filter((_listener) => _listener !== listener);
    };
  }

  return {
    getState,
    dispatch,
    subscribe,
  };
}
