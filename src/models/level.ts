import { Landscape } from './landscape/landscape';
import { Tank } from './map-object/tank';

export interface Level {
  width: number;
  height: number;
  landscape: Landscape;
  startTanks: Tank[];
}
