import {Cell} from '../matrix-view-view-model';
import {BoxSize, Point2D, RowCol} from '../utils';

/** context definition for cell templates */
export interface CellTemplateContext<CellValueType> {
    /** @see Cell#value */
    readonly $implicit: CellValueType;

    /** @see Cell#index */
    readonly index: RowCol<number>;

    /** @see Cell#position */
    readonly position: Point2D;

    /** @see Cell#size */
    readonly size: BoxSize;
}
