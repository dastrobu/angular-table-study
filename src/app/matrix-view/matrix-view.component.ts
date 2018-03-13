import {AfterViewInit, ChangeDetectorRef, Component, ElementRef, Input, OnInit, ViewChild} from '@angular/core';
import {BoxSize, getScrollbarWidth} from './utils';
import {isInternetExplorer} from './browser';

interface HeaderCell {
    col: number;
}

interface Cell {
    col: number;
    row: number;
}

export interface MatrixViewConfig {
    /**
     * configure if fixed corners shall be shown.
     * The configuration can either be done globally, i.e. via a boolean, which configures all fixed corners,
     * or for each corner individually, via an object
     * <pre>
     * {
     *      topLeft?: boolean,
     *      topRight?: boolean,
     *      bottomLeft?: boolean,
     *      bottomRight?: boolean,
     * }
     * </pre>
     * If the global boolean or one of the individual properties is not set, the property is determinded automatically.
     */
    showFixedCorners?: boolean | { topLeft?: boolean, topRight?: boolean, bottomLeft?: boolean, bottomRight?: boolean };

    /**
     * configure how many cols or rows shall be shown in the fixed areas. If the number is not set or 0, no fixed area
     * is shown.
     */
    showFixed: { top: number, left: number, right: number, bottom: number };
}

class FullMatrixViewConfig implements MatrixViewConfig {
    showFixed = {
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    };
    showFixedCorners: { topLeft: boolean, topRight: boolean, bottomLeft: boolean, bottomRight: boolean } = {
        topLeft: false,
        topRight: false,
        bottomLeft: false,
        bottomRight: false,
    };
}

@Component({
    selector: 'matrix-view',
    templateUrl: './matrix-view.component.html',
    styleUrls: ['./matrix-view.component.scss']
})
export class MatrixViewComponent implements OnInit, AfterViewInit {
    get fullConfig(): FullMatrixViewConfig {
        return this._fullConfig;
    }

    @Input()
    set config(value: MatrixViewConfig) {
        // determine fixed config
        if (value.showFixed !== undefined && value.showFixed !== null) {
            this.fullConfig.showFixed.top = value.showFixed.top;
            this.fullConfig.showFixed.bottom = value.showFixed.bottom;
            this.fullConfig.showFixed.left = value.showFixed.left;
            this.fullConfig.showFixed.right = value.showFixed.right;
        }
        // determine config of fixed corners
        if (value.showFixedCorners !== undefined && value.showFixedCorners !== null) {
            if (value.showFixedCorners === true) {
                this.fullConfig.showFixedCorners.topLeft = true;
                this.fullConfig.showFixedCorners.topRight = true;
                this.fullConfig.showFixedCorners.bottomLeft = true;
                this.fullConfig.showFixedCorners.bottomRight = true;
            } else if (value.showFixedCorners === false) {
                this.fullConfig.showFixedCorners.topLeft = false;
                this.fullConfig.showFixedCorners.topRight = false;
                this.fullConfig.showFixedCorners.bottomLeft = false;
                this.fullConfig.showFixedCorners.bottomRight = false;
            } else {
                this.fullConfig.showFixedCorners.topLeft = value.showFixedCorners.topLeft;
                this.fullConfig.showFixedCorners.topRight = value.showFixedCorners.topRight;
                this.fullConfig.showFixedCorners.bottomLeft = value.showFixedCorners.bottomLeft;
                this.fullConfig.showFixedCorners.bottomRight = value.showFixedCorners.bottomRight;
            }
        } else {
            // determine visibility of fixed corners automatically, if not set explicitly
            if (this.fullConfig.showFixed.top && this.fullConfig.showFixed.left) {
                this.fullConfig.showFixedCorners.topLeft = true;
            }
            if (this.fullConfig.showFixed.top && this.fullConfig.showFixed.right) {
                this.fullConfig.showFixedCorners.topRight = true;
            }
            if (this.fullConfig.showFixed.bottom && this.fullConfig.showFixed.left) {
                this.fullConfig.showFixedCorners.bottomLeft = true;
            }
            if (this.fullConfig.showFixed.bottom && this.fullConfig.showFixed.right) {
                this.fullConfig.showFixedCorners.bottomRight = true;
            }
        }
    }

    private _fullConfig: FullMatrixViewConfig = new FullMatrixViewConfig();

    get fixedLeftWidth(): number {
        return this._fixedLeftWidth;
    }

    get fixedBottomHeight(): number {
        return this._fixedBottomHeight;
    }

    get fixedTopHeight(): number {
        return this._fixedTopHeight;
    }

    get fixedRightWidth(): number {
        return this._fixedRightWidth;
    }

    get containerSize(): BoxSize {
        const computedContainerStyle = getComputedStyle(this.container.nativeElement);
        const width = Number(computedContainerStyle.width.replace('px', ''));
        const height = Number(computedContainerStyle.height.replace('px', ''));
        return {width: width, height: height};
    }

    /**
     * size of the viewport, i.e. the size of the container minus scrollbars, if any.
     */
    get viewportSize(): BoxSize {
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

        return {width: width, height: height};
    }

    @ViewChild('container')
    public container: ElementRef;

    @ViewChild('canvas')
    public canvas: ElementRef;

    @ViewChild('canvasTop')
    public canvasTop: ElementRef;

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
        return {width: this.numCols * this.colWidth, height: this.numRows * this.rowHeight};
    }

    /**
     * size of the container (including scrollbars)
     */
    private _containerSize: BoxSize = {width: 0, height: 0};

    // TODO: fix default values
    private _fixedRightWidth = 80;

    private _fixedTopHeight = 60;
    private _fixedBottomHeight = 30;
    private _fixedLeftWidth = 40;

    constructor(private changeDetectorRef: ChangeDetectorRef) {

        for (let i = 0; i < this.numCols; ++i) {
            this.headerCells.push({col: i});
            for (let j = 0; j < this.numRows; ++j) {
                this.cells.push({col: i, row: j});
            }
        }
    }

    ngOnInit() {
    }

    ngAfterViewInit(): void {
        this.updateViewportSize();
        this.changeDetectorRef.detectChanges();
        this.updateViewportSize();
        // init at zero scroll position
        this.updateFixedPositions(0, 0);
    }

    public scroll() {
        const scrollLeft = this.container.nativeElement.scrollLeft;
        const scrollTop = this.container.nativeElement.scrollTop;
        const canvasTop = this.canvasTop;
        if (canvasTop) {
            canvasTop.nativeElement.style.transform = 'translate3d(' + -scrollLeft + 'px, 0, 0)';
        }
        // this.updateFixedPositions(scrollLeft, scrollTop);
    }

    private updateFixedPositions(scrollLeft: number, scrollTop: number) {
        const canvasSize = this.canvasSize;
        // this.fixedRight.nativeElement.style.left = (left + this.viewportSize.width - this.fixedLeftWidth / 2) + 'px';

        // this.fixedTop.nativeElement.style.left = -scrollLeft + 'px';
        // this.fixedBottom.nativeElement.style.left = -scrollLeft + 'px';
        // this.fixedLeft.nativeElement.style.top = -scrollTop + 'px';
        // this.fixedRight.nativeElement.style.top = -scrollTop + 'px';
    }

    // private get canvasSize(): BoxSize {
    //     const computedStyle = getComputedStyle(this.canvas.nativeElement);
    //     const canvasWidth = Number(computedStyle.width.replace("px", ""));
    //     const canvasHeight = Number(computedStyle.height.replace("px", ""));
    //     return {width: canvasWidth, height: canvasHeight};
    // }

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
