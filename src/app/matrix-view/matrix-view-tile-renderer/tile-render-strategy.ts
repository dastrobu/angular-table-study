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
        const tileWidth = this.tileSize.width;
        const tileHeight = this.tileSize.height;
        const width = Math.min(this.viewportSize.width, this.canvasSize.width);
        const height = Math.min(this.viewportSize.height, this.canvasSize.height);

        const left = Math.floor(scrollPosition.left / tileWidth);
        const right = Math.ceil((scrollPosition.left + width) / tileWidth);
        const top = Math.floor(scrollPosition.top / tileHeight);
        const bottom = Math.ceil((scrollPosition.top + height) / tileHeight);
        const tiles = [];
        // TODO: implement prefetching of tiles
        // TODO: rethink if there is a corner case, where one must use i <= instead of <
        for (let i = top; i < bottom; i++) {
            for (let j = left; j < right; j++) {
                tiles.push({row: i, col: j});
            }
        }
        return tiles;
    }
}
