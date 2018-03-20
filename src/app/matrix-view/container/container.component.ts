import {ChangeDetectionStrategy, Component, ElementRef, Input, OnChanges, OnInit, SimpleChanges, ViewChild} from '@angular/core';
import {MatrixViewConfig} from '../matrix-view-config';
import {Log} from '../log';
import {CellDirective} from '../directives/cell-directive';
import {BoxSize, flatten, Point2D, RowCol, RowsCols, Slice} from '../utils';
import {Cell} from '../cell/cell';
import {Tile} from '../tile/tile';
import * as _ from 'lodash';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'matrix-view-container',
    templateUrl: './container.component.html',
    styleUrls: ['./container.component.scss']
})
// TODO: merge everything into one input?
export class ContainerComponent<CellValueType> implements OnInit, OnChanges {
    private readonly log: Log = new Log(this.constructor.name + ':');

    @Input()
    public cells: ReadonlyArray<ReadonlyArray<Cell<CellValueType>>> = [];
    @Input()
    public tiles: ReadonlyArray<Tile<CellValueType>> = [];
    @Input()
    public scrollOffset: Point2D = {left: 0, top: 0};

    @Input()
    public viewportSize: BoxSize;
    @Input()
    public scrollPosition: Point2D = {left: 0, top: 0};

    @ViewChild('canvas')
    public canvas: ElementRef;
    @Input()
    public config: MatrixViewConfig;
    @Input()
    private canvasSize: BoxSize;
    @Input()
    private cellDirective: CellDirective<CellValueType>;
    @Input()
    private cellsSlice: RowsCols<Slice>;

    constructor(public elementRef: ElementRef) {
    }

    ngOnInit() {
        this.log.trace(() => `ngOnInit()`);
    }

    ngOnChanges(changes: SimpleChanges): void {
        this.log.trace(() => `ngOnChanges(${JSON.stringify(_.keys(changes))})`);

        // Tiles must be recomputed on changes, however, one should keep in mind, that at this stage in the
        // lifecycle child components do not exist and hence, the renderers cannot render the tiles yet.
        // All tiles are created in invisible state, visibility must be computed later.
        if ((changes.cells && !_.isEqual(changes.cells.currentValue, changes.cells.previousValue)) ||
            (changes.scrollOffset && !_.isEqual(changes.scrollOffset.currentValue, changes.scrollOffset.previousValue)) ||
            (changes.canvasSize && !_.isEqual(changes.canvasSize.currentValue, changes.canvasSize.previousValue)) ||
            (changes.viewportSize && !_.isEqual(changes.viewportSize.currentValue, changes.viewportSize.previousValue)) ||
            (changes.config && !_.isEqual(changes.config.currentValue.tileSize, changes.config.previousValue))
        ) {
            // TODO: this is also wrong, it must be done for the current scroll position
            if (!this.scrollable) {
                this.scrollCanvasTo({left: -this.scrollPosition.left, top: -this.scrollPosition.top});
            }
            this.updateTiles();
            // TODO: this causes setting the scroll position in the fixed areas back, which is not what we want - we need to account for the current scroll of the scrollable container
            this.updateTileVisibility({left: this.scrollPosition.left, top: this.scrollPosition.top});
        }
    }

    /** flag to indicate if the container is scrollable */
    get scrollable(): boolean {
        const computedStyle = getComputedStyle(this.elementRef.nativeElement);
        const scrollable = computedStyle.overflow === 'scroll';
        this.log.trace(() => `get scrollable() => ${scrollable}`);
        return scrollable;
    }

    /**
     * update {@link Tile#visible visible} property, depending on the current {@link #tileRenderStrategy}.
     *
     * Note, this method does not have any side effects. The state of <pre>this</pre> is kept unchanged.
     *
     * @param scrollPosition scroll position of the viewport.
     * @return {Tile[]} array of tiles, where the {@link Tile#visible visible} property was updated.
     */
    public updateTileVisibility(scrollPosition: Point2D): void {
        this.log.trace(() => `updateTileVisibility(${JSON.stringify(scrollPosition)})`);

        // add offset (non zero for fixed areas)
        const scrollOffset = this.scrollOffset;
        scrollPosition = {left: scrollOffset.left + scrollPosition.left, top: scrollOffset.top + scrollPosition.top};

        // TODO: validate this...
        // TODO: check if the reduced viewport size for the fixed areas works correctly...
        // TODO: optimize, recomputing the viewport size every time is overkill
        const viewportSize = this.viewportSize;
        const tileSize = this.config.tileSize;
        const canvasSize = this.canvasSize;

        const visibleTiles: ReadonlyArray<RowCol<number>> =
            this.config.tileRenderStrategy(scrollPosition, tileSize, canvasSize, viewportSize);
        this.log.debug(() => `visibleTiles: ${JSON.stringify(visibleTiles)}`);

        // map to row major flat indices
        const n = this.canvasSize.width / this.config.tileSize.width;
        const visibleTileRowMajorIndices: ReadonlyArray<number> = visibleTiles.map(index => {
            return index.row * n + index.col;
        });
        this.log.trace(() => `visibleTileRowMajorIndices: ${JSON.stringify(visibleTileRowMajorIndices)}`);

        const updatedTiles: Tile<CellValueType>[] = [];
        this.tiles.forEach(tile => {
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
        const scrollOffset = this.scrollOffset;
        scrollPosition = {left: scrollPosition.left - scrollOffset.left, top: scrollPosition.top - scrollOffset.top};
        const canvas = this.canvas;
        if (!canvas) {
            return;
        }
        const nativeElement = canvas.nativeElement;
        nativeElement.style.top = scrollPosition.top + 'px';
        nativeElement.style.left = scrollPosition.left + 'px';
    }

    private updateTiles() {
        this.log.debug(() => `updateTiles()`);
        let cells = this.cells;
        const cellsSlice = this.cellsSlice;
        const rowSlice = cellsSlice.rows;
        const colSlice = cellsSlice.cols;
        cells = cells.slice(rowSlice.start, rowSlice.end).map(row => row.slice(colSlice.start, colSlice.end));
        this.tiles = flatten(this.createTiles(cells));
    }

    private createTiles(cells: ReadonlyArray<ReadonlyArray<Cell<CellValueType>>>): Tile<CellValueType>[][] {
        this.log.trace(() => `createTiles(${JSON.stringify(cells, null, 2)})`);
        const tileSize = this.config.tileSize;
        const tileWidth = tileSize.width;
        const tileHeight = tileSize.height;

        const canvasSize = this.canvasSize;
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
