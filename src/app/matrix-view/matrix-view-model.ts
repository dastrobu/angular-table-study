/**
 * default values
 */
import {RowsCols} from './utils';
import {defaults} from './matrix-view-config';

/**
 * Union type to set sizes on either rows or columns.
 * One can either define sizes via a single number, via an array or via a function, which maps a size to each
 * modelIndex.
 * The last variant, is helpful, to define e.g. two different sizes, one for the header row and one for all other.
 * In this case, one could pass
 * <pre>
 *     (modelIndex: number) => { modelIndex == 0 ? 25px : 20px }
 * </pre>
 */
export declare type SizeProvider = number | ReadonlyArray<number> | ((modelIndex: number) => number);

/**
 * Model of the matrix.
 */
export interface MatrixViewModel<CellValueType> {
    readonly cells: ReadonlyArray<ReadonlyArray<CellValueType>>;
    readonly rowModel?: MatrixViewRowModel<CellValueType>;
    readonly colModel?: MatrixViewColModel<CellValueType>;
}

/**
 * Model of column properties.
 */
export interface MatrixViewColModel<CellValueType> {
    readonly colWidths: SizeProvider;
}

/**
 * Model of row properties.
 */
export interface MatrixViewRowModel<CellValueType> {
    readonly rowHeights: SizeProvider;
}

export class Model<CellValueType> implements MatrixViewModel<CellValueType> {

    readonly colModel: ColModel<CellValueType> = new ColModel<CellValueType>();
    readonly rowModel: RowModel<CellValueType> = new RowModel<CellValueType>();

    constructor(matrixViewModel?: MatrixViewModel<CellValueType>) {
        // make a copy of the arrays, to avoid external changes
        if (matrixViewModel) {
            this._cells = matrixViewModel.cells.map((row: CellValueType[]) => [...row]);
            const size = this.size;
            this.colModel = new ColModel<CellValueType>(matrixViewModel.colModel, size.cols);
            this.rowModel = new RowModel<CellValueType>(matrixViewModel.rowModel, size.rows);
        }
    }

    private _cells: CellValueType[][] = [];

    get cells(): ReadonlyArray<ReadonlyArray<CellValueType>> {
        // TODO DST: in principle this must be immutable
        return this._cells;
    }

    get size(): RowsCols<number> {
        // take length of first row, if any
        let n = 0;
        let m = 0;
        const cells = this._cells;
        if (cells.length > 0) {
            n = cells.length;
            m = cells[0].length;
        }
        return {rows: n, cols: m};
    }
}

export class ColModel<CellValueType> implements MatrixViewColModel<CellValueType> {
    constructor(viewColModel?: MatrixViewColModel<CellValueType>, private _size: number = 0) {
        // init colWidths at a default value
        if (viewColModel) {
            this.updateColWidths(viewColModel.colWidths);
        } else {
            this.updateColWidths(new Array(this._size).fill(defaults.colWidth));
        }
    }

    private _colWidths: number[];
    private _colPositions: number[] = [];

    /** @return {number[]} widths (by model index) of all cols in px */
    get colWidths(): ReadonlyArray<number> {
        return this._colWidths;
    }

    /**
     * @return {number} total with of all cols together in px;
     */
    get width(): number {
        return this._colWidths.reduce((previousValue, currentValue) => previousValue + currentValue, 0);
    }

    /**
     * Number of cols;
     */
    get size(): number {
        return this._size;
    }

    public updateColWidths(value: SizeProvider) {
        if (Number.isInteger(value as any)) {
            this._colWidths = new Array(this.size).fill(value);
        } else if (Array.isArray(value)) {
            this._colWidths = [...value];
        } else if (typeof value === 'function') {
            const size = this.size;
            this._colWidths = Array(size);
            for (let i = 0; i < size; i++) {
                this._colWidths[i] = value(i);
            }
        } else {
            throw  new Error(`bad colHeight value, got: ${value}`);
        }
        this.updateColPositions();
    }

    /** @return {number[]} positions (by model index) of all cols in px */
    get colPositions(): ReadonlyArray<number> {
        return this._colPositions;
    }


    private updateColPositions() {
        this._colPositions = [];
        this._colWidths.reduce((pos, width) => {
            this._colPositions.push(pos);
            pos = pos + width;
            return pos;
        }, 0);
    }
}

export class RowModel<CellValueType> implements MatrixViewRowModel<CellValueType> {
    constructor(viewRowModel?: MatrixViewRowModel<CellValueType>, private _size: number = 0) {
        // init rowWidths at a default value
        if (viewRowModel) {
            this.updateRowHeights(viewRowModel.rowHeights);
        } else {
            this.updateRowHeights(new Array(this.size).fill(defaults.rowHeight));
        }
    }

    private _rowHeights: number[];
    private _rowPositions: number[];

    /** @return {number[]} heights (by model index) of all rows in px */
    get rowHeights(): ReadonlyArray<number> {
        return this._rowHeights;
    }

    /**
     * Number of rows;
     */
    get size(): number {
        return this._size;
    }

    /**
     * @return {number} total height of all rows together in px;
     */
    get height(): number {
        return this._rowHeights.reduce((previousValue, currentValue) => previousValue + currentValue, 0);
    }

    public updateRowHeights(value: SizeProvider) {
        if (Number.isInteger(value as any)) {
            this._rowHeights = new Array(this.size).fill(value);
        } else if (Array.isArray(value)) {
            this._rowHeights = [...value];
        } else if (typeof value === 'function') {
            const size = this.size;
            this._rowHeights = Array(size);
            for (let i = 0; i < size; i++) {
                this._rowHeights[i] = value(i);
            }
        } else {
            throw new Error(`bad rowHeight value, got: ${value}`);
        }
        this.updateRowPositions();
    }

    /** @return {number[]} positions (by model index) of all rows in px */
    get rowPositions(): ReadonlyArray<number> {
        return this._rowPositions;
    }

    private updateRowPositions() {
        this._rowPositions = [];
        this._rowHeights.reduce((pos, height) => {
            this._rowPositions.push(pos);
            pos = pos + height;
            return pos;
        }, 0);
    }

    /**
     * @return row height of the indexed row in px
     * @param modelIndex index of the row
     */
    rowHeight(modelIndex: number): number {
        if (modelIndex === null || modelIndex === undefined || modelIndex < 0 || modelIndex > this.size) {
            throw new Error(`bad modelIndex: ${modelIndex}`);
        }
        return this._rowHeights[modelIndex];
    }
}
