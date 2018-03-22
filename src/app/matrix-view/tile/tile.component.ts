import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ElementRef,
    Input,
    OnChanges,
    OnDestroy,
    OnInit,
    SimpleChanges,
    TemplateRef,
    ViewChild
} from '@angular/core';
import {CellTemplateContext} from '../cell/cell-template-context';
import {Tile} from './tile';
import {Log} from '../log';
import * as _ from 'lodash';
import {CellEventEmitter} from '../cell/cell';
import {CellDirective} from '../directives/cell-directive';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'matrix-view-tile',
    templateUrl: './tile.component.html',
    styleUrls: ['./tile.component.scss']
})
export class TileComponent<CellValueType> implements OnInit, OnChanges, OnDestroy {
    private readonly log: Log = new Log(this.constructor.name + ':');
    private _tile: Tile<CellValueType>;

    @Input()
    public cellDirective: CellDirective<CellValueType>;

    @ViewChild('defaultTemplate')
    public defaultTemplate: TemplateRef<CellTemplateContext<CellValueType>>;

    @Input()
    public cellEventEmitter: CellEventEmitter<CellValueType>;

    /** @see #style */
    private _style: { [key: string]: string; } = {};

    private _template: TemplateRef<CellTemplateContext<CellValueType>>;

    /** template for cells */
    public get template(): TemplateRef<CellTemplateContext<CellValueType>> {
        return this._template;
    }

    @Input()
    public tile: Tile<CellValueType>;

    /** style for cells */
    public get style(): { [key: string]: string; } {
        return this._style;
    }

    constructor(private changeDetectionRef: ChangeDetectorRef, public elementRef: ElementRef) {
    }

    /** explicitly call {@link ChangeDetectorRef#detectChanges} */
    public detectChanges() {
        this.log.trace(() => `detectChanges()`);
        this.changeDetectionRef.detectChanges();
    }

    ngOnInit() {
        this.log.trace(() => `ngOnInit()`);
        if (!this.defaultTemplate) {
            throw new Error('no defaultTemplate set');
        }

        // set default template to be used
        this._template = this.defaultTemplate;
        const cellDirective = this.cellDirective;

        // check if a directive is given, which overrides the defaults.
        if (cellDirective) {
            if (cellDirective.template) {
                this._template = cellDirective.template;
            }
            if (cellDirective.style) {
                this._style = cellDirective.style;
            }
        }
    }

    ngOnChanges(changes: SimpleChanges): void {
        this.log.trace(() => `ngOnChanges(${JSON.stringify(_.keys(changes))})`);
    }

    ngOnDestroy(): void {
        this.log.trace(() => `ngOnDestroy()`);
        this._tile = undefined;
        this.cellDirective = undefined;
    }
}


