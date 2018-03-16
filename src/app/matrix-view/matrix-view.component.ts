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
    QueryList,
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

    // TODO DST: use row major convention to optimize lookup on component, instead of using find...
    @ViewChildren(MatrixViewTileRendererComponent)
    tileRenderers: QueryList<MatrixViewTileRendererComponent<CellValueType>> = new QueryList<MatrixViewTileRendererComponent<CellValueType>>();

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
            this.log.debug(() => `initialized new model with size: ${JSON.stringify(this._model.value.size)})`);
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

        this.log.debug(() => `containerSize: ${JSON.stringify(this.viewModel.containerSize)}`);
        this.log.debug(() => `viewportSize: ${JSON.stringify(viewportSize)}`);

        if (callback) {
            callback();
        }
    }
}

