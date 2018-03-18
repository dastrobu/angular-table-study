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
import {CellTemplateContext} from './cell-template-context';
import {MatrixViewCellDirective} from '../directives/matrix-view-cell.directive';
import {Tile} from './tile';
import {MatrixViewConfig} from '../matrix-view-config';
import {Log} from '../log';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'matrix-view-tile-renderer',
    templateUrl: './tile-renderer.component.html',
    styleUrls: ['./tile-renderer.component.scss']
})
export class TileRendererComponent<CellValueType> implements OnInit, OnDestroy, OnChanges {
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

    private _config: MatrixViewConfig;

    get config(): MatrixViewConfig {
        return this._config;
    }

    @Input()
    set config(value: MatrixViewConfig) {
        this._config = value;
        this.log.level = this._config.logLevel;
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

    ngOnDestroy(): void {
        const tile = this._tile;
        if (tile) {
            // cleanup renderer on tile before destroying this tile
            tile.renderer = undefined;
        }
        this._tile = undefined;
        this.cellDirective = undefined;
    }

    ngOnChanges(changes: SimpleChanges): void {
        this.log.trace(() => `ngOnChanges(...)`);
        // attach this as renderer
        const tile = changes.tile;
        if (tile) {
            const currentTile: Tile<CellValueType> = tile.currentValue;
            if (currentTile) {
                this.log.trace(() => `currentTile(${JSON.stringify(currentTile.index)})`);
            }
            const previousTile: Tile<CellValueType> = tile.previousValue;
            if (previousTile) {
                this.log.trace(() => `previousTile(${JSON.stringify(previousTile.index)})`);
            }
        }
    }

}


