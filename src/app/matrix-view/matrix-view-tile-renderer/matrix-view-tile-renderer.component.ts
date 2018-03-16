import {ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnDestroy, OnInit} from '@angular/core';
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

    constructor(private changeDetectionRef: ChangeDetectorRef) {
    }

    public detectChanges() {
        this.changeDetectionRef.detectChanges();
    }

    ngOnInit() {
        this.tile.renderer = this;
    }

    ngOnDestroy(): void {
        this.tile.renderer = undefined;
    }

}


