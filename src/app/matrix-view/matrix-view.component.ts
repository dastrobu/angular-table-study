import {
    AfterViewInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ElementRef,
    Input,
    NgZone,
    OnDestroy,
    OnInit,
    ViewChild
} from '@angular/core';
import {BoxSize, getScrollbarWidth} from './utils';
import {isInternetExplorer} from './browser';
import {MatrixViewModel} from './matrix-view-model';
import {FullMatrixViewConfig, MatrixViewConfig} from './matrix-view-config';
import {Log} from './log';

interface HeaderCell {
    col: number;
}

interface Cell {
    col: number;
    row: number;
}

@Component({
    // TODO DST: if we use onPush we must make sure, that the inputs are immutable... this is currently not the case.
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'matrix-view',
    templateUrl: './matrix-view.component.html',
    styleUrls: ['./matrix-view.component.scss']
})
export class MatrixViewComponent<CellType> implements OnInit, AfterViewInit, OnDestroy {
    private log: Log = new Log();

    get model(): MatrixViewModel<CellType> {
        return this._model;
    }

    private _model: MatrixViewModel<CellType>;

    get fullConfig(): FullMatrixViewConfig {
        return this._fullConfig;
    }

    @Input()
    set model(value: MatrixViewModel<CellType>) {
        this._model = value;
    }

    @Input()
    set config(value: MatrixViewConfig) {
        this._fullConfig = new FullMatrixViewConfig(value);

        // update log level on config changes
        this.log.level = this._fullConfig.logLevel;
    }

    private _fullConfig: FullMatrixViewConfig = new FullMatrixViewConfig();

    get fixedTopHeight(): number {
        this.log.trace(() => 'fixedTopHeight');
        const nRowsFixedTop = this.fullConfig.showFixed.top;
        if (!nRowsFixedTop) {
            this.log.trace(() => 'fixedTopHeight => 0');
            return 0;
        }
        const rowModel = this.model.rowModel;
        let height = 0;
        const size = rowModel.size;
        if (nRowsFixedTop > size) {
            throw new Error('nRowsFixedTop must be smaller than ' + size + ', got: ' + nRowsFixedTop);
        }
        this.log.trace(() => '> ' + height);
        this.log.trace(() => 'nRowsFixedTop > ' + nRowsFixedTop);
        for (let i = 0; i < nRowsFixedTop; ++i) {
            height += rowModel.rowHeight(i);
            this.log.trace(() => i + '> ' + height);
        }
        this.log.trace(() => 'fixedTopHeight => ' + height);
        return height;
    }


    get fixedBottomHeight(): number {
        this.log.trace(() => 'fixedBottomHeight');
        const nRowsFixedBottom = this.fullConfig.showFixed.bottom;
        if (!nRowsFixedBottom) {
            this.log.trace(() => 'fixedBottomHeight => 0');
            return 0;
        }
        const rowModel = this.model.rowModel;
        let height = 0;
        const size = rowModel.size;
        if (nRowsFixedBottom > size) {
            throw new Error('nRowsFixedBottom must be smaller than ' + size + ', got: ' + nRowsFixedBottom);
        }
        for (let i = 0; i < nRowsFixedBottom; ++i) {
            height += rowModel.rowHeight(size - 1 - i);
        }
        this.log.trace(() => 'fixedBottomHeight => ' + height);
        return height;
    }


    get fixedLeftWidth(): number {
        this.log.trace(() => 'fixedLeftWidth');
        const nColsFixedLeft = this.fullConfig.showFixed.left;
        if (!nColsFixedLeft) {
            this.log.trace(() => 'fixedLeftWidth => 0');
            return 0;
        }
        const colModel = this.model.colModel;
        let width = 0;
        const size = colModel.size;
        if (nColsFixedLeft > size) {
            throw new Error('nColsFixedLeft must be smaller than ' + size + ', got: ' + nColsFixedLeft);
        }
        for (let i = 0; i < nColsFixedLeft; ++i) {
            width += colModel.colWidth(i);
        }
        this.log.trace(() => 'fixedLeftWidth => ' + width);
        return width;
    }

    get fixedRightWidth(): number {
        this.log.trace(() => 'fixedLeftWidth');
        const nColsFixedRight = this.fullConfig.showFixed.right;
        if (!nColsFixedRight) {
            this.log.trace(() => 'fixedRightWidth => 0');
            return 0;
        }
        const colModel = this.model.colModel;
        let width = 0;
        const size = colModel.size;
        if (nColsFixedRight > size) {
            throw new Error('nColsFixedRight must be smaller than ' + size + ', got: ' + nColsFixedRight);
        }
        for (let i = 0; i < nColsFixedRight; ++i) {
            width += colModel.colWidth(size - 1 - i);
        }
        this.log.trace(() => 'fixedRightWidth => ' + width);
        return width;
    }

    /**
     * size of the container (including scrollbars)
     */
    get containerSize(): BoxSize {
        this.log.trace(() => 'containerSize');
        const computedContainerStyle = getComputedStyle(this.container.nativeElement);
        const width = Number(computedContainerStyle.width.replace('px', ''));
        const height = Number(computedContainerStyle.height.replace('px', ''));
        this.log.trace(() => 'containerSize => ' + JSON.stringify({width: width, height: height}));
        return {width: width, height: height};
    }

    /**
     * size of the viewport, i.e. the size of the container minus scrollbars, if any.
     */
    get viewportSize(): BoxSize {
        this.log.trace(() => 'viewportSize');
        const containerSize = this.containerSize;

        let width: number;
        let height: number;
        // on IE the scrollbar with must not be subtracted, on Chrome and Firefox this is required.
        if (isInternetExplorer) {
            width = containerSize.width;
            height = containerSize.height;
        } else {
            width = containerSize.width - getScrollbarWidth();
            height = containerSize.height - getScrollbarWidth();
        }
        this.log.trace(() => 'viewportSize => ' + JSON.stringify({width: width, height: height}));
        return {width: width, height: height};
    }

    @ViewChild('container')
    public container: ElementRef;

    @ViewChild('canvas')
    public canvas: ElementRef;

    @ViewChild('canvasTop')
    public canvasTop: ElementRef;

    @ViewChild('canvasBottom')
    public canvasBottom: ElementRef;

    @ViewChild('canvasLeft')
    public canvasLeft: ElementRef;

    @ViewChild('canvasRight')
    public canvasRight: ElementRef;

    @ViewChild('fixedTop')
    public fixedTop: ElementRef;

    @ViewChild('fixedRight')
    public fixedRight: ElementRef;

    @ViewChild('fixedBottom')
    public fixedBottom: ElementRef;

    @ViewChild('fixedLeft')
    public fixedLeft: ElementRef;

    @ViewChild('fixedTopRight')
    public fixedTopRight: ElementRef;

    @ViewChild('fixedBottomRight')
    public fixedBottomRight: ElementRef;

    @ViewChild('fixedBottomLeft')
    public fixedBottomLeft: ElementRef;

    @ViewChild('fixedTopLeft')
    public fixedTopLeft: ElementRef;

    public cells: Cell[] = [];

    public headerCells: HeaderCell[] = [];
    public colWidth = 200;
    public rowHeight = 20;
    public numRows = 200;
    public numCols = 8;

    /**
     * Size of the canvas to draw to.
     */
    public get canvasSize(): BoxSize {
        this.log.trace(() => 'viewportSize');
        const width = this.model.colModel.width;
        const height = this.model.rowModel.height;
        this.log.trace(() => 'viewportSize => ' + JSON.stringify({width: width, height: height}));
        return {width: width, height: height};
    }

    /**
     * scroll listener to synchronize scrolling on the main canvas and on the fixed areas.
     */
    private scrollListener: () => void;


    constructor(private changeDetectorRef: ChangeDetectorRef,
                private zone: NgZone) {
    }

    ngOnInit() {
        this.log.debug(() => 'ngOnInit()');
        if (!this.model) {
            throw new Error('model is required');
        }
        this.log.debug(() => 'rowModel.size: ' + this.model.rowModel.size);
        this.log.debug(() => 'colModel.size: ' + this.model.colModel.size);

        // to optimize performance, the scroll sync runs outside angular.
        // so one should be careful, what to do here, since there is not change detection running.
        this.zone.runOutsideAngular(() => {
            this.scrollListener = () => {
                const scrollLeft = this.container.nativeElement.scrollLeft;
                const scrollTop = this.container.nativeElement.scrollTop;
                const canvasTop = this.canvasTop;
                if (canvasTop) {
                    canvasTop.nativeElement.style.transform = 'translate3d(' + -scrollLeft + 'px, 0, 0)';
                }
                const canvasBottom = this.canvasBottom;
                if (canvasBottom) {
                    canvasBottom.nativeElement.style.transform = 'translate3d(' + -scrollLeft + 'px, 0, 0)';
                }
                const canvasLeft = this.canvasLeft;
                if (canvasLeft) {
                    canvasLeft.nativeElement.style.transform = 'translate3d(0, ' + -scrollTop + 'px, 0)';
                }
                const canvasRight = this.canvasRight;
                if (canvasRight) {
                    canvasRight.nativeElement.style.transform = 'translate3d(0, ' + -scrollTop + 'px, 0)';
                }
            };
            this.container.nativeElement.addEventListener('scroll', this.scrollListener);
        });
    }

    ngAfterViewInit(): void {
        this.updateViewportSize();
        this.changeDetectorRef.detectChanges();
        this.updateViewportSize();
    }

    ngOnDestroy(): void {
        // clean up the scroll listener
        if (this.scrollListener) {
            this.container.nativeElement.removeEventListener('scroll', this.scrollListener);
        }
    }

    /**
     * updates {@link #containerSize} and {@link #viewportSize}
     */
    private updateViewportSize() {

        // TODO: check if there is any scroll bar, before subtracting
        const viewportSize = this.viewportSize;

        // update the widths of the fixed areas

        const fixedTop = this.fixedTop;
        if (fixedTop) {
            fixedTop.nativeElement.style.width = Math.ceil(viewportSize.width) + 'px';
            console.log('fixedTop: ' + JSON.stringify(fixedTop.nativeElement.style.width));
        }
        const fixedBottom = this.fixedBottom;
        if (fixedBottom) {
            fixedBottom.nativeElement.style.width = Math.ceil(viewportSize.width) + 'px';
        }
        const fixedLeft = this.fixedLeft;
        if (fixedLeft) {
            fixedLeft.nativeElement.style.height = Math.ceil(viewportSize.height) + 'px';
        }
        const fixedRight = this.fixedRight;
        if (fixedRight) {
            fixedRight.nativeElement.style.height = Math.ceil(viewportSize.height) + 'px';
        }

        console.log('containerSize: ' + JSON.stringify(this.containerSize));
        console.log('viewportSize: ' + JSON.stringify(viewportSize));
    }
}
