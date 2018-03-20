import {BoxSize, Point2D, RowCol} from '../utils';
import {Cell} from '../cell/cell';
import {TileComponent} from './tile.component';

/** interface for a tile, which is employed to handle the virtual dom */
export interface Tile<CellValueType> {

    /** index of the tile on the canvas */
    readonly index: RowCol<number>;

    /** position on the canvas in px */
    readonly position: Point2D;

    /**
     * size of the tile (usually {@link Config#tileSize}, except for tiles on the edges of the canvas which are
     * smaller
     */
    readonly size: BoxSize;

    /** flag indicating, if the current tile is visible */
    readonly cells: Cell<CellValueType>[];

    /** flag indicating, if the current tile is visible */
    visible: boolean;

    /** the renderer, responsible for rendering the tile */
    renderer?: TileComponent<CellValueType>;
}

