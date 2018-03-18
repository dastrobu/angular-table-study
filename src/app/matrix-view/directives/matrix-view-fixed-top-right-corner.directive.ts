import {Directive, Input, TemplateRef} from '@angular/core';

@Directive({
    selector: '[matrixViewFixedTopRightCorner]'
})
export class MatrixViewFixedTopRightCornerDirective {
    /**
     * input for corner style
     * (name of the variable optimized for template micro syntax)
     */
    @Input()
    public matrixViewFixedTopRightCornerHaveStyle: { [key: string]: string; };

    public constructor(public template: TemplateRef<any>) {

    }

    /** style object for the corner, {@link #matrixViewFixedTopRightCornerHaveStyle} if set, empty object otherwise. */
    public get style(): { [key: string]: string; } {
        return this.matrixViewFixedTopRightCornerHaveStyle ? this.matrixViewFixedTopRightCornerHaveStyle : {};
    }

}
