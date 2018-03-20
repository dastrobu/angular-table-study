import {ChangeDetectionStrategy, Component, Input, OnChanges, OnInit, SimpleChanges, TemplateRef} from '@angular/core';
import {CellTemplateContext} from './cell-template-context';
import {Cell} from './cell';
import {Log} from '../log';

import * as _ from 'lodash';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'matrix-view-cell',
    templateUrl: './cell.component.html',
    styleUrls: ['./cell.component.scss']
})
export class CellComponent<CellValueType> implements OnInit, OnChanges {
    private readonly log: Log = new Log(this.constructor.name + ':');
    @Input()
    public cell: Cell<CellValueType>;

    @Input()
    public template: TemplateRef<CellTemplateContext<CellValueType>>;

    constructor() {
    }

    ngOnInit() {
        this.log.trace(() => `ngOnInit()`);
    }

    ngOnChanges(changes: SimpleChanges): void {
        this.log.trace(() => `ngOnChanges(${JSON.stringify(_.keys(changes))})`);
    }

    // TODO DST: this is the final gaol...
    // @HostListener('mouseover')
    // public mouseover() {
    //     console.log('mouseover');
    // }
}

