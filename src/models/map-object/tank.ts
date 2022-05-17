import { isObject } from '../../utils/object.utils';
import { Coordinates } from '../coordinates';
import { Direction } from '../direction';

export interface Tank extends Coordinates {
  userId: string;
  shotDirection: Direction;
  isMoving: boolean;
}

export function isTank(value: any): value is Tank {
  return (
    isObject(value) &&
    'userId' in value &&
    'x' in value &&
    'y' in value &&
    'shotDirection' in value &&
    'isMoving' in value
  );
}
