import {BoxSize, Point2D, RowCol} from '../utils';

/**
 * A cell objects wraps a cell value, and adds some metadata, like {@link #index}, {@link position} and {@link #size}
 */
export interface Cell<CellValueType> {

    /** index of the cell on the canvas */
    readonly index: RowCol<number>;

    /** cell value */
    readonly value: CellValueType;

    /** position of the cell (in px) */
    readonly position: Point2D;

    /** size of the cell (in px) */
    readonly size: BoxSize;
}
