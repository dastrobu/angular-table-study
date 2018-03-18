import {Directive, Input, TemplateRef} from '@angular/core';

@Directive({
    selector: '[matrixViewFixedCorner]'
})
export class MatrixViewFixedCornerDirective {
    /**
     * input for corner style
     * (name of the variable optimized for template micro syntax)
     */
    @Input()
    public matrixViewFixedCornerHaveStyle: { [key: string]: string; };

    public constructor(public template: TemplateRef<any>) {

    }

    /** style object for the corner, {@link #matrixViewFixedCornerHaveStyle} if set, empty object otherwise. */
    public get style(): { [key: string]: string; } {
        return this.matrixViewFixedCornerHaveStyle ? this.matrixViewFixedCornerHaveStyle : {};
    }

}
