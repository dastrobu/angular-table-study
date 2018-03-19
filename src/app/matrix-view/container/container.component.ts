import {
    AfterContentChecked,
    ChangeDetectionStrategy,
    Component,
    DoCheck,
    ElementRef,
    Input,
    OnChanges,
    OnDestroy,
    OnInit,
    SimpleChanges,
    ViewChild
} from '@angular/core';
import {MatrixViewConfig} from '../matrix-view-config';
import {Log} from '../log';
import {CellDirective} from '../directives/cell-directive';
import {BoxSize, flatten, Point2D, RowCol, RowsCols, Slice} from '../utils';
import {isInternetExplorer, scrollbarWidth} from '../browser';
import {Cell} from '../cell/cell';
import {Tile} from '../tile/tile';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'matrix-view-container',
    templateUrl: './container.component.html',
    styleUrls: ['./container.component.scss']
})
// TODO: merge everything into one input?
export class ContainerComponent<CellValueType> implements OnInit, OnChanges, DoCheck, AfterContentChecked, OnDestroy {
    // TODO DST: this will not be the correct scroll position for all areas
    private scrollPosition: Point2D = {left: 0, top: 0};
    private readonly log: Log = new Log(this.constructor.name + ':');

    constructor(public elementRef: ElementRef) {
    }

    private _cells: ReadonlyArray<ReadonlyArray<Cell<CellValueType>>> = [];

    get cells(): ReadonlyArray<ReadonlyArray<Cell<CellValueType>>> {
        return this._cells;
    }

    @Input()
    set cells(value: ReadonlyArray<ReadonlyArray<Cell<CellValueType>>>) {
        this.log.trace(() => `set cells(${JSON.stringify(value)})`);
        this._cells = value;
    }

    private _cellDirective: CellDirective<CellValueType>;

    get cellDirective(): CellDirective<CellValueType> {
        return this._cellDirective;
    }

    @Input()
    set cellDirective(value: CellDirective<CellValueType>) {
        this.log.trace(() => `set cellDirective(${value})`);
        this._cellDirective = value;
    }

    private _canvasSize: BoxSize;

    get canvasSize(): BoxSize {
        return this._canvasSize;
    }

    @Input()
    set canvasSize(value: BoxSize) {
        this.log.trace(() => `set canvasSize(${JSON.stringify(value)})`);
        this._canvasSize = value;
    }

    private _cellsSlice: RowsCols<Slice>;

    @ViewChild('canvas')
    public canvas: ElementRef;

    private _config: MatrixViewConfig;

    @Input()
    set config(value: MatrixViewConfig) {
        this._config = value;
        this.log.level = this._config.logLevel;
    }

    get cellsSlice(): RowsCols<Slice> {
        return this._cellsSlice;
    }

    @Input()
    set cellsSlice(value: RowsCols<Slice>) {
        this.log.trace(() => `set cellsSlice(${JSON.stringify(value)})`);
        this._cellsSlice = value;
    }

    get config(): MatrixViewConfig {
        return this._config;
    }

    private _tiles: ReadonlyArray<Tile<CellValueType>> = [];

    get tiles(): ReadonlyArray<Tile<CellValueType>> {
        this.log.trace(() => `get tiles`);
        return this._tiles;
    }

    /**
     * size of the viewport, i.e. the size of the container minus scrollbars, if any.
     */
    public get viewportSize(): BoxSize {
        const containerSize = this.size;

        if (!this.scrollable) {
            return containerSize;
        }

        let width: number;
        let height: number;
        // on IE the scrollbar width must not be subtracted, on Chrome and Firefox this is not required.
        if (isInternetExplorer) {
            width = containerSize.width;
            height = containerSize.height;
        } else {
            width = containerSize.width - scrollbarWidth;
            height = containerSize.height - scrollbarWidth;
        }
        const viewportSize = {width: width, height: height};

        this.log.trace(() => `get viewportSize() => ${JSON.stringify(viewportSize)}`);
        return viewportSize;
    }

    /**
     * size of the container (including scrollbars)
     */
    private get size(): BoxSize {
        const computedStyle = getComputedStyle(this.elementRef.nativeElement);
        let width = Number(computedStyle.width.replace('px', ''));
        let height = Number(computedStyle.height.replace('px', ''));
        if (this.scrollable) {
            // on Chrome and Firefox the scrollbar width must be added, on IE this is not required
            if (!isInternetExplorer) {
                width += scrollbarWidth;
                height += scrollbarWidth;
            }
        }
        this.log.trace(() => `get size() => ${JSON.stringify({width: width, height: height})}`);
        return {width: width, height: height};
    }

    private get scrollable(): boolean {
        const computedStyle = getComputedStyle(this.elementRef.nativeElement);
        const scrollable = computedStyle.overflow === 'scroll';
        this.log.trace(() => `get scrollable() => ${scrollable}`);
        return scrollable;
    }

    ngOnInit() {
        this.log.trace(() => `ngOnInit()`);
    }

    ngDoCheck() {
        this.log.trace(() => `ngDoCheck()`);
        // Tiles must be recomputed on changes, however, one should keep in mind, that at this stage in the
        // lifecycle child components do not exist and hence, the renderers cannot render the tiles yet.
        // All tiles are created in invisible state, visibility must be computed later.
        this.updateTiles();
        this.updateTileVisibility();
    }

    ngOnChanges(changes: SimpleChanges): void {
        this.log.debug(() => `ngOnChanges(...)`);
    }

    ngAfterContentChecked(): void {
        this.log.trace(() => `ngAfterContentChecked()`);
    }

    ngOnDestroy(): void {
        this.log.trace(() => `ngOnDestroy()`);
    }

    /**
     * update {@link Tile#visible visible} property, depending on the current {@link #tileRenderStrategy}.
     *
     * Note, this method does not have any side effects. The state of <pre>this</pre> is kept unchanged.
     *
     * @param scrollPosition scroll position of the viewport.
     * @return {Tile[]} array of tiles, where the {@link Tile#visible visible} property was updated.
     */
    public updateTileVisibility(scrollPosition?: Point2D): void {
        this.log.trace(() => `updateTileVisibility(${JSON.stringify(scrollPosition)})`);
        if (!scrollPosition) {
            scrollPosition = this.scrollPosition;
        } else {
            this.scrollPosition = scrollPosition;
        }


        const visibleTiles: ReadonlyArray<RowCol<number>> = this.config.tileRenderStrategy.getVisibleTiles(scrollPosition);
        this.log.debug(() => `visibleTiles: ${JSON.stringify(visibleTiles)}`);

        // map to row major flat indices
        const n = this._canvasSize.width / this.config.tileSize.width;
        const visibleTileRowMajorIndices: ReadonlyArray<number> = visibleTiles.map(index => {
            return index.row * n + index.col;
        });
        this.log.trace(() => `visibleTileRowMajorIndices: ${JSON.stringify(visibleTileRowMajorIndices)}`);

        const updatedTiles: Tile<CellValueType>[] = [];
        this._tiles.forEach(tile => {
            // TODO DST: lookup could be improved
            const index = tile.index;
            if (visibleTileRowMajorIndices.indexOf(index.row * n + index.col) === -1) {
                // tile should not be visible, check if it is currently visible
                // do check for false here explicitly, because initially visibility may be undefined.
                if (tile.visible !== false) {
                    this.log.trace(() => `hiding tile ${JSON.stringify(index)}`);
                    tile.visible = false;
                    updatedTiles.push(tile);
                }
            } else {
                // this tile should be rendered, check if it is visible already
                // do check for true here explicitly, because initially visibility may be undefined.
                if (tile.visible !== true) {
                    this.log.trace(() => `showing tile ${JSON.stringify(index)}`);
                    tile.visible = true;
                    updatedTiles.push(tile);
                }
            }
        });
        updatedTiles
            .filter(tile => tile.renderer)
            .forEach(tile => tile.renderer.detectChanges());
    }

    /** update the scroll position of the container */
    public scrollCanvasTo(scrollPosition: Point2D): void {
        this.log.trace(() => `scrollCanvasTo(${JSON.stringify(scrollPosition)}`);
        const canvas = this.canvas;
        if (!canvas) {
            return;
        }
        const nativeElement = canvas.nativeElement;
        nativeElement.style.top = scrollPosition.top + 'px';
        nativeElement.style.left = scrollPosition.left + 'px';
    }

    private updateTiles() {
        this.log.trace(() => `updateTiles()`);
        let cells = this._cells;
        const cellsSlice = this._cellsSlice;
        const rowSlice = cellsSlice.rows;
        const colSlice = cellsSlice.cols;
        cells = cells.slice(rowSlice.start, rowSlice.end).map(row => row.slice(colSlice.start, colSlice.end));
        this._tiles = flatten(this.createTiles(cells));
    }

    private createTiles(cells: ReadonlyArray<ReadonlyArray<Cell<CellValueType>>>): Tile<CellValueType>[][] {
        this.log.debug(() => `createTiles(${JSON.stringify(cells, null, 2)})`);
        const tileSize = this.config.tileSize;
        const tileWidth = tileSize.width;
        const tileHeight = tileSize.height;

        const canvasSize = this._canvasSize;
        if (!canvasSize) {
            throw new Error('canvasSize not set');
        }
        const canvasHeight = canvasSize.height;
        const canvasWidth = canvasSize.width;

        // there are m ✕ n tiles (m rows and n cols)
        const m = Math.ceil(canvasHeight / tileHeight);
        const n = Math.ceil(canvasWidth / tileWidth);

        // tiles as 2d array
        const tiles: Tile<CellValueType>[][] = [];
        for (let i = 0; i < m; ++i) {
            const tileRow: Tile<CellValueType>[] = [];
            for (let j = 0; j < n; j++) {
                const top = tileSize.height * i;
                const left = tileWidth * j;
                let height = tileHeight;
                let width = tileWidth;

                // special handling of tiles that are not full sized, because they lie at the boundaries.
                if (top + height > canvasHeight) {
                    height = canvasHeight - top;
                }

                if (left + width > canvasWidth) {
                    width = canvasWidth - left;
                }
                const tile: Tile<CellValueType> = {
                    index: {row: i, col: j},
                    position: {top: top, left: left},
                    size: {width: width, height: height},
                    cells: [],
                    visible: false,
                };
                tileRow.push(tile);
            }
            tiles.push(tileRow);
        }

        // iterate all cells and assign them to the tiles.
        cells.forEach(row => {
            row.forEach(cell => {
                const positionLeft = cell.position.left;
                const positionTop = cell.position.top;

                // compute tile in which the cell should be located
                // TODO DST: handle cells correctly, that overlap two or more tiles. Currently we simply assign to left tile.
                const i = Math.floor(positionTop / tileHeight);
                const j = Math.floor(positionLeft / tileWidth);
                tiles[i][j].cells.push(cell);
            });
        });
        // remove all tiles, that do not have any cells
        const filteredTiles = tiles.map(row => row.filter(tile => tile.cells.length > 0)).filter(row => row.length > 0);
        this.log.trace(() => `createTiles(...) => (${JSON.stringify(filteredTiles, null, 2)}`);
        return filteredTiles;
    }
}
