/**
 * default values
 */
const defaults = {
    rowHeight: 20,
    colWidths: 40,
};

export class MatrixViewModel<CellType> {
    get rowModel(): RowModel<CellType> {
        return this._rowModel;
    }

    get colModel(): ColModel<CellType> {
        return this._colModel;
    }

    get cells(): CellType[][] {
        // TODO DST: in principle this must be immutable
        return this._cells;
    }

    set cells(value: CellType[][]) {
        // make a copy of the arrays, to avoid external changes
        this._cells = value.map((row: CellType[]) => [...row]);
        // reinitialize the col and row models
        this._colModel = new ColModel<CellType>(this);
        this._rowModel = new RowModel<CellType>(this);
    }

    private _cells: CellType[][] = [];
    private _colModel: ColModel<CellType> = new ColModel<CellType>(this);
    private _rowModel: RowModel<CellType> = new RowModel<CellType>(this);
}

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
declare type SizeProvider = number | number[] | ((modelIndex: number) => number);

export class ColModel<CellType> {

    private colWidths: number[];

    public updateColWidths(value: SizeProvider) {
        if (Number.isInteger(value as any)) {
            this.colWidths = new Array(this.size).fill(value);
        } else if (Array.isArray(value)) {
            this.colWidths = [...value];
        } else if (typeof value === 'function') {
            const size = this.size;
            this.colWidths = Array(size);
            for (let i = 0; i < size; i++) {
                this.colWidths[i] = value(i);
            }
        } else {
            throw  new Error('bad colHeight value, got: ' + value);
        }
    }

    constructor(private matrixViewModel: MatrixViewModel<CellType>) {
        // init colWidths at a default value
        this.colWidths = new Array(this.size).fill(defaults.colWidths);
    }

    /**
     * @return col height of the indexed col in px
     * @param modelIndex index of the col
     */
    colWidth(modelIndex: number): number {
        if (modelIndex === null || modelIndex === undefined || modelIndex < 0 || modelIndex > this.size) {
            throw new Error('bad modelIndex: ' + modelIndex);
        }
        return this.colWidths[modelIndex];
    }

    /**
     * @return {number} total with of all cols together in px;
     */
    get width(): number {
        return this.colWidths.reduce((previousValue, currentValue) => previousValue + currentValue, 0);
    }

    /**
     * Number of cols;
     */
    get size(): number {
        const cells = this.matrixViewModel.cells;
        // take length of first row, if any
        if (cells && cells.length > 0) {
            return cells[0].length;
        }
        return 0;
    }

}

export class RowModel<CellType> {

    private rowHeights: number[];

    public updateRowHeights(value: SizeProvider) {
        if (Number.isInteger(value as any)) {
            this.rowHeights = new Array(this.size).fill(value);
        } else if (Array.isArray(value)) {
            this.rowHeights = [...value];
        } else if (typeof value === 'function') {
            const size = this.size;
            this.rowHeights = Array(size);
            for (let i = 0; i < size; i++) {
                this.rowHeights[i] = value(i);
            }
        } else {
            throw new Error('bad rowHeight value, got: ' + value);
        }
    }

    constructor(private matrixViewModel: MatrixViewModel<CellType>) {
        // init rowHeights at a default value
        this.rowHeights = new Array(this.size).fill(defaults.rowHeight);
    }

    /**
     * @return row height of the indexed row in px
     * @param modelIndex index of the row
     */
    rowHeight(modelIndex: number): number {
        if (modelIndex === null || modelIndex === undefined || modelIndex < 0 || modelIndex > this.size) {
            throw new Error('bad modelIndex: ' + modelIndex);
        }
        return this.rowHeights[modelIndex];
    }

    /**
     * Number of rows;
     */
    get size(): number {
        const cells = this.matrixViewModel.cells;
        if (cells) {
            return cells.length;
        }
        return 0;
    }

    /**
     * @return {number} total height of all rows together in px;
     */
    get height(): number {
        return this.rowHeights.reduce((previousValue, currentValue) => previousValue + currentValue, 0);
    }
}
