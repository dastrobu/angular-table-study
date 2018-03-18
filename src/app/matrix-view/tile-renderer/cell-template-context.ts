import {BoxSize, Point2D, RowCol} from '../utils';

/** context definition for cell templates */
export interface CellTemplateContext<CellValueType> {
    /** @see MatrixViewCell#value */
    readonly $implicit: CellValueType;

    /** @see MatrixViewCell#index */
    readonly index: RowCol<number>;

    /** @see MatrixViewCell#position */
    readonly position: Point2D;

    /** @see MatrixViewCell#size */
    readonly size: BoxSize;
}
