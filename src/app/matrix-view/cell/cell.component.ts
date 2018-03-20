import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    HostListener,
    Input,
    OnChanges,
    OnDestroy,
    OnInit,
    SimpleChanges,
    TemplateRef
} from '@angular/core';
import {CellTemplateContext} from './cell-template-context';
import {Cell, CellEventEmitter} from './cell';
import {Log} from '../log';

import * as _ from 'lodash';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'matrix-view-cell',
    templateUrl: './cell.component.html',
    styleUrls: ['./cell.component.scss']
})
export class CellComponent<CellValueType> implements OnInit, OnChanges, OnDestroy {
    private readonly log: Log = new Log(this.constructor.name + ':');
    @Input()
    public cell: Cell<CellValueType>;
    @Input()
    public template: TemplateRef<CellTemplateContext<CellValueType>>;

    @Input()
    public cellEventEmitter: CellEventEmitter<CellValueType>;

    constructor(private changeDetectorRef: ChangeDetectorRef) {
    }

    ngOnInit() {
        this.log.trace(() => `ngOnInit()`);
    }

    ngOnChanges(changes: SimpleChanges): void {
        this.log.trace(() => `ngOnChanges(${JSON.stringify(_.keys(changes))})`);
    }

    @HostListener('click', ['$event'])
    public click(event: MouseEvent) {
        const cellEventEmitter = this.cellEventEmitter;
        if (cellEventEmitter) {
            cellEventEmitter.click.emit({event: event, cell: this.cell});
        }
    }

    @HostListener('contextmenu', ['$event'])
    public contextmenu(event: MouseEvent) {
        const cellEventEmitter = this.cellEventEmitter;
        if (cellEventEmitter) {
            cellEventEmitter.contextmenu.emit({event: event, cell: this.cell});
        }
    }

    @HostListener('dblclick', ['$event'])
    public dblclick(event: MouseEvent) {
        const cellEventEmitter = this.cellEventEmitter;
        if (cellEventEmitter) {
            cellEventEmitter.dblclick.emit({event: event, cell: this.cell});
        }
    }

    @HostListener('mousedown', ['$event'])
    public mousedown(event: MouseEvent) {
        const cellEventEmitter = this.cellEventEmitter;
        if (cellEventEmitter) {
            cellEventEmitter.mousedown.emit({event: event, cell: this.cell});
        }
    }

    @HostListener('mouseenter', ['$event'])
    public mouseenter(event: MouseEvent) {
        const cellEventEmitter = this.cellEventEmitter;
        if (cellEventEmitter) {
            this.cell.hover = true;
            cellEventEmitter.mouseenter.emit({event: event, cell: this.cell});
        }
    }

    @HostListener('mouseleave', ['$event'])
    public mouseleave(event: MouseEvent) {
        const cellEventEmitter = this.cellEventEmitter;
        if (cellEventEmitter) {
            this.cell.hover = false;
            cellEventEmitter.mouseleave.emit({event: event, cell: this.cell});
        }
    }

    @HostListener('mousemove', ['$event'])
    public mousemove(event: MouseEvent) {
        const cellEventEmitter = this.cellEventEmitter;
        if (cellEventEmitter) {
            cellEventEmitter.mousemove.emit({event: event, cell: this.cell});
        }
    }

    @HostListener('mouseover', ['$event'])
    public mouseover(event: MouseEvent) {
        const cellEventEmitter = this.cellEventEmitter;
        if (cellEventEmitter) {
            this.cell.hover = true;
            cellEventEmitter.mouseover.emit({event: event, cell: this.cell});
        }
    }

    @HostListener('mouseout', ['$event'])
    public mouseout(event: MouseEvent) {
        const cellEventEmitter = this.cellEventEmitter;
        if (cellEventEmitter) {
            this.cell.hover = false;
            cellEventEmitter.mouseout.emit({event: event, cell: this.cell});
        }
    }

    @HostListener('mouseup', ['$event'])
    public mouseup(event: MouseEvent) {
        const cellEventEmitter = this.cellEventEmitter;
        if (cellEventEmitter) {
            cellEventEmitter.mouseup.emit({event: event, cell: this.cell});
        }
    }

    ngOnDestroy(): void {
        this.log.trace(() => `ngOnDestroy()`);
        if (this.cell) {
            this.cell.hover = false;
        }
    }
}

