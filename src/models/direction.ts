import { ValuesOfObject } from '../utils/object.utils';

export const Directions = {
  left: 'LEFT',
  right: 'RIGHT',
  top: 'TOP',
  bottom: 'BOTTOM',
} as const;

export type Direction = ValuesOfObject<typeof Directions>;
