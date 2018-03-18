import {Directive, Input, TemplateRef} from '@angular/core';

@Directive({
    selector: '[matrixViewFixedTopLeftCorner]'
})
export class MatrixViewFixedTopLeftCornerDirective {
    /**
     * input for corner style
     * (name of the variable optimized for template micro syntax)
     */
    @Input()
    public matrixViewFixedTopLeftCornerHaveStyle: { [key: string]: string; };

    public constructor(public template: TemplateRef<any>) {

    }

    /** style object for the corner, {@link #matrixViewFixedTopLeftCornerHaveStyle} if set, empty object otherwise. */
    public get style(): { [key: string]: string; } {
        return this.matrixViewFixedTopLeftCornerHaveStyle ? this.matrixViewFixedTopLeftCornerHaveStyle : {};
    }

}
