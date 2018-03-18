import {Directive, Input, TemplateRef} from '@angular/core';

@Directive({
    selector: '[matrixViewFixedBottomRightCorner]'
})
export class MatrixViewFixedBottomRightCornerDirective {
    /**
     * input for corner style
     * (name of the variable optimized for template micro syntax)
     */
    @Input()
    public matrixViewFixedBottomRightCornerHaveStyle: { [key: string]: string; };

    public constructor(public template: TemplateRef<any>) {

    }

    /** style object for the corner, {@link #matrixViewFixedBottomRightCornerHaveStyle} if set, empty object otherwise. */
    public get style(): { [key: string]: string; } {
        return this.matrixViewFixedBottomRightCornerHaveStyle ? this.matrixViewFixedBottomRightCornerHaveStyle : {};
    }

}
