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

/**
 * Note: all inner arrays must have the same length!
 *
 * @param array2d the array to compute the dimension for, i.e. number of rows and cols.
 * @return {{rows: number, cols: number}} dimension of a 2d array */
export function dimensionOf(array2d: ReadonlyArray<ReadonlyArray<any>>): RowsCols<number> {
    // take length of first row, if any
    if (array2d.length > 0) {
        return {rows: array2d.length, cols: array2d[0].length};
    }
    return {rows: 0, cols: 0};
}

/**
 * Flatten a 2d array.
 * Note: all inner arrays must have the same length!
 * @param array2d a 2D array to flatten.
 * @return {{rows: number, cols: number}} flattened (row major order) array
 */
export function flatten<T>(array2d: ReadonlyArray<ReadonlyArray<T>>): ReadonlyArray<T> {
    if (array2d.length === 0) {
        return [];
    }
    const dim = dimensionOf(array2d);
    // reserve memory ot once
    const flatArray = new Array(dim.rows * dim.cols);
    // copy in loop... currently it is not quite clear what the most efficient way of flattening an array is.
    for (let i = 0; i < dim.rows; ++i) {
        const row = array2d[i];
        const k = dim.cols * i;
        for (let j = 0; j < dim.cols; ++j) {
            flatArray[j + k] = row[j];
        }
    }
    return flatArray;
}
