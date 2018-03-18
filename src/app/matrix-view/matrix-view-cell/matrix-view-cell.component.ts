import {ChangeDetectionStrategy, Component, Input, OnInit, TemplateRef} from '@angular/core';
import {BoxSize, Point2D, RowCol} from '../utils';
import {CellTemplateContext} from '../tile-renderer/cell-template-context';

export interface MatrixViewCell<CellValueType> {
    readonly index: RowCol<number>;
    readonly value: CellValueType;
    readonly position: Point2D;
    readonly size: BoxSize;
}

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'matrix-view-cell',
    templateUrl: './matrix-view-cell.component.html',
    styleUrls: ['./matrix-view-cell.component.scss']
})
export class MatrixViewCellComponent<CellValueType> implements OnInit {

    @Input()
    public cell: MatrixViewCell<CellValueType>;
    @Input()
    public template: TemplateRef<CellTemplateContext<CellValueType>>;

    constructor() {
    }

    ngOnInit() {
    }

    // @HostListener('mouseover')
    // public mouseover() {
    //     console.log('mouseover');
    // }
}

