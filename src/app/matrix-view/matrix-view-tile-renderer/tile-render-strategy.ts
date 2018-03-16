import {BoxSize, Point2D, RowCol} from '../utils';

export interface TileRenderStrategy {

    /**
     * tile size from configuration
     * @see MatrixViewConfig#tileSize tileSize
     */
    tileSize: BoxSize;

    /**
     * current canvas size
     * @see MatrixViewViewModel#canvasSize canvasSize
     */
    canvasSize: BoxSize;

    /**
     * current viewport size
     * @see MatrixViewViewModel#viewportSize viewportSize
     */
    viewportSize: BoxSize;

    /**
     * Called on every scroll event, to determine which tiles to show and which to hide.
     * Since this method is called on every scroll event, it is important that it is really fast. Bad performance
     * of this method can cause bad scroll sync performance on the entire matrix view.
     *
     * This method is called outside the angular zone, it is therefore required, that the call to this method has no
     * side effects on any angular component. Apart from that, it is strongly recommended, that it has no side effects
     * at all.
     *
     * @param {Point2D} scrollPosition current scroll position.
     * @return {ReadonlyArray<RowCol<number>>} all indices of tiles that should be currently visible.
     */
    getVisibleTiles(scrollPosition: Point2D): ReadonlyArray<RowCol<number>>;
}

export class DefaultTileRenderStrategy implements TileRenderStrategy {
    tileSize: BoxSize;
    canvasSize: BoxSize;
    viewportSize: BoxSize;

    getVisibleTiles(scrollPosition: Point2D): ReadonlyArray<RowCol<number>> {
        const tileWidth = this.tileSize.width;
        const tileHeight = this.tileSize.height;
        const viewportSize = this.viewportSize;
        const canvasSize = this.canvasSize;
        if (!viewportSize || !canvasSize) {
            return [];
        }
        const width = Math.min(viewportSize.width, canvasSize.width);
        const height = Math.min(viewportSize.height, canvasSize.height);

        const left = Math.floor(scrollPosition.left / tileWidth);
        const right = Math.ceil((scrollPosition.left + width) / tileWidth);
        const top = Math.floor(scrollPosition.top / tileHeight);
        const bottom = Math.ceil((scrollPosition.top + height) / tileHeight);
        const tiles = [];
        // TODO: implement prefetching of tiles
        // TODO: rethink if there is a corner case, where one must use i <= instead of <
        for (let i = top; i < bottom; ++i) {
            for (let j = left; j < right; j++) {
                tiles.push({row: i, col: j});
            }
        }
        return tiles;
    }
}
