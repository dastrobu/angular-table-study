import {Directive, Input, TemplateRef} from '@angular/core';
import {CellTemplateContext} from '../tile-renderer/cell-template-context';
import {CellDirective} from './cell-directive';

@Directive({
    selector: '[matrixViewFixedBottomCell]'
})
export class MatrixViewFixedBottomCellDirective<CellValueType> implements CellDirective<CellValueType> {
    /**
     * input for cell style
     * (name of the variable optimized for template micro syntax)
     */
    @Input()
    public matrixViewFixedBottomCellHaveStyle: { [key: string]: string; };

    public constructor(public template: TemplateRef<CellTemplateContext<CellValueType>>) {

    }

    /** style object for the cell, {@link #matrixViewFixedBottomCellHaveStyle} if set, empty object otherwise. */
    public get style(): { [key: string]: string; } {
        return this.matrixViewFixedBottomCellHaveStyle ? this.matrixViewFixedBottomCellHaveStyle : {};
    }

}
