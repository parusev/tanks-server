import { Action } from '../../actions/action';
import { Directions } from '../../models/direction';
import { LevelConfig } from '../../models/level-config';
import { MapArea } from '../../models/map-area';
import { Wall } from '../../models/map-object/wall';
import { TankConfig } from '../../models/tank-config';
import { State } from '../../state/models/state';
import { Store } from '../../store/models/store';
import { FieldUtils } from '../field.utils';
import { wallsMapAreas } from './constants/walls-map-areas';

export class LevelConfigUtils {
  constructor(
    private readonly fieldUtils: FieldUtils,
    private readonly store: Store<State, Action>
  ) {}

  public generateLevelConfig(): LevelConfig {
    const width = 50;
    const height = 50;

    const tanks: TankConfig[] = [
      {
        x: 0,
        y: 0,
        shotDirection: Directions.bottom,
      },
      {
        x: 48,
        y: 48,
        shotDirection: Directions.top,
      },
    ];

    const { getState } = this.store;

    const {
      gameConfig: { tankSizeInBlocks },
    } = getState();

    const tanksMapAreas: MapArea[] = tanks.map((tank) =>
      this.fieldUtils.calculateMapArea(tank, tankSizeInBlocks)
    );

    const walls: Wall[] = [];

    wallsMapAreas
      .filter((wallMapArea) => {
        if (
          tanksMapAreas.find((tankMapArea) =>
            this.fieldUtils.isIntersect(tankMapArea, wallMapArea)
          )
        ) {
          return false;
        }

        const randomNumber = Math.random();

        if (randomNumber > 0.7) {
          return false;
        }

        const {
          endCoordinates: { x: wallMapAreaEndX, y: wallMapAreaEndY },
        } = wallMapArea;

        return wallMapAreaEndX < width && wallMapAreaEndY < height;
      })
      .forEach(
        ({
          startCoordinates: { x: xStart, y: yStart },
          endCoordinates: { x: xEnd, y: yEnd },
        }) => {
          for (let x = xStart; x <= xEnd; x++) {
            for (let y = yStart; y <= yEnd; y++) {
              walls.push({ x, y });
            }
          }
        }
      );

    const levelConfig: LevelConfig = {
      width,
      height,
      walls,
      tanks,
    };

    return levelConfig;
  }
}
