import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    Input,
    OnChanges,
    OnDestroy,
    OnInit,
    SimpleChanges,
    TemplateRef,
    ViewChild
} from '@angular/core';
import {CellTemplateContext} from '../cell/cell-template-context';
import {MatrixViewCellDirective} from '../directives/matrix-view-cell.directive';
import {Tile} from './tile';
import {Log} from '../log';
import * as _ from 'lodash';

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
    public cellDirective: MatrixViewCellDirective<CellValueType>;

    @ViewChild('defaultTemplate')
    public defaultTemplate: TemplateRef<CellTemplateContext<CellValueType>>;

    get tile(): Tile<CellValueType> {
        return this._tile;
    }

    @Input()
    set tile(value: Tile<CellValueType>) {
        this.log.trace(() => `set tile(${JSON.stringify(value ? value.index : undefined)})`);
        if (this._tile) {
            this._tile.renderer = undefined;
        }
        this._tile = value;
        if (this._tile) {
            this._tile.renderer = this;
        }
    }

    private _template: TemplateRef<CellTemplateContext<CellValueType>>;

    /** template for cells */
    public get template(): TemplateRef<CellTemplateContext<CellValueType>> {
        return this._template;
    }

    private _style: { [key: string]: string; } = {};

    /** style for cells */
    public get style(): { [key: string]: string; } {
        return this._style;
    }

    constructor(private changeDetectionRef: ChangeDetectorRef) {
    }

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
        const tile = this._tile;
        if (tile) {
            // cleanup renderer on tile before destroying this tile
            tile.renderer = undefined;
        }
        this._tile = undefined;
        this.cellDirective = undefined;
    }
}


