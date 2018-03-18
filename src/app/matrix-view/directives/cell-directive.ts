import {CellTemplateContext} from '../tile-renderer/cell-template-context';
import {TemplateRef} from '@angular/core';

export interface CellDirective<CellValueType> {
    /** cell template */
    template: TemplateRef<CellTemplateContext<CellValueType>>;

    /** style object for the cell, {@link #matrixViewCellHaveStyle} if set, empty object otherwise. */
    style: { [key: string]: string; };
}
