import {BoxSize, Point2D, RowCol} from '../utils';

export interface TileRenderStrategy {
    tileSize: BoxSize;
    canvasSize: BoxSize;
    viewportSize: BoxSize;

    getVisibleTiles(scrollPosition: Point2D): ReadonlyArray<RowCol<number>>;
}

export class DefaultTileRenderStrategy implements TileRenderStrategy {
    tileSize: BoxSize;
    canvasSize: BoxSize;
    viewportSize: BoxSize;

    getVisibleTiles(scrollPosition: Point2D): ReadonlyArray<RowCol<number>> {
        return undefined;
    }
}
