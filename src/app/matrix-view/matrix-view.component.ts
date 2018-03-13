import {ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {BoxSize, getScrollbarWidth, Point2D} from './utils';

interface HeaderCell {
    col: number;
}

interface Cell {
    col: number;
    row: number;
}

@Component({
    selector: 'matrix-view',
    templateUrl: './matrix-view.component.html',
    styleUrls: ['./matrix-view.component.scss']
})
export class MatrixViewComponent implements OnInit {
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
        return this._containerSize;
    }

    get viewportSize(): BoxSize {
        return this._viewportSize;
    }

    @ViewChild('container')
    public container: ElementRef;

    @ViewChild('canvas')
    public canvas: ElementRef;

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
     * size of the container (including scrollbars)
     */
    private _containerSize: BoxSize = {width: 0, height: 0};

    /**
     * size of the viewport, i.e. the size of the container minus scrollbars, if any.
     */
    private _viewportSize: BoxSize = {width: 0, height: 0};

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
        this.updateViewportSize();
        // init at zero scroll position
        this.updateFixedPositions(0, 0);
    }

    public scroll() {
        // const scrollLeft = this.container.nativeElement.scrollLeft;
        // const scrollTop = this.container.nativeElement.scrollTop;
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

    private get canvasSize(): BoxSize {
        const computedStyle = getComputedStyle(this.canvas.nativeElement);
        const canvasWidth = Number(computedStyle.width.replace('px', ''));
        const canvasHeight = Number(computedStyle.height.replace('px', ''));
        return {width: canvasWidth, height: canvasHeight};
    }

    /**
     * updates {@link #containerSize} and {@link #viewportSize}
     */
    private updateViewportSize() {
        const computedContainerStyle = getComputedStyle(this.container.nativeElement);
        this.containerSize.width = Number(computedContainerStyle.width.replace('px', ''));
        this.containerSize.height = Number(computedContainerStyle.height.replace('px', ''));

        // TODO: check if there is any scroll bar, before subtracting
        const viewportSize = this.viewportSize;
        viewportSize.width = this.containerSize.width - getScrollbarWidth();
        viewportSize.height = this.containerSize.height - getScrollbarWidth();

        // update the widths of the fixed areas
        this.fixedTop.nativeElement.style.width = viewportSize.width + 'px';
        this.fixedBottom.nativeElement.style.width = viewportSize.width + 'px';
        this.fixedLeft.nativeElement.style.height = viewportSize.height + 'px';
        this.fixedRight.nativeElement.style.height = viewportSize.height + 'px';

        console.log('containerSize: ' + JSON.stringify(this.containerSize));
        console.log('viewportSize: ' + JSON.stringify(viewportSize));
    }
}
