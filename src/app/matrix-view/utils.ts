/**
 * General utils
 */

/**
 * General interface for box sizes.
 */
export interface BoxSize {
    /** width of th box */
    readonly width: number;
    /** height of th box */
    readonly height: number;
}

/**
 * General interface for 2D points.
 * The point is reference by top and left (and not x and y on purpose, since x any y is ambiguous w.r.t. the origin
 * of the coordinate system.
 */
export interface Point2D {
    /** offset from top */
    readonly top: number;
    /** offset from left */
    readonly left: number;
}

/**
 * General interface to refer to all sides of a box.
 */
export interface BoxSides<T> {
    readonly top: T;
    readonly left: T;
    readonly right: T;
    readonly bottom: T;
}

/**
 * General interface to refer to all corners of a box.
 */
export interface BoxCorners<T> {
    readonly topLeft: T;
    readonly topRight: T;
    readonly bottomRight: T;
    readonly bottomLeft: T;
}

/** interface to refer to all objects, that need to be stored for rows and cols. */
export interface RowsCols<T> {
    readonly rows: T;
    readonly cols: T;
}

/** interface to refer to all objects, that need to be stored for rows and cols. */
export interface RowCol<T> {
    readonly row: T;
    readonly col: T;
}
