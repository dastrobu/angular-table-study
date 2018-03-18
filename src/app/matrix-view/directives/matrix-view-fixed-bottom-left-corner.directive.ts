import {Directive, Input, TemplateRef} from '@angular/core';

@Directive({
    selector: '[matrixViewFixedBottomLeftCorner]'
})
export class MatrixViewFixedBottomLeftCornerDirective {
    /**
     * input for corner style
     * (name of the variable optimized for template micro syntax)
     */
    @Input()
    public matrixViewFixedBottomLeftCornerHaveStyle: { [key: string]: string; };

    public constructor(public template: TemplateRef<any>) {

    }

    /** style object for the corner, {@link #matrixViewFixedBottomLeftCornerHaveStyle} if set, empty object otherwise. */
    public get style(): { [key: string]: string; } {
        return this.matrixViewFixedBottomLeftCornerHaveStyle ? this.matrixViewFixedBottomLeftCornerHaveStyle : {};
    }

}
