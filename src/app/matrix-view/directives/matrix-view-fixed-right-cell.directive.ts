import {Directive, Input, TemplateRef} from '@angular/core';
import {CellTemplateContext} from '../matrix-view-tile-renderer/cell-template-context';

@Directive({
    selector: '[matrixViewFixedRightCell]'
})
export class MatrixViewFixedRightCellDirective<CellValueType> {
    /**
     * input for cell style
     * (name of the variable optimized for template micro syntax)
     */
    @Input()
    public matrixViewFixedRightCellHaveStyle: { [key: string]: string; };

    public constructor(public template: TemplateRef<CellTemplateContext<CellValueType>>) {

    }

    /** style object for the cell, {@link #matrixViewFixedRightCellHaveStyle} if set, empty object otherwise. */
    public get style(): { [key: string]: string; } {
        return this.matrixViewFixedRightCellHaveStyle ? this.matrixViewFixedRightCellHaveStyle : {};
    }

}
