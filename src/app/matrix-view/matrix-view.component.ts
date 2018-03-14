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
import {BoxCorners, BoxSides} from './utils';
import {MatrixViewModel, Model} from './matrix-view-model';
import {Config, MatrixViewConfig} from './matrix-view-config';
import {Log} from './log';
import {Observable} from 'rxjs/Observable';
import {Subscription} from 'rxjs/Subscription';
import {MatrixViewViewModel} from './matrix-view-view-model';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';

@Component({
    // TODO DST: if we use onPush we must make sure, that the inputs are immutable... this is currently not the case.
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'matrix-view',
    templateUrl: './matrix-view.component.html',
    styleUrls: ['./matrix-view.component.scss']
})
export class MatrixViewComponent<CellType> implements OnInit, AfterViewInit, OnDestroy {

    /** array of subscriptions, from which one must unsubscribe in {@link #ngOnDestroy}. */
    private readonly subscriptions: Subscription[] = [];
    private log: Log = new Log();

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

    constructor(private changeDetectorRef: ChangeDetectorRef,
                public zone: NgZone) {
        // observe config changes
        this.subscriptions.push(this._config.subscribe(config => {
            // update log level on config changes
            this.log.level = config.logLevel;
        }));
    }

    /** the model of the matrix. */
    private _model: BehaviorSubject<Model<CellType>> = new BehaviorSubject<Model<CellType>>(new Model<CellType>());

    /**
     * The model must be passed as input. The model is treated as immutable, i.e. changes to the model will not be
     * reflected in the table directly. Instead, a new model must be passed through the observable.
     * @param {MatrixViewModel} modelObservable
     */
    @Input()
    set model(modelObservable: Observable<MatrixViewModel<CellType>>) {
        this.subscriptions.push(modelObservable.subscribe(model => {
            // call copy constructor, to address mutability
            this._model.next(new Model<CellType>(model));
        }));
    }

    /**
     * The full config object contains detailed configuration properties for the whole table. It must not be changed
     * externally.
     * @see #config
     * @type {Config}
     */
    private _config: BehaviorSubject<Config> = new BehaviorSubject<Config>(new Config());

    @Input()
    set config(configObservable: Observable<MatrixViewConfig>) {
        this.subscriptions.push(configObservable.subscribe(config => {
            this._config.next(new Config(config));
        }));
    }

    /** view model of the matrix */
    public readonly viewModel: MatrixViewViewModel<CellType> = new MatrixViewViewModel<CellType>(this, this._config, this._model);

    /**
     * @return {BoxSides<number>} information from the configuration of the table about displaying fixed areas.
     */
    public get showFixed(): BoxSides<number> {
        return this._config.value.showFixed;
    }

    /**
     * @return {BoxSides<number>} information from the configuration of the table about displaying fixed corners.
     */
    public get showFixedCorners(): BoxCorners<boolean> {
        return this._config.value.showFixedCorners;
    }

    ngOnInit() {
        this.log.debug(() => 'ngOnInit()');
        if (!this.model) {
            throw new Error('model is required');
        }

        // init children
        this.viewModel.ngOnInit();
    }

    ngAfterViewInit(): void {
        this.updateViewportSize();
        this.changeDetectorRef.detectChanges();
        this.updateViewportSize();
    }

    ngOnDestroy(): void {
        // unsubscribe from all observables
        this.subscriptions.forEach(subscription => subscription.unsubscribe());

        // destroy all children, that needs to be destroyed explicitly
        if (this.viewModel) {
            this.viewModel.ngOnDestroy();
        }
    }

    /**
     * updates {@link #containerSize} and {@link #viewportSize}
     */
    private updateViewportSize() {

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

        console.log('containerSize: ' + JSON.stringify(this.viewModel.containerSize));
        console.log('viewportSize: ' + JSON.stringify(viewportSize));
    }
}
