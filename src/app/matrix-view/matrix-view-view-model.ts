/**
 * Implementatio of a view model for the matrix view.
 */
import {MatrixViewComponent} from './matrix-view.component';
import {Model} from './matrix-view-model';
import {Log} from './log';
import {Observable} from 'rxjs/Observable';
import {Subscription} from 'rxjs/Subscription';
import {Config} from './matrix-view-config';
import {BoxCorners, BoxSides, BoxSize, Point2D, RowCol} from './utils';
import {isInternetExplorer, scrollbarWidth} from './browser';
import {OnDestroy, OnInit} from '@angular/core';

/** cell representation */
export interface Cell<CellValueType> {
    readonly viewIndex: RowCol<number>;
    readonly modelIndex: RowCol<number>;
    readonly position: Point2D;
    readonly value: CellValueType;
    readonly size: BoxSize;
}

/** interface for a tile, which is employed to handle the virtual dom */
export interface Tile<CellValueType> {
    readonly viewIndex: RowCol<number>;
    readonly position: Point2D;
    readonly size: BoxSize;
    readonly cells: Cell<CellValueType>[];
    readonly rowMajorIndex: number;
}


/**
 * The view model provides all information on the view, i.e. especially size information on various parts of the matrix.
 * Note: the view model must not be modified externally.
 */
export class MatrixViewViewModel<CellValueType> implements OnInit, OnDestroy {
    private readonly log: Log = new Log(this.constructor.name + ':');
    private model: Model<CellValueType>;
    private config: Config;
    private _tileSize: BoxSize = {width: 0, height: 0};
    /** array of subscriptions, from which one must unsubscribe in {@link #ngOnDestroy}. */
    private readonly subscriptions: Subscription[] = [];

    /** scroll listener to synchronize scrolling on the main canvas and on the fixed areas. */
    private scrollListener: () => void;

    constructor(private matrixViewComponent: MatrixViewComponent<CellValueType>,
                configObservable: Observable<Config>,
                modelObservable: Observable<Model<CellValueType>>) {
        this.subscriptions.push(configObservable.subscribe(config => {
            this.config = config;
            if (!this.config) {
                throw new Error('no config given, got: ' + this.config);
            }

            // update log level
            this.log.level = config.logLevel;
        }));
        this.subscriptions.push(modelObservable.subscribe(model => {
            this.model = model;
        }));
    }

    /** @return {number} height of the top fixed area in px. */
    public get fixedTopHeight(): number {
        this.log.trace(() => `fixedTopHeight`);
        let nRowsFixedTop = this.showFixed.top;
        if (!nRowsFixedTop) {
            this.log.trace(() => 'fixedTopHeight => 0');
            return 0;
        }
        const rowModel = this.model.rowModel;
        let height = 0;
        const size = rowModel.size;
        nRowsFixedTop = Math.min(nRowsFixedTop, size);
        if (nRowsFixedTop > size) {
            this.log.debug(() => `reducing fixedTop from ${nRowsFixedTop} to ${size}`);
            nRowsFixedTop = size;
        }
        for (let i = 0; i < nRowsFixedTop; ++i) {
            height += rowModel.rowHeight(i);
        }
        this.log.trace(() => `fixedTopHeight => ${height}`);
        return height;
    }

    /** @return {number} height of the bottom fixed area in px. */
    public get fixedBottomHeight(): number {
        this.log.trace(() => `fixedBottomHeight`);
        let showFixedBottom = this.config.showFixed.bottom;
        if (!showFixedBottom) {
            this.log.trace(() => `fixedBottomHeight => 0`);
            return 0;
        }
        const rowModel = this.model.rowModel;
        let height = 0;
        const size = rowModel.size;
        if (showFixedBottom > size) {
            this.log.debug(() => `reducing showFixedLeft from ${showFixedBottom} to ${size}`);
            showFixedBottom = size;
        }
        for (let i = 0; i < showFixedBottom; ++i) {
            height += rowModel.rowHeight(size - 1 - i);
        }
        this.log.trace(() => `fixedBottomHeight => ${height}`);
        return height;
    }

    /** @return {number} width of the left fixed area in px. */
    public get fixedLeftWidth(): number {
        this.log.trace(() => `fixedLeftWidth`);
        let showFixedLeft = this.config.showFixed.left;
        if (!showFixedLeft) {
            this.log.trace(() => `fixedLeftWidth => 0`);
            return 0;
        }
        const colModel = this.model.colModel;
        let width = 0;
        const size = colModel.size;
        if (showFixedLeft > size) {
            this.log.debug(() => `reducing showFixedLeft from ${showFixedLeft} to ${size}`);
            showFixedLeft = size;
        }
        for (let i = 0; i < showFixedLeft; ++i) {
            width += colModel.colWidths[i];
        }
        this.log.trace(() => `fixedLeftWidth => ${width}`);
        return width;
    }

    /** @return {number} width of the right fixed area in px. */
    public get fixedRightWidth(): number {
        this.log.trace(() => 'fixedRightWidth');
        let showFixedRight = this.config.showFixed.right;
        if (!showFixedRight) {
            this.log.trace(() => `fixedRightWidth => 0`);
            return 0;
        }
        const colModel = this.model.colModel;
        let width = 0;
        const size = colModel.size;
        if (showFixedRight > size) {
            this.log.debug(() => `reducing showFixedRight from ${showFixedRight} to ${size}`);
            showFixedRight = size;
        }
        for (let i = 0; i < showFixedRight; ++i) {
            width += colModel.colWidths[size - 1 - i];
        }
        this.log.trace(() => `fixedRightWidth => ${width}`);
        return width;
    }

    /** offset of all right fixed areas. To be used to compute the transformations. */
    public get fixedRightOffset(): number {
        // TODO: check if this +1 is really needed...
        // add 1 pixel to account for a small offset, which leads to a one pixel gap on the right.
        return this.viewportSize.width - this.fixedRightWidth + 1;
    }

    /** offset of all bottom fixed areas. To be used to compute the transformations. */
    public get fixedBottomOffset(): number {
        return this.viewportSize.height - this.fixedBottomHeight;
    }

    /**
     * size of the container (including scrollbars)
     */
    public get containerSize(): BoxSize {
        this.log.trace(() => 'containerSize');
        const computedContainerStyle = getComputedStyle(this.matrixViewComponent.container.nativeElement);
        const width = Number(computedContainerStyle.width.replace('px', ''));
        const height = Number(computedContainerStyle.height.replace('px', ''));
        this.log.trace(() => `containerSize => ${JSON.stringify({width: width, height: height})}`);
        return {width: width, height: height};
    }

    /**
     * size of the viewport, i.e. the size of the container minus scrollbars, if any.
     */
    public get viewportSize(): BoxSize {
        this.log.trace(() => `viewportSize`);
        const containerSize = this.containerSize;

        let width: number;
        let height: number;
        // on IE the scrollbar with must not be subtracted, on Chrome and Firefox this is required.
        if (isInternetExplorer) {
            width = containerSize.width;
            height = containerSize.height;
        } else {
            width = containerSize.width - scrollbarWidth;
            height = containerSize.height - scrollbarWidth;
        }
        const viewportSize = {width: width, height: height};
        // TODO DST: make viewportSize observable, instead of passing it directly
        this.config.tileRenderStrategy.viewportSize = viewportSize;
        this.log.trace(() => `viewportSize => ${JSON.stringify(viewportSize)}`);
        return viewportSize;
    }

    /**
     * Size of the canvas to draw to.
     */
    public get canvasSize(): BoxSize {
        this.log.trace(() => `canvasSize`);
        const model = this.model;
        const width = model.colModel.width;
        const height = model.rowModel.height;
        // TODO DST: make viewportSize observable, instead of passing it directly
        const canvasSize = {width: width, height: height};
        this.config.tileRenderStrategy.canvasSize = canvasSize;
        this.log.trace(() => `canvasSize => ${JSON.stringify(canvasSize)}`);
        return canvasSize;
    }

    get tileSize(): BoxSize {
        return this._tileSize;
    }

    /**
     * @return {BoxSides<number>} information from the configuration of the table about displaying fixed areas.
     */
    public get showFixed(): BoxSides<number> {
        return this.config.showFixed;
    }

    /**
     * @return {BoxSides<number>} information from the configuration of the table about displaying fixed corners.
     */
    public get showFixedCorners(): BoxCorners<boolean> {
        return this.config.showFixedCorners;
    }

    /** @return {number} position of a certain row in px */
    public rowPosition(modelIndex: number): number {
        const n = this.model.rowModel.rowPositions[modelIndex];
        this.log.trace(() => `rowPosition(${modelIndex}) => ${n}`);
        return n;
    }

    /** @return {number} position of a certain col in px */
    public colPosition(modelIndex: number): number {
        const n = this.model.colModel.colPositions[modelIndex];
        this.log.trace(() => `colPosition(${modelIndex}) => ${n}`);
        return n;
    }


    /** @return {number} rowHeight of a certain row in px */
    public rowHeight(modelIndex: number): number {
        const n = this.model.rowModel.rowHeight(modelIndex);
        this.log.trace(() => `rowHeight(${modelIndex}) => ${n}`);
        return n;
    }

    /** @return {number} colWidth of a certain col in px */
    public colWidth(modelIndex: number): number {
        const n = this.model.colModel.colWidths[modelIndex];
        this.log.trace(() => `colWidth(${modelIndex}) => ${n}`);
        return n;
    }

    /** @return {number} number of cols fixed left */
    get fixedLeft(): number {
        const n = Math.min(this.config.showFixed.left, this.model.size.cols);
        this.log.trace(() => `fixedLeft => ${n}`);
        return n;
    }

    /** @return {number} number of cols fixed right */
    get fixedRight(): number {
        return Math.min(this.config.showFixed.right, this.model.size.cols);
    }

    /** @return {number} number of rows fixed at top */
    get fixedTop(): number {
        return Math.min(this.config.showFixed.top, this.model.size.rows);
    }

    /** @return {number} number of rows fixed at bottom */
    get fixedBottom(): number {
        return Math.min(this.config.showFixed.bottom, this.model.size.rows);
    }

    get scrollableCells(): ReadonlyArray<Cell<CellValueType>> {
        const size = this.model.size;
        const fixedTop = this.fixedTop;
        const fixedBottom = this.fixedBottom;
        const fixedLeft = this.fixedLeft;
        const fixedRight = this.fixedRight;
        const scrollableCells = [];
        // TODO DST: handle special case, where size.rows <= fixedBottom (for all fixed areas)
        this.model.cells
            .slice(this.fixedTop, size.rows - fixedBottom)
            .forEach((row, rowIndex) => {
                row.slice(fixedLeft, size.cols - fixedRight)
                    .forEach((cell, collIndex) => {
                        const i = rowIndex + fixedTop;
                        const j = collIndex + fixedLeft;
                        scrollableCells.push({
                            modelIndex: {row: i, col: j},
                            viewIndex: {row: i, col: j},
                            value: cell,
                            position: {top: this.rowPosition(i), left: this.colPosition(j)},
                            size: {height: this.rowHeight(i), width: this.colWidth(j)}
                        });
                    });
            });
        this.log.trace(() => `scrollableCells => ${JSON.stringify(scrollableCells)}`);
        return scrollableCells;
    }

    get fixedLeftCells(): ReadonlyArray<Cell<CellValueType>> {
        const fixedLeft = this.fixedLeft;
        const fixedLeftCells = [];
        this.model.cells
            .forEach((row, rowIndex) => {
                row.slice(0, fixedLeft)
                    .forEach((cell, collIndex) => {
                        const i = rowIndex;
                        const j = collIndex;
                        fixedLeftCells.push({
                            modelIndex: {row: i, col: j},
                            viewIndex: {row: i, col: j},
                            value: cell,
                            position: {top: this.rowPosition(i), left: this.colPosition(j)},
                            size: {height: this.rowHeight(i), width: this.colWidth(j)}
                        });
                    });
            });
        this.log.trace(() => `fixedLeftCells => ${JSON.stringify(fixedLeftCells)}`);
        return fixedLeftCells;
    }

    get fixedRightCells(): ReadonlyArray<Cell<CellValueType>> {
        const size = this.model.size;
        const fixedRight = this.fixedRight;
        const fixedRightCells = [];
        const offset = size.cols - fixedRight;
        this.model.cells
            .forEach((row, rowIndex) => {
                row.slice(offset)
                    .forEach((cell, collIndex) => {
                        const i = rowIndex;
                        const j = collIndex + offset;
                        fixedRightCells.push({
                            modelIndex: {row: i, col: j},
                            viewIndex: {row: i, col: j},
                            value: cell,
                            position: {top: this.rowPosition(i), left: this.colPosition(j)},
                            size: {height: this.rowHeight(i), width: this.colWidth(j)}
                        });
                    });
            });
        this.log.trace(() => `fixedRightCells => ${JSON.stringify(fixedRightCells)}`);
        return fixedRightCells;
    }

    get fixedTopCells(): ReadonlyArray<Cell<CellValueType>> {
        const size = this.model.size;
        const fixedTop = this.fixedTop;
        const fixedTopCells = [];
        this.model.cells
            .slice(0, size.rows - fixedTop)
            .forEach((row, rowIndex) => {
                row.forEach((cell, collIndex) => {
                    const i = rowIndex;
                    const j = collIndex;
                    fixedTopCells.push({
                        modelIndex: {row: i, col: j},
                        viewIndex: {row: i, col: j},
                        value: cell,
                        position: {top: this.rowPosition(i), left: this.colPosition(j)},
                        size: {height: this.rowHeight(i), width: this.colWidth(j)}
                    });
                });
            });
        this.log.trace(() => `fixedTopCells => ${JSON.stringify(fixedTopCells)}`);
        return fixedTopCells;
    }

    get fixedBottomCells(): ReadonlyArray<Cell<CellValueType>> {
        const size = this.model.size;
        const fixedBottom = this.fixedBottom;
        const fixedBottomCells = [];
        const offset = size.rows - fixedBottom;
        this.model.cells
            .slice(offset)
            .forEach((row, rowIndex) => {
                row.forEach((cell, collIndex) => {
                    const i = rowIndex + offset;
                    const j = collIndex;
                    fixedBottomCells.push({
                        modelIndex: {row: i, col: j},
                        viewIndex: {row: i, col: j},
                        value: cell,
                        position: {top: this.rowPosition(i), left: this.colPosition(j)},
                        size: {height: this.rowHeight(i), width: this.colWidth(j)}
                    });
                });
            });
        this.log.trace(() => `fixedBottomCells => ${JSON.stringify(fixedBottomCells)}`);
        return fixedBottomCells;
    }

    ngOnDestroy(): void {
        this.log.debug(() => `ngOnDestroy()`);
        // clean up the scroll listener
        if (this.scrollListener) {
            this.matrixViewComponent.container.nativeElement.removeEventListener('scroll', this.scrollListener);
        }
        if (this.subscriptions) {
            this.subscriptions.forEach(subscription => subscription.unsubscribe());
        }
    }

    /**
     * tile array, to which cells will be assigned. Tiles will only be rendered,
     * if they are visible in the viewport or close to them.
     */
    get scrollableTiles(): ReadonlyArray<Tile<CellValueType>> {
        const tileSize = this.config.tileSize;
        const tileWidth = tileSize.width;
        const tileHeight = tileSize.height;

        const canvasSize = this.canvasSize;
        const canvasHeight = canvasSize.height;
        const n = Math.ceil(canvasHeight / tileHeight);
        const canvasWidth = canvasSize.width;
        const m = Math.ceil(canvasWidth / tileWidth);
        // store number of tiles
        this._tileSize = {width: m, height: n};

        const flatTiles: Tile<CellValueType>[] = [];

        // tiles in row major order
        const tiles: Tile<CellValueType>[][] = [];
        for (let i = 0; i < n; i++) {
            const tileRow: Tile<CellValueType>[] = [];
            for (let j = 0; j < m; j++) {
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
                    viewIndex: {row: i, col: j},
                    position: {top: top, left: left},
                    // compute the row major flat index for lookup and comparison
                    rowMajorIndex: left + top * m,
                    size: {width: width, height: height},
                    cells: []
                };
                tileRow.push(tile);
                flatTiles.push(tile);
            }
            tiles.push(tileRow);
        }

        this.scrollableCells.forEach(cell => {
            const left = cell.position.left;
            const top = cell.position.top;

            // compute tile in which the cell should be located
            // TODO DST: handle cells correctly, that overlap two or more tiles. Currently we simply assign to left tile.
            const i = Math.floor(top / tileHeight);
            const j = Math.floor(left / tileWidth);

            tiles[i][j].cells.push(cell);
        });

        return flatTiles;
    }

    ngOnInit(): void {
        this.log.debug(() => `ngOnInit()`);
        const matrixViewComponent = this.matrixViewComponent;
        // to optimize performance, the scroll sync runs outside angular.
        // so one should be careful, what to do here, since there is not change detection running.
        matrixViewComponent.zone.runOutsideAngular(() => {
            const containerNativeElement = this.matrixViewComponent.container.nativeElement;
            this.scrollListener = () => {
                const scrollLeftPx = -containerNativeElement.scrollLeft + 'px';
                const scrollTopPx = -containerNativeElement.scrollTop + 'px';
                // to synchronize scroll there are several options.
                // 1. use translate3d(-scrollLeft px, 0, 0) and hope for a good GPU.
                //    This works well in Chrome, but not in IE und Firefox. The latter two browsers show a very bad
                //    performance.
                // 2. use scrollTo(scrollLeft, 0)
                //    This works well in Chrome and and Firefox, IE ignores the scrollTo call completely.
                // 3. use left = -scrollLeft px
                //    This works in all Browsers and scrolling performance is the best one of all three options.
                //    In Chrome performance is excellent, Firefox and IE show some lack for big data sets.

                const canvasTop = matrixViewComponent.canvasTop;
                if (canvasTop) {
                    canvasTop.nativeElement.style.left = scrollLeftPx;
                }
                const canvasBottom = matrixViewComponent.canvasBottom;
                if (canvasBottom) {
                    canvasBottom.nativeElement.style.left = scrollLeftPx;
                }
                const canvasLeft = matrixViewComponent.canvasLeft;
                if (canvasLeft) {
                    canvasLeft.nativeElement.style.top = scrollTopPx;
                }
                const canvasRight = matrixViewComponent.canvasRight;
                if (canvasRight) {
                    canvasRight.nativeElement.style.top = scrollTopPx;
                }

                // TODO DST: compute which tiles to render and trigger change detection on the tile component renderers

                // TODO DST: maybe one needs to optimize here, since computing the viewportSize may be expensive
                const n = this.tileSize.width;
                const visibleTiles: ReadonlyArray<number> = this.config.tileRenderStrategy.getVisibleTiles({
                    left: containerNativeElement.scrollLeft,
                    top: containerNativeElement.scrollTop
                })
                // map to row major flat indices
                    .map(viewIndex => viewIndex.row * n + viewIndex.col);

                this.matrixViewComponent.tileRenderers.forEach(renderer => {
                    if (visibleTiles.indexOf(renderer.tile.rowMajorIndex) !== -1) {
                        // tile should not be visible, check if it is currently visible
                        if (renderer.visible) {
                            renderer.visible = false;
                            renderer.changeDetectionRef.detectChanges();
                        }
                    } else {
                        if (!renderer.visible) {
                            renderer.visible = true;
                            renderer.changeDetectionRef.detectChanges();
                        }
                    }
                });
                // TODO DST: later compare, which tile where shown before and only trigger those, which where hidden before.

            };
            this.matrixViewComponent.container.nativeElement.addEventListener('scroll', this.scrollListener);
        });
    }
}


