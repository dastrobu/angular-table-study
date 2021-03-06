import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ContentChild,
    ElementRef,
    EventEmitter,
    Input,
    NgZone,
    OnChanges,
    OnDestroy,
    OnInit,
    Output,
    SimpleChanges,
    TemplateRef,
    ViewChild
} from '@angular/core';
import {MatrixViewModel, Model} from './matrix-view-model';
import {Config, MatrixViewConfig} from './matrix-view-config';
import {Log} from './log';
import {Observable} from 'rxjs/Observable';
import {Subscription} from 'rxjs/Subscription';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {MatrixViewCellDirective} from './directives/matrix-view-cell.directive';
import {MatrixViewFixedCellDirective} from './directives/matrix-view-fixed-cell.directive';
import {MatrixViewFixedTopCellDirective} from './directives/matrix-view-fixed-top-cell.directive';
import {MatrixViewFixedLeftCellDirective} from './directives/matrix-view-fixed-left-cell.directive';
import {MatrixViewFixedBottomCellDirective} from './directives/matrix-view-fixed-bottom-cell.directive';
import {MatrixViewFixedRightCellDirective} from './directives/matrix-view-fixed-right-cell.directive';
import {MatrixViewFixedBottomLeftCornerDirective} from './directives/matrix-view-fixed-bottom-left-corner.directive';
import {MatrixViewFixedTopRightCornerDirective} from './directives/matrix-view-fixed-top-right-corner.directive';
import {MatrixViewFixedTopLeftCornerDirective} from './directives/matrix-view-fixed-top-left-corner.directive';
import {MatrixViewFixedBottomRightCornerDirective} from './directives/matrix-view-fixed-bottom-right-corner.directive';
import {MatrixViewFixedCornerDirective} from './directives/matrix-view-fixed-corner.directive';
import {Cell, CellEventEmitter, MouseCellEvent} from './cell/cell';
import {BoxSides, BoxSize, Point2D, RowsCols, Slice} from './utils';
import {ContainerComponent} from './container/container.component';
import {isInternetExplorer, scrollbarWidth} from './browser';

// TODO: use NgOnChanges for config and model changes?
// TODO: see https://angular.io/guide/component-interaction#intercept-input-property-changes-with-ngonchanges


@Component({
    // TODO DST: if we use onPush we must make sure, that the inputs are immutable... this is currently not the case.
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'matrix-view',
    templateUrl: './matrix-view.component.html',
    styleUrls: ['./matrix-view.component.scss']
})
export class MatrixViewComponent<CellValueType> implements OnInit, OnDestroy, OnChanges {
    private readonly log: Log = new Log(this.constructor.name + ':');

    /** array of subscriptions, from which one must unsubscribe in {@link #ngOnDestroy}. */
    private readonly subscriptions: Subscription[] = [];

    @ViewChild('scrollableContainer')
    public scrollableContainer: ContainerComponent<CellValueType>;

    @ViewChild('fixedTopRight')
    public fixedTopRight: ElementRef;

    @ViewChild('fixedBottomRight')
    public fixedBottomRight: ElementRef;

    @ViewChild('fixedBottomLeft')
    public fixedBottomLeft: ElementRef;

    @ViewChild('fixedTopLeft')
    public fixedTopLeft: ElementRef;

    @ViewChild('fixedTopContainer')
    public fixedTopContainer: ContainerComponent<CellValueType>;

    @ViewChild('fixedRightContainer')
    public fixedRightContainer: ContainerComponent<CellValueType>;

    @ViewChild('fixedBottomContainer')
    public fixedBottomContainer: ContainerComponent<CellValueType>;

    @ViewChild('fixedLeftContainer')
    public fixedLeftContainer: ContainerComponent<CellValueType>;

    /** scroll listener to synchronize scrolling on the main canvas and on the fixed areas. */
    private scrollListener: () => void;

    @ContentChild(MatrixViewCellDirective)
    cellDirective: MatrixViewCellDirective<CellValueType>;

    @ContentChild(MatrixViewFixedCellDirective)
    fixedCellDirective: MatrixViewFixedCellDirective<CellValueType>;

    @ContentChild(MatrixViewFixedTopCellDirective)
    fixedTopCellDirective: MatrixViewFixedTopCellDirective<CellValueType>;

    @ContentChild(MatrixViewFixedRightCellDirective)
    fixedRightCellDirective: MatrixViewFixedRightCellDirective<CellValueType>;

    @ContentChild(MatrixViewFixedBottomCellDirective)
    fixedBottomCellDirective: MatrixViewFixedBottomCellDirective<CellValueType>;

    @ContentChild(MatrixViewFixedLeftCellDirective)
    fixedLeftCellDirective: MatrixViewFixedLeftCellDirective<CellValueType>;

    @ContentChild(MatrixViewFixedCornerDirective)
    fixedCornerDirective: MatrixViewFixedCornerDirective;

    @ContentChild(MatrixViewFixedTopLeftCornerDirective)
    fixedTopLeftDirective: MatrixViewFixedTopLeftCornerDirective;

    @ContentChild(MatrixViewFixedTopRightCornerDirective)
    fixedTopRightDirective: MatrixViewFixedTopRightCornerDirective;

    @ContentChild(MatrixViewFixedBottomLeftCornerDirective)
    fixedBottomLeftDirective: MatrixViewFixedBottomLeftCornerDirective;

    @ContentChild(MatrixViewFixedBottomRightCornerDirective)
    fixedBottomRightDirective: MatrixViewFixedBottomRightCornerDirective;

    /** @see #viewportSize */
    private _viewportSize: BoxSize;

    /** size of the viewport, i.e. size fo the container minus the scroll bar widths, if any */
    get viewportSize(): BoxSize {
        if (!this._viewportSize) {
            this.updateViewportSize();
        }
        return this._viewportSize;
    }

    /** @see #scrollPosition */
    private _scrollPosition: Point2D;

    constructor(public changeDetectorRef: ChangeDetectorRef,
                public zone: NgZone) {
    }

    /**
     * Current scroll position of the scrollable canvas
     * One should note that this property is not updated on scrolling, to avoid change detection on every scroll event.
     * Change detection on scrolling is triggered manually.
     */
    public get scrollPosition(): Point2D {
        if (!this._scrollPosition) {
            this.updateScrollPosition();
        }
        return this._scrollPosition;
    }

    /** the model of the matrix. */
    private _model: BehaviorSubject<Model<CellValueType>> = new BehaviorSubject<Model<CellValueType>>(new Model<CellValueType>());

    /** @see #fixed */
    private _fixed: BoxSides<{ size: BoxSize, offset: Point2D, slice: RowsCols<Slice>, scrollOffset: Point2D }>;

    /** configuration values for the fixed areas */
    get fixed(): BoxSides<{ size: BoxSize, offset: Point2D, slice: RowsCols<Slice>, scrollOffset: Point2D }> {
        return this._fixed;
    }

    /** @see #scrollableSlice */
    private _scrollableSlice: RowsCols<Slice>;

    /** the slice of rows and cols to display on the scrollable canvas. */
    get scrollableSlice(): RowsCols<Slice> {
        return this._scrollableSlice;
    }

    @Input()
    set config(configObservable: Observable<MatrixViewConfig>) {
        // TODO DST: we mus explicitly store the observable and cleanup the subscription if a new observable is passed
        this.subscriptions.push(configObservable.subscribe(config => {
            this._config.next(new Config(config));
            // recompute fixed on changes
            this.updateScrollPosition();
            this.updateFixed();
            this.changeDetectorRef.markForCheck();
        }));
    }

    /**
     * The full config object contains detailed configuration properties for the whole table. It must not be changed
     * externally.
     * @see #config
     * @type {Config}
     */
    private _config: BehaviorSubject<Config> = new BehaviorSubject<Config>(new Config());

    /** @see Model#cells */
    get cells(): ReadonlyArray<ReadonlyArray<Cell<CellValueType>>> {
        return this._model.value.cells;
    }

    get currentConfig(): MatrixViewConfig {
        return this._config.value;
    }

    /** @see Model#canvasSize */
    public get canvasSize(): BoxSize {
        return this._model.value.canvasSize;
    }

    @Output()
    public clickCell = new EventEmitter<MouseCellEvent<CellValueType>>();

    @Output()
    public contextmenuCell = new EventEmitter<MouseCellEvent<CellValueType>>();

    @Output()
    public dblclickCell = new EventEmitter<MouseCellEvent<CellValueType>>();

    @Output()
    public mousedownCell = new EventEmitter<MouseCellEvent<CellValueType>>();

    @Output()
    public mouseenterCell = new EventEmitter<MouseCellEvent<CellValueType>>();

    @Output()
    public mouseleaveCell = new EventEmitter<MouseCellEvent<CellValueType>>();

    @Output()
    public mousemoveCell = new EventEmitter<MouseCellEvent<CellValueType>>();

    @Output()
    public mouseoverCell = new EventEmitter<MouseCellEvent<CellValueType>>();

    @Output()
    public mouseoutCell = new EventEmitter<MouseCellEvent<CellValueType>>();

    @Output()
    public mouseupCell = new EventEmitter<MouseCellEvent<CellValueType>>();

    public cellEventEmitter: CellEventEmitter<CellValueType> = {
        click: this.clickCell,
        contextmenu: this.contextmenuCell,
        dblclick: this.dblclickCell,
        mousedown: this.mousedownCell,
        mouseenter: this.mouseenterCell,
        mouseleave: this.mouseleaveCell,
        mousemove: this.mousemoveCell,
        mouseover: this.mouseoverCell,
        mouseout: this.mouseoutCell,
        mouseup: this.mouseupCell,
    };

    /**
     * The model must be passed as input. The model is treated as immutable, i.e. changes to the model will not be
     * reflected in the table directly. Instead, a new model must be passed through the observable.
     * @param {MatrixViewModel} modelObservable
     */
    @Input()
    set model(modelObservable: Observable<MatrixViewModel<CellValueType>>) {
        // TODO DST: we mus explicitly store the observable and cleanup the subscription if a new observable is passed
        this.subscriptions.push(modelObservable.subscribe(model => {
            if (!model) {
                this.log.debug(() => `replacing undefined model by empty model`);
                model = new Model<CellValueType>();
            }
            // call copy constructor, to address mutability
            this._model.next(new Model<CellValueType>(model));
            this.log.debug(() =>
                `initialized new model with size: ${JSON.stringify(this._model.value.dimension)})
                    colModel.size: ${this._model.value.colModel.size}
                    colWidths: ${this._model.value.colModel.colWidths}
                    colPositions: ${this._model.value.colModel.colPositions}
                    rowHeights: ${this._model.value.rowModel.rowHeights}
                    rowPositions: ${this._model.value.rowModel.rowPositions}`);
            this.updateScrollPosition();
            this.updateFixed();
            this.changeDetectorRef.markForCheck();
        }));
    }

    ngOnChanges(changes: SimpleChanges): void {
        this.log.debug(() => `ngOnChanges(...)`);
    }

    /**
     * Template for fixed corner.
     * If not set, {@link #fixedCornerTemplate} will be employed.
     */
    public get fixedTopLeftTemplate(): TemplateRef<any> {
        return this.fixedTopLeftDirective ? this.fixedTopLeftDirective.template : this.fixedCornerTemplate;
    }

    /**
     * Template for fixed corner.
     * If not set, {@link #fixedCornerTemplate} will be employed.
     */
    public get fixedTopRightTemplate(): TemplateRef<any> {
        return this.fixedTopRightDirective ? this.fixedTopRightDirective.template : this.fixedCornerTemplate;
    }

    /**
     * Template for fixed corner.
     * If not set, {@link #fixedCornerTemplate} will be employed.
     */
    public get fixedBottomLeftTemplate(): TemplateRef<any> {
        return this.fixedBottomLeftDirective ? this.fixedBottomLeftDirective.template : this.fixedCornerTemplate;
    }

    /**
     * Template for fixed corner.
     * If not set, {@link #fixedCornerTemplate} will be employed.
     */
    public get fixedBottomRightTemplate(): TemplateRef<any> {
        return this.fixedBottomRightDirective ? this.fixedBottomRightDirective.template : this.fixedCornerTemplate;
    }

    /**
     * Style for fixed corner.
     * If not set, {@link #fixedCornerStyle} will be employed.
     */
    public get fixedTopLeftStyle(): { [key: string]: string; } {
        return this.fixedTopLeftDirective ? this.fixedTopLeftDirective.style : this.fixedCornerStyle;
    }

    /**
     * Style for fixed corner.
     * If not set, {@link #fixedCornerStyle} will be employed.
     */
    public get fixedTopRightStyle(): { [key: string]: string; } {
        return this.fixedTopRightDirective ? this.fixedTopRightDirective.style : this.fixedCornerStyle;
    }

    /**
     * Style for fixed corner.
     * If not set, {@link #fixedCornerStyle} will be employed.
     */
    public get fixedBottomLeftStyle(): { [key: string]: string; } {
        return this.fixedBottomLeftDirective ? this.fixedBottomLeftDirective.style : this.fixedCornerStyle;
    }

    /**
     * Style for fixed corner.
     * If not set, {@link #fixedCornerStyle} will be employed.
     */
    public get fixedBottomRightStyle(): { [key: string]: string; } {
        return this.fixedBottomRightDirective ? this.fixedBottomRightDirective.style : this.fixedCornerStyle;
    }

    /**
     * Template for fixed corners.
     * If any of the more specific templates is set:
     * {@link #fixedTopLeftTemplate}
     * {@link #fixedTopRight}
     * {@link #fixedBottomLeftTemplate}
     * {@link #fixedBottomRight}
     * this template will be employed for the specific corner instead.
     */
    private get fixedCornerTemplate(): TemplateRef<any> {
        return this.fixedCornerDirective ? this.fixedCornerDirective.template : undefined;
    }

    /**
     * Style for fixed corners.
     * If any of the more specific styles is set:
     * {@link #fixedTopLeftStyle}
     * {@link #fixedTopRight}
     * {@link #fixedBottomLeftStyle}
     * {@link #fixedBottomRight}
     * this style will be employed for the specific corner instead.
     */
    private get fixedCornerStyle(): { [key: string]: string; } {
        return this.fixedCornerDirective ? this.fixedCornerDirective.style : undefined;
    }

    ngOnDestroy(): void {
        this.log.debug(() => `ngOnDestroy()`);
        // clean up the scroll listener
        if (this.scrollListener) {
            this.scrollableContainer.elementRef.nativeElement.removeEventListener('scroll', this.scrollListener);
        }
        // unsubscribe from all observables
        this.subscriptions.forEach(subscription => subscription.unsubscribe());
    }

    ngOnInit() {
        this.log.debug(() => `ngOnInit()`);
        if (!this._model) {
            throw new Error('model is required');
        }

        // to optimize performance, the scroll sync runs outside angular.
        // so one should be careful, what to do here, since there is not change detection running.
        // TODO: this must be deactivated for proper hover event handling, if it is kept inside the zone, one could also use the angular way of attaching the listener
        // this.zone.runOutsideAngular(() => {
            this.scrollListener = () => {
                this.updateTileVisibility();
            };
            this.scrollableContainer.elementRef.nativeElement.addEventListener('scroll', this.scrollListener);
        // });
    }

    /**
     * size of the viewport, i.e. the size of the container minus scrollbars, if any.
     */
    public updateViewportSize(): BoxSize {
        const containerSize = this.scrollableContainerSize;

        if (!this.scrollableContainer.scrollable) {
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

        this.log.trace(() => `updateViewportSize() => ${JSON.stringify(viewportSize)}`);
        this._viewportSize = viewportSize;
    }

    /** size of the container (including scrollbars) */
    private get scrollableContainerSize(): BoxSize {
        const computedStyle = getComputedStyle(this.scrollableContainer.elementRef.nativeElement);
        let width = Number(computedStyle.width.replace('px', ''));
        let height = Number(computedStyle.height.replace('px', ''));
        if (this.scrollableContainer.scrollable) {
            // on Chrome and Firefox the scrollbar width must be added, on IE this is not required
            if (!isInternetExplorer) {
                width += scrollbarWidth;
                height += scrollbarWidth;
            }
        }
        this.log.trace(() => `get size() => ${JSON.stringify({width: width, height: height})}`);
        return {width: width, height: height};
    }

    /**
     * update the visibility of tiles, depending on the scroll position
     */
    private updateTileVisibility() {
        this.log.debug(() => `updateTileVisibility()`);

        // One might wonder why one does not use this.updateScrollPosition() and store the current value in
        // this._scrollPosition. This is on purpose. Since updateTileVisibility is called outside angular for the
        // scroll event, one does not want to update this._scrollPosition. This would cause a change detection cycle
        // on all containers, which should not be needed on scroll events.
        const scrollPosition = this.computeScrollPosition();

        const scrollLeft = scrollPosition.left;
        const scrollTop = scrollPosition.top;

        // to synchronize scroll there are several options.
        // 1. use translate3d(-scrollLeft px, 0, 0) and hope for a good GPU.
        //    This works well in Chrome, but not in IE und Firefox. The latter two browsers show a very bad
        //    performance.
        // 2. use scrollTo(scrollLeft, 0)
        //    This works well in Chrome and and Firefox, IE ignores the scrollTo call completely.
        // 3. use left = -scrollLeft px
        //    This works in all Browsers and scrolling performance is the best one of all three options.
        //    In Chrome performance is excellent, Firefox and IE show some lack for big data sets.

        // use the cached values here, they should not change after the model (or config) was updated.
        const scrollableContainer = this.scrollableContainer;

        // TODO: pass make the scroll positions available on init to the containers, e.g. via passing a lambda
        const fixedTopContainer = this.fixedTopContainer;
        if (fixedTopContainer) {
            fixedTopContainer.scrollCanvasTo({left: -scrollLeft, top: 0});
            fixedTopContainer.updateTileVisibility({left: scrollLeft, top: 0});

        }
        const fixedRightContainer = this.fixedRightContainer;
        if (fixedRightContainer) {
            fixedRightContainer.scrollCanvasTo({left: 0, top: -scrollTop});
            fixedRightContainer.updateTileVisibility({left: 0, top: scrollTop});
        }
        const fixedBottomContainer = this.fixedBottomContainer;
        if (fixedBottomContainer) {
            fixedBottomContainer.scrollCanvasTo({left: -scrollLeft, top: 0});
            fixedBottomContainer.updateTileVisibility({left: scrollLeft, top: 0});
        }
        const fixedLeftContainer = this.fixedLeftContainer;
        if (fixedLeftContainer) {
            fixedLeftContainer.scrollCanvasTo({left: 0, top: -scrollTop});
            fixedLeftContainer.updateTileVisibility({left: 0, top: scrollTop});
        }
        // use the internal state of scrollableTiles, since recomputing them is unnecessary here and
        // too expensive.
        scrollableContainer.updateTileVisibility(scrollPosition);
    }

    /** recompute all values in {@link #_fixed}. */
    private updateFixed() {
        this.log.trace(() => `updateFixed()`);
        const model = this._model.value;
        const dim = model.dimension;
        const config = this._config.value;
        const showFixed = config.showFixed;
        const canvasSize = this._model.value.canvasSize;
        const viewportSize = this.viewportSize;
        const colModel = model.colModel;
        const rowModel = model.rowModel;

        const right = {
            size: {
                width: colModel.fixedRightWidth(showFixed.right),
                height: viewportSize.height,
            },
            offset: {top: 0, left: 0},
            slice: {
                // since fixed right is on top, no rows are filtered by default, except for the case, where fixed
                // corners are shown, where the lower rows are hidden.
                rows: {start: 0, end: config.showFixedCorners.bottomRight ? dim.rows - showFixed.right : dim.rows},
                cols: {start: dim.cols - Math.min(showFixed.right, dim.cols), end: dim.cols},
            },
            scrollOffset: {top: 0, left: 0}
        };
        right.offset.left = viewportSize.width - right.size.width;
        right.scrollOffset.left = canvasSize.width - right.size.width;

        const top = {
            size: {
                width: viewportSize.width,
                height: rowModel.fixedTopHeight(showFixed.top),
            },
            offset: {top: 0, left: 0},
            slice: {
                rows: {start: 0, end: Math.min(showFixed.top, dim.rows)},
                // filter all cols that belong to fixed right, since fixed right is on top
                cols: {start: 0, end: right.slice.cols.start},
            },
            scrollOffset: {top: 0, left: 0}
        };

        const bottom = {
            size: {
                width: viewportSize.width,
                height: rowModel.fixedBottomHeight(showFixed.bottom),
            },
            offset: {top: 0, left: 0},
            slice: {
                rows: {start: dim.rows - Math.min(showFixed.bottom, dim.rows), end: dim.rows},
                // fixed bottom is above fixed left, so filter all cols, that belong to fixed right
                cols: {start: 0, end: right.slice.cols.start},
            },
            scrollOffset: {top: 0, left: 0}
        };
        bottom.scrollOffset.top = canvasSize.height - bottom.size.height;
        bottom.offset.top = viewportSize.height - bottom.size.height;

        const left = {
            size: {
                width: colModel.fixedLeftWidth(showFixed.left),
                height: viewportSize.height,
            },
            offset: {top: 0, left: 0},
            slice: {
                // fixed left is lowest, so filter all rows, that belong to fixed top or bottom
                rows: {start: top.slice.rows.end, end: bottom.slice.rows.start},
                cols: {start: 0, end: Math.min(showFixed.left, dim.cols)},
            },
            scrollOffset: {top: 0, left: 0}
        };
        this._fixed = {top: top, right: right, bottom: bottom, left: left};

        // TODO DST: handle special case, where dimension.rows <= fixedBottom (for all fixed areas)
        this._scrollableSlice = {
            // filter all cols, that belong to fixed left or right
            rows: {start: top.slice.rows.end, end: bottom.slice.rows.start},
            // filter all cols, that belong to fixed left or right
            cols: {start: left.slice.cols.end, end: right.slice.cols.end},
        };
    }

    /** update {@link #_scrollPosition} with the current value */
    private updateScrollPosition() {
        this._scrollPosition = this.computeScrollPosition();
    }

    /** recompute the current scroll position of the canvas in the scrollable container */
    private computeScrollPosition() {
        const containerNativeElement = this.scrollableContainer.elementRef.nativeElement;
        return {left: containerNativeElement.scrollLeft, top: containerNativeElement.scrollTop};
    }
}

