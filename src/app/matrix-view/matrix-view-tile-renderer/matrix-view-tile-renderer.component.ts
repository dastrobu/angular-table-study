import {ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnDestroy, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {Tile} from '../matrix-view-view-model';
import {CellTemplateContext} from './cell-template-context';
import {MatrixViewCellDirective} from '../directives/matrix-view-cell.directive';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'matrix-view-tile-renderer',
    templateUrl: './matrix-view-tile-renderer.component.html',
    styleUrls: ['./matrix-view-tile-renderer.component.scss']
})
export class MatrixViewTileRendererComponent<CellValueType> implements OnInit, OnDestroy {
    @Input()
    public tile: Tile<CellValueType>;

    @Input()
    public cellDirective: MatrixViewCellDirective<CellValueType>;

    @ViewChild('defaultTemplate')
    public defaultTemplate: TemplateRef<CellTemplateContext<CellValueType>>;

    @Input()
    public cellStyle?: { [key: string]: string; };

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
        this.tile.renderer = this;
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
        const tile = this.tile;
        if (tile) {
            tile.renderer = undefined;
        }
        this.tile = undefined;
        this.cellDirective = undefined;
    }

}


