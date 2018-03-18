import {
    AfterViewInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ContentChild,
    ElementRef,
    Input,
    NgZone,
    OnDestroy,
    OnInit,
    QueryList,
    TemplateRef,
    ViewChild,
    ViewChildren
} from '@angular/core';
import {MatrixViewModel, Model} from './matrix-view-model';
import {Config, MatrixViewConfig} from './matrix-view-config';
import {Log} from './log';
import {Observable} from 'rxjs/Observable';
import {Subscription} from 'rxjs/Subscription';
import {MatrixViewViewModel} from './matrix-view-view-model';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {MatrixViewTileRendererComponent} from './matrix-view-tile-renderer/matrix-view-tile-renderer.component';
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

@Component({
    // TODO DST: if we use onPush we must make sure, that the inputs are immutable... this is currently not the case.
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'matrix-view',
    templateUrl: './matrix-view.component.html',
    styleUrls: ['./matrix-view.component.scss']
})
export class MatrixViewComponent<CellValueType> implements OnInit, AfterViewInit, OnDestroy {

    /** array of subscriptions, from which one must unsubscribe in {@link #ngOnDestroy}. */
    private readonly subscriptions: Subscription[] = [];
    private readonly log: Log = new Log(this.constructor.name + ':');

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

    @ViewChildren('scrollableTileRenderers')
    scrollableTileRenderers: QueryList<MatrixViewTileRendererComponent<CellValueType>> =
        new QueryList<MatrixViewTileRendererComponent<CellValueType>>();

    @ViewChildren('fixedTopTileRenderers')
    fixedTopTileRenderers: QueryList<MatrixViewTileRendererComponent<CellValueType>> =
        new QueryList<MatrixViewTileRendererComponent<CellValueType>>();

    @ViewChildren('fixedBottomTileRenderers')
    fixedBottomTileRenderers: QueryList<MatrixViewTileRendererComponent<CellValueType>> =
        new QueryList<MatrixViewTileRendererComponent<CellValueType>>();

    @ViewChildren('fixedRightTileRenderers')
    fixedRightTileRenderers: QueryList<MatrixViewTileRendererComponent<CellValueType>> =
        new QueryList<MatrixViewTileRendererComponent<CellValueType>>();

    @ViewChildren('fixedLeftTileRenderers')
    fixedLeftTileRenderers: QueryList<MatrixViewTileRendererComponent<CellValueType>> =
        new QueryList<MatrixViewTileRendererComponent<CellValueType>>();

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

    constructor(public changeDetectorRef: ChangeDetectorRef,
                public zone: NgZone) {
        // observe config changes
        this.subscriptions.push(this._config.subscribe(config => {
            // update log level on config changes
            this.log.level = config.logLevel;
        }));
    }

    /** the model of the matrix. */
    private _model: BehaviorSubject<Model<CellValueType>> = new BehaviorSubject<Model<CellValueType>>(new Model<CellValueType>());

    @Input()
    set config(configObservable: Observable<MatrixViewConfig>) {
        // TODO DST: we mus explicitly store the observable and cleanup the subscription if a new observable is passed
        this.subscriptions.push(configObservable.subscribe(config => {
            this._config.next(new Config(config));
            this.changeDetectorRef.markForCheck();
            // it is a bit ugly, that we must run updateViewportSize twice, however, otherwise the sizes of the fixed
            // areas are not computed correctly, so currently we simply live with it.
            this.updateViewportSize(() => {
                this.changeDetectorRef.detectChanges();
                this.updateViewportSize();
            });
        }));
    }

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
            this.log.debug(() => `initialized new model with size: ${JSON.stringify(this._model.value.dimension)})`);
            this.log.trace(() => `colModel.size: ${this._model.value.colModel.size}`);
            this.log.trace(() => `colWidths: ${this._model.value.colModel.colWidths}`);
            this.log.trace(() => `colPositions: ${this._model.value.colModel.colPositions}`);
            this.log.trace(() => `rowHeights: ${this._model.value.rowModel.rowHeights}`);
            this.log.trace(() => `rowPositions: ${this._model.value.rowModel.rowPositions}`);
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

    /** view model of the matrix */
    public readonly viewModel: MatrixViewViewModel<CellValueType> = new MatrixViewViewModel<CellValueType>(this, this._config, this._model);

    ngOnInit() {
        this.log.debug(() => `ngOnInit()`);
        if (!this._model) {
            throw new Error('model is required');
        }

        // init children
        this.viewModel.ngOnInit();
    }

    ngAfterViewInit(): void {
        this.log.debug(() => `ngAfterViewInit()`);
    }

    ngOnDestroy(): void {
        this.log.debug(() => `ngOnDestroy()`);
        // unsubscribe from all observables
        this.subscriptions.forEach(subscription => subscription.unsubscribe());

        // destroy all children, that needs to be destroyed explicitly
        if (this.viewModel) {
            this.viewModel.ngOnDestroy();
        }
    }

    /**
     * updates {@link #containerSize} and {@link #viewportSize}
     * @param callback callback, which is called on completion.
     */
    private updateViewportSize(callback?: () => void) {
        this.log.trace(() => `updateViewportSize()`);

        // TODO: check if there is any scroll bar, before subtracting
        const viewportSize = this.viewModel.viewportSize;

        // update the widths of the fixed areas

        const fixedTop = this.fixedTop;
        if (fixedTop) {
            // who knows where this off by one comes from? I don't....
            fixedTop.nativeElement.style.width = Math.ceil(viewportSize.width + 1) + 'px';
        }
        const fixedBottom = this.fixedBottom;
        if (fixedBottom) {
            // who knows where this off by one comes from? I don't....
            fixedBottom.nativeElement.style.width = Math.ceil(viewportSize.width + 1) + 'px';
        }
        const fixedLeft = this.fixedLeft;
        if (fixedLeft) {
            fixedLeft.nativeElement.style.height = Math.ceil(viewportSize.height) + 'px';
        }
        const fixedRight = this.fixedRight;
        if (fixedRight) {
            fixedRight.nativeElement.style.height = Math.ceil(viewportSize.height) + 'px';
        }

        this.log.debug(() => `containerSize: ${JSON.stringify(this.viewModel.containerSize)}`);
        this.log.debug(() => `viewportSize: ${JSON.stringify(viewportSize)}`);

        if (callback) {
            callback();
        }
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
}

