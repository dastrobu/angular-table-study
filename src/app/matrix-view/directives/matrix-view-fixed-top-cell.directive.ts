import {Directive, Input, TemplateRef} from '@angular/core';
import {CellTemplateContext} from '../cell/cell-template-context';
import {CellDirective} from './cell-directive';

@Directive({
    selector: '[matrixViewFixedTopCell]'
})
export class MatrixViewFixedTopCellDirective<CellValueType> implements CellDirective<CellValueType> {
    /**
     * input for cell style
     * (name of the variable optimized for template micro syntax)
     */
    @Input()
    public matrixViewFixedTopCellHaveStyle: { [key: string]: string; };

    public constructor(public template: TemplateRef<CellTemplateContext<CellValueType>>) {

    }

    /** style object for the cell, {@link #matrixViewFixedTopCellHaveStyle} if set, empty object otherwise. */
    public get style(): { [key: string]: string; } {
        return this.matrixViewFixedTopCellHaveStyle ? this.matrixViewFixedTopCellHaveStyle : {};
    }

}
