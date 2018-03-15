import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';

import {AppComponent} from './app.component';
import {MatrixViewComponent} from './matrix-view/matrix-view.component';
import {ReactiveFormsModule} from '@angular/forms';
import {MatrixViewTileRendererComponent} from './matrix-view/matrix-view-tile-renderer/matrix-view-tile-renderer.component';

@NgModule({
    declarations: [
        AppComponent,
        MatrixViewComponent,
        MatrixViewTileRendererComponent
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
