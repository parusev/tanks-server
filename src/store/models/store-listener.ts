import { AbstractAction } from './abstract-action';

export type StoreListener<TAction extends AbstractAction> = (
  action: TAction
) => void;
