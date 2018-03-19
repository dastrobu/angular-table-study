import {BoxSize, Point2D, RowCol} from '../utils';

export interface TileRenderStrategy {

    /**
     * tile size from configuration
     * @see MatrixViewConfig#tileSize tileSize
     */
    tileSize: BoxSize;

    /**
     * current canvas size
     * @see ContainerComponent#canvasSize canvasSize
     */
    canvasSize: BoxSize;

    /**
     * current viewport size
     * @see ContainerComponent#viewportSize viewportSize
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
    /**
     * the prefetch offset, controls, how many tiles, that are not on the viewport, but adjacent to the viewport will
     * be shown.
     * This has the effect, that scrolling gets smother, if the elements are already placed in the DOM when they get
     * close to the viewport.
     * This should be something between 0 and a small number, default 1.
     */
    prefetchOffset = 1;

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

        let left = Math.floor(scrollPosition.left / tileWidth);
        const prefetchOffset = this.prefetchOffset;
        left = Math.max(0, left - prefetchOffset);
        let right = Math.ceil((scrollPosition.left + width) / tileWidth);
        right += prefetchOffset;
        let top = Math.floor(scrollPosition.top / tileHeight);
        top = Math.max(0, top - prefetchOffset);
        let bottom = Math.ceil((scrollPosition.top + height) / tileHeight);
        bottom += prefetchOffset;
        const tiles = [];
        // TODO: rethink if there is a corner case, where one must use i <= instead of <
        for (let i = top; i < bottom; ++i) {
            for (let j = left; j < right; j++) {
                tiles.push({row: i, col: j});
            }
        }
        return tiles;
    }
}
