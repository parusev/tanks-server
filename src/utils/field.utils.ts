import { Coordinates } from '../models/coordinates';
import { Direction, Directions } from '../models/direction';
import { Landscape } from '../models/landscape/landscape';
import { Level } from '../models/level';
import { MapArea } from '../models/map-area';
import { MapObject } from '../models/map-object/map-object';
import { Tank } from '../models/map-object/tank';

export class FieldUtils {
  public createLandscapeKey(coordinates: Coordinates): string {
    const { x, y } = coordinates;

    return `${x}-${y}`;
  }

  public getIntersectedMapObject(params: {
    mapArea: MapArea;
    tankSizeInBlocks: number;
    landscape: Landscape;
    tanksByUserId: Map<string, Tank>;
    userId: string;
  }): MapObject {
    const { mapArea, tankSizeInBlocks, landscape, tanksByUserId, userId } =
      params;

    const {
      startCoordinates: { x: xStart, y: yStart },
      endCoordinates: { x: xEnd, y: yEnd },
    } = mapArea;

    const tank = [...tanksByUserId.values()].find((tank) => {
      const { userId: tankUserId, x: tankXStart, y: tankYStart } = tank;

      if (tankUserId === userId) {
        return false;
      }

      const tankStartCoordinates = {
        x: tankXStart,
        y: tankYStart,
      };

      const tankMapArea = this.calculateMapArea(
        tankStartCoordinates,
        tankSizeInBlocks
      );

      return this.isIntersect(tankMapArea, {
        startCoordinates: { x: xStart, y: yStart },
        endCoordinates: { x: xEnd, y: yEnd },
      });
    });

    if (tank) {
      return tank;
    }

    for (let x = xStart; x <= xEnd; x++) {
      for (let y = yStart; y <= yEnd; y++) {
        const landscapeObject = landscape.get(
          this.createLandscapeKey({ x, y })
        );

        if (landscapeObject) {
          return landscapeObject;
        }
      }
    }
  }

  public takeStep(params: {
    level: Level;
    tanksByUserId: Map<string, Tank>;
    userId: string;
    coordinates: Coordinates;
    direction: Direction;
    tankSizeInBlocks: number;
    step: number;
    canIntersect: boolean;
  }): TargetCoordinates {
    const {
      level,
      level: { landscape },
      tanksByUserId,
      userId,
      coordinates: currentCoordinates,
      direction,
      tankSizeInBlocks,
      step,
      canIntersect,
    } = params;

    let { x: currentX, y: currentY } = currentCoordinates;

    for (let currentStep = 0; currentStep < step; currentStep++) {
      const targetCoordinates = this.getTargetCoordinates(
        level,
        { x: currentX, y: currentY },
        direction,
        tankSizeInBlocks
      );

      const { x: targetX, y: targetY } = targetCoordinates;

      if (targetX === currentX && targetY === currentY) {
        return targetCoordinates;
      }

      const targetMapArea = this.calculateMapArea(
        targetCoordinates,
        tankSizeInBlocks
      );

      const intersectedMapObject = this.getIntersectedMapObject({
        mapArea: targetMapArea,
        tankSizeInBlocks,
        landscape,
        tanksByUserId,
        userId,
      });

      if (!intersectedMapObject) {
        currentX = targetX;
        currentY = targetY;

        continue;
      }

      if (canIntersect) {
        return {
          x: targetX,
          y: targetY,
          target: intersectedMapObject,
        };
      } else {
        return {
          x: currentX,
          y: currentY,
        };
      }
    }

    return {
      x: currentX,
      y: currentY,
    };
  }

  public calculateMapArea(
    startCoordinates: Coordinates,
    sizeInBlocks: number
  ): MapArea {
    const { x, y } = startCoordinates;

    return {
      startCoordinates,
      endCoordinates: {
        x: x + sizeInBlocks - 1,
        y: y + sizeInBlocks - 1,
      },
    };
  }

  public isIntersect(mapAreaA: MapArea, mapAreaB: MapArea): boolean {
    const {
      startCoordinates: { x: xStartA, y: yStartA },
      endCoordinates: { x: xEndA, y: yEndA },
    } = mapAreaA;
    const {
      startCoordinates: { x: xStartB, y: yStartB },
      endCoordinates: { x: xEndB, y: yEndB },
    } = mapAreaB;

    const isXIntersect = xStartA <= xEndB && xEndA >= xStartB;
    const isYIntercest = yStartA <= yEndB && yEndA >= yStartB;

    return isXIntersect && isYIntercest;
  }

  private getTargetCoordinates(
    level: Level,
    currentCoordinates: Coordinates,
    direction: Direction,
    tankSizeInBlocks: number
  ): Coordinates {
    const { x, y } = currentCoordinates;

    const { width, height } = level;

    const maxXCoord = width - tankSizeInBlocks;
    const maxYCoord = height - tankSizeInBlocks;

    const targetCoordinates = {
      x,
      y,
    };

    switch (direction) {
      case Directions.top:
        targetCoordinates.y = Math.max(y - 1, 0);
        break;
      case Directions.bottom:
        targetCoordinates.y = Math.min(y + 1, maxYCoord);
        break;
      case Directions.left:
        targetCoordinates.x = Math.max(x - 1, 0);
        break;
      case Directions.right:
        targetCoordinates.x = Math.min(x + 1, maxXCoord);
        break;
      default:
        break;
    }

    return targetCoordinates;
  }
}

interface TargetCoordinates extends Coordinates {
  target?: MapObject;
}
