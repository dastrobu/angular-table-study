import {ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnDestroy, OnInit, TemplateRef} from '@angular/core';
import {Tile} from '../matrix-view-view-model';

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
    public cellTemplate: TemplateRef<any>;

    constructor(private changeDetectionRef: ChangeDetectorRef) {
    }

    public detectChanges() {
        this.changeDetectionRef.detectChanges();
    }

    ngOnInit() {
        this.tile.renderer = this;
        if (!this.cellTemplate) {
            throw new Error(`no cell template provided for tile: ${JSON.stringify(this.tile.index)}`);
        }
    }

    ngOnDestroy(): void {
        const tile = this.tile;
        if (tile) {
            tile.renderer = undefined;
        }
    }

}


