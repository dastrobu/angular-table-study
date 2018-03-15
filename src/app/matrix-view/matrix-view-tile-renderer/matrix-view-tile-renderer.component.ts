import {ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit} from '@angular/core';
import {Tile} from '../matrix-view-view-model';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'matrix-view-tile-renderer',
    templateUrl: './matrix-view-tile-renderer.component.html',
    styleUrls: ['./matrix-view-tile-renderer.component.scss']
})
export class MatrixViewTileRendererComponent<CellValueType> implements OnInit {

    @Input()
    public tile: Tile<CellValueType>;

    @Input()
    public visible: boolean;

    constructor(public changeDetectionRef: ChangeDetectorRef) {
    }

    ngOnInit() {
    }

}


