import {ChangeDetectionStrategy, Component, Input, OnInit, TemplateRef} from '@angular/core';
import {CellTemplateContext} from './cell-template-context';
import {Cell} from './cell';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'matrix-view-cell',
    templateUrl: './cell.component.html',
    styleUrls: ['./cell.component.scss']
})
export class CellComponent<CellValueType> implements OnInit {

    @Input()
    public cell: Cell<CellValueType>;

    @Input()
    public template: TemplateRef<CellTemplateContext<CellValueType>>;

    constructor() {
    }

    ngOnInit() {
    }

    // TODO DST: this is the final gaol...
    // @HostListener('mouseover')
    // public mouseover() {
    //     console.log('mouseover');
    // }
}

