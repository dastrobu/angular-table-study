import {Component, ElementRef, OnInit, ViewContainerRef} from '@angular/core';

@Component({
    selector: 'matrix-view-canvas',
    templateUrl: './canvas.component.html',
    styleUrls: ['./canvas.component.scss']
})
export class CanvasComponent implements OnInit {

    constructor(public elementRef: ElementRef,
                public viewContainerRef: ViewContainerRef) {
    }

    ngOnInit() {
    }

}
