import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';

import {AppComponent} from './app.component';
import {MatrixViewComponent} from './matrix-view/matrix-view.component';
import {ReactiveFormsModule} from '@angular/forms';
import {TileRendererComponent} from './matrix-view/tile-renderer/tile-renderer.component';
import {MatrixViewCellDirective} from './matrix-view/directives/matrix-view-cell.directive';
import {MatrixViewFixedCellDirective} from './matrix-view/directives/matrix-view-fixed-cell.directive';
import {MatrixViewFixedTopCellDirective} from './matrix-view/directives/matrix-view-fixed-top-cell.directive';
import {MatrixViewFixedRightCellDirective} from './matrix-view/directives/matrix-view-fixed-right-cell.directive';
import {MatrixViewFixedBottomCellDirective} from './matrix-view/directives/matrix-view-fixed-bottom-cell.directive';
import {MatrixViewFixedLeftCellDirective} from './matrix-view/directives/matrix-view-fixed-left-cell.directive';
import {MatrixViewFixedCornerDirective} from './matrix-view/directives/matrix-view-fixed-corner.directive';
import {MatrixViewFixedBottomRightCornerDirective} from './matrix-view/directives/matrix-view-fixed-bottom-right-corner.directive';
import {MatrixViewFixedBottomLeftCornerDirective} from './matrix-view/directives/matrix-view-fixed-bottom-left-corner.directive';
import {MatrixViewFixedTopRightCornerDirective} from './matrix-view/directives/matrix-view-fixed-top-right-corner.directive';
import {MatrixViewFixedTopLeftCornerDirective} from './matrix-view/directives/matrix-view-fixed-top-left-corner.directive';
import {MatrixViewCellComponent} from './matrix-view/matrix-view-cell/matrix-view-cell.component';
import {ContainerComponent} from './matrix-view/container/container.component';

@NgModule({
    declarations: [
        AppComponent,
        MatrixViewComponent,
        TileRendererComponent,
        MatrixViewCellDirective,
        MatrixViewFixedCellDirective,
        MatrixViewFixedTopCellDirective,
        MatrixViewFixedRightCellDirective,
        MatrixViewFixedBottomCellDirective,
        MatrixViewFixedLeftCellDirective,
        MatrixViewFixedCornerDirective,
        MatrixViewFixedTopLeftCornerDirective,
        MatrixViewFixedTopRightCornerDirective,
        MatrixViewFixedBottomLeftCornerDirective,
        MatrixViewFixedBottomRightCornerDirective,
        MatrixViewCellComponent,
        ContainerComponent,
    ],
    imports: [
        BrowserModule,
        ReactiveFormsModule
    ],
    providers: [],
    bootstrap: [AppComponent]
})
export class AppModule {
}
