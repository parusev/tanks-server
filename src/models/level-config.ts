import { Wall } from './map-object/wall';
import { TankConfig } from './tank-config';

export interface LevelConfig {
  width: number;
  height: number;
  walls: Wall[];
  tanks: TankConfig[];
}
