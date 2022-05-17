import { Tank } from './map-object/tank';

export type TankConfig = Omit<Tank, 'userId' | 'isMoving'>;
