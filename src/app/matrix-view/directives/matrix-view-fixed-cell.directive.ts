import {Directive, Input, TemplateRef} from '@angular/core';
import {CellTemplateContext} from '../matrix-view-tile-renderer/cell-template-context';

@Directive({
    selector: '[matrixViewFixedCell]'
})
export class MatrixViewFixedCellDirective<CellValueType> {
    /**
     * input for cell style
     * (name of the variable optimized for template micro syntax)
     */
    @Input()
    public matrixViewFixedCellHaveStyle: { [key: string]: string; };

    public constructor(public template: TemplateRef<CellTemplateContext<CellValueType>>) {

    }

    /** style object for the cell, {@link #matrixViewFixedCellHaveStyle} if set, empty object otherwise. */
    public get style(): { [key: string]: string; } {
        return this.matrixViewFixedCellHaveStyle ? this.matrixViewFixedCellHaveStyle : {};
    }

}
