/**
 * Implementatio of a view model for the matrix view.
 */
import {MatrixViewComponent} from './matrix-view.component';
import {Model} from './matrix-view-model';
import {Log} from './log';
import {Observable} from 'rxjs/Observable';
import {Subscription} from 'rxjs/Subscription';
import {Config} from './matrix-view-config';
import {BoxSize} from './utils';
import {isInternetExplorer, scrollbarWidth} from './browser';
import {OnDestroy, OnInit} from '@angular/core';

/**
 * The view model provides all information on the view, i.e. especially size information on various parts of the matrix.
 * Note: the view model must not be modified externally.
 */
export class MatrixViewViewModel<CellType> implements OnInit, OnDestroy {
    private log: Log = new Log();
    private model: Model<CellType>;
    private config: Config;

    /** array of subscriptions, from which one must unsubscribe in {@link #ngOnDestroy}. */
    private readonly subscriptions: Subscription[] = [];

    /** scroll listener to synchronize scrolling on the main canvas and on the fixed areas. */
    private scrollListener: () => void;

    constructor(private matrixViewComponent: MatrixViewComponent<CellType>,
                configObservable: Observable<Config>,
                modelObservable: Observable<Model<CellType>>) {
        this.subscriptions.push(configObservable.subscribe(config => {
            this.config = config;

            // update log level
            this.log.level = config.logLevel;
        }));
        this.subscriptions.push(modelObservable.subscribe(model => {
            this.model = model;
        }));
    }

    /** @return {number} height of the top fixed area in px. */
    public get fixedTopHeight(): number {
        this.log.trace(() => 'fixedTopHeight');
        let nRowsFixedTop = this.matrixViewComponent.showFixed.top;
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
        this.log.trace(() => 'fixedBottomHeight');
        let showFixedBottom = this.config.showFixed.bottom;
        if (!showFixedBottom) {
            this.log.trace(() => 'fixedBottomHeight => 0');
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
        this.log.trace(() => 'fixedLeftWidth');
        let showFixedLeft = this.config.showFixed.left;
        if (!showFixedLeft) {
            this.log.trace(() => 'fixedLeftWidth => 0');
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
            width += colModel.colWidth(i);
        }
        this.log.trace(() => `fixedLeftWidth => ${width}`);
        return width;
    }

    /** @return {number} width of the right fixed area in px. */
    public get fixedRightWidth(): number {
        this.log.trace(() => 'fixedRightWidth');
        let showFixedRight = this.config.showFixed.right;
        if (!showFixedRight) {
            this.log.trace(() => 'fixedRightWidth => 0');
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
            width += colModel.colWidth(size - 1 - i);
        }
        this.log.trace(() => `fixedRightWidth => ${width}`);
        return width;
    }

    /** offset of all right fixed areas. To be used to compute the transformations. */
    public get fixedRightOffset(): number {
        // TODO: check if this +1 is really needed...
        // add 1 pixel to account for a small offset, wich leads to a one pixel gap on the right.
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
        this.log.trace(() => 'viewportSize');
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
        this.log.trace(() => `viewportSize => ${JSON.stringify({width: width, height: height})}`);
        return {width: width, height: height};
    }

    /**
     * Size of the canvas to draw to.
     */
    public get canvasSize(): BoxSize {
        this.log.trace(() => 'viewportSize');
        const model = this.model;
        const width = model.colModel.width;
        const height = model.rowModel.height;
        this.log.trace(() => `viewportSize => ${JSON.stringify({width: width, height: height})}`);
        return {width: width, height: height};
    }

    ngOnInit(): void {
        const matrixViewComponent = this.matrixViewComponent;
        // to optimize performance, the scroll sync runs outside angular.
        // so one should be careful, what to do here, since there is not change detection running.
        matrixViewComponent.zone.runOutsideAngular(() => {
            const containerNativeElement = this.matrixViewComponent.container.nativeElement;
            this.scrollListener = () => {
                const scrollLeft = containerNativeElement.scrollLeft;
                const scrollTop = containerNativeElement.scrollTop;
                const canvasTop = matrixViewComponent.canvasTop;
                if (canvasTop) {
                    canvasTop.nativeElement.style.transform = 'translate3d(' + -scrollLeft + 'px, 0, 0)';
                }
                const canvasBottom = matrixViewComponent.canvasBottom;
                if (canvasBottom) {
                    canvasBottom.nativeElement.style.transform = 'translate3d(' + -scrollLeft + 'px, 0, 0)';
                }
                const canvasLeft = matrixViewComponent.canvasLeft;
                if (canvasLeft) {
                    canvasLeft.nativeElement.style.transform = 'translate3d(0, ' + -scrollTop + 'px, 0)';
                }
                const canvasRight = matrixViewComponent.canvasRight;
                if (canvasRight) {
                    canvasRight.nativeElement.style.transform = 'translate3d(0, ' + -scrollTop + 'px, 0)';
                }
            };
            this.matrixViewComponent.container.nativeElement.addEventListener('scroll', this.scrollListener);
        });
    }

    ngOnDestroy(): void {
        // clean up the scroll listener
        if (this.scrollListener) {
            this.matrixViewComponent.container.nativeElement.removeEventListener('scroll', this.scrollListener);
        }
        if (this.subscriptions) {
            this.subscriptions.forEach(subscription => subscription.unsubscribe());
        }
    }

}


