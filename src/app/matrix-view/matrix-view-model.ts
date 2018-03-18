/**
 * default values
 */
import {BoxSize, dimensionOf, RowsCols} from './utils';
import {defaults} from './matrix-view-config';
import {MatrixViewCell} from './matrix-view-cell/matrix-view-cell.component';

/**
 * Union type to set sizes on either rows or columns.
 * One can either define sizes via a single number, via an array or via a function, which maps a size to each
 * index.
 * The last variant, is helpful, to define e.g. two different sizes, one for the header row and one for all other.
 * In this case, one could pass
 * <pre>
 *     (index: number) => { index == 0 ? 25px : 20px }
 * </pre>
 */
export declare type SizeProvider = number | ReadonlyArray<number> | ((index: number) => number);

/**
 * Model of the matrix.
 */
export interface MatrixViewModel<CellValueType> {
    readonly cellValues: ReadonlyArray<ReadonlyArray<CellValueType>>;
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
    public cells: ReadonlyArray<ReadonlyArray<MatrixViewCell<CellValueType>>> = [];
    private _cellsValues: CellValueType[][] = [];

    constructor(matrixViewModel?: MatrixViewModel<CellValueType>) {
        // make a copy of the arrays, to avoid external changes
        if (matrixViewModel) {
            this._cellsValues = matrixViewModel.cellValues.map((row: CellValueType[]) => [...row]);
            const size = dimensionOf(this._cellsValues);
            this.colModel = new ColModel<CellValueType>(matrixViewModel.colModel, size.cols);
            this.rowModel = new RowModel<CellValueType>(matrixViewModel.rowModel, size.rows);
            // TODO: canvas size must be written to renderer strategy
            // TODO: must update canvas size, if col witdth or row heights change
            this._canvasSize = this.computeCanvasSize();
            this.cells = this.createCells();
        }
    }

    private _canvasSize: BoxSize = {width: 0, height: 0};

    /**
     * Size of the canvas to draw to.
     */
    public get canvasSize(): BoxSize {
        return this._canvasSize;
    }

    get cellValues(): ReadonlyArray<ReadonlyArray<CellValueType>> {
        return this._cellsValues;
    }

    get dimension(): RowsCols<number> {
        return dimensionOf(this.cells);
    }

    /** @return {number} rowHeight of a certain row in px */
    public rowHeight(index: number): number {
        return this.rowModel.rowHeight(index);
    }

    /** @return {number} colWidth of a certain col in px */
    public colWidth(index: number): number {
        return this.colModel.colWidths[index];
    }

    /** @return {number} position of a certain row in px */
    public rowPosition(index: number): number {
        const n = this.rowModel.rowPositions[index];
        if (!Number.isFinite(n)) {
            throw new Error(`bad rowPosition for index: ${index}`);
        }
        return n;
    }

    /** @return {number} position of a certain col in px */
    public colPosition(index: number): number {
        const n = this.colModel.colPositions[index];
        if (!Number.isFinite(n)) {
            throw new Error(`bad colPosition for index: ${index}`);
        }
        return n;
    }

    private computeCanvasSize() {
        const width = this.colModel.width;
        const height = this.rowModel.height;
        // TODO DST: make viewportSize observable, instead of passing it directly
        return {width: width, height: height};
    }

    /** create cells from cell values */
    private createCells(): MatrixViewCell<CellValueType>[][] {
        // TODO: if row or col sizes change, the cells must be updated
        const cells: MatrixViewCell<CellValueType>[][] = [];
        this.cellValues
            .forEach((row, rowIndex) => {
                const cellRow: MatrixViewCell<CellValueType>[] = [];
                row.forEach((cellValue, collIndex) => {
                    cellRow.push({
                        index: {row: rowIndex, col: collIndex},
                        value: cellValue,
                        position: {top: this.rowPosition(rowIndex), left: this.colPosition(collIndex)},
                        size: {height: this.rowHeight(rowIndex), width: this.colWidth(collIndex)}
                    });
                });
                cells.push(cellRow);
            });
        return cells;
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
            for (let i = 0; i < size; ++i) {
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

    /** @return {number} width of the left fixed area in px. */
    public fixedLeftWidth(fixedCols: number): number {
        if (!fixedCols) {
            return 0;
        }
        const size = this.size;
        if (fixedCols > size) {
            fixedCols = size;
        }
        let width = 0;
        for (let i = 0; i < fixedCols; ++i) {
            width += this.colWidths[i];
        }
        return width;
    }

    /** @return {number} width of the right fixed area in px. */
    public fixedRightWidth(fixedCols: number): number {
        if (!fixedCols) {
            return 0;
        }
        const size = this.size;
        if (fixedCols > size) {
            fixedCols = size;
        }
        let width = 0;
        for (let i = 0; i < fixedCols; ++i) {
            width += this.colWidths[size - 1 - i];
        }
        return width;
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
            for (let i = 0; i < size; ++i) {
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
     * @param index index of the row
     */
    rowHeight(index: number): number {
        if (index === null || index === undefined || index < 0 || index > this.size) {
            throw new Error(`bad index: ${index}`);
        }
        return this._rowHeights[index];
    }

    /** @return {number} width of the top fixed area in px. */
    public fixedTopHeight(fixedRows: number): number {
        if (!fixedRows) {
            return 0;
        }
        const size = this.size;
        if (fixedRows > size) {
            fixedRows = size;
        }
        let height = 0;
        for (let i = 0; i < fixedRows; ++i) {
            height += this.rowHeight[i];
        }
        return height;
    }

    /** @return {number} width of the bottom fixed area in px. */
    public fixedBottomHeight(fixedRows: number): number {
        if (!fixedRows) {
            return 0;
        }
        const size = this.size;
        if (fixedRows > size) {
            fixedRows = size;
        }
        let height = 0;
        for (let i = 0; i < fixedRows; ++i) {
            height += this.rowHeight[size - 1 - i];
        }
        return height;
    }
}
