import {Component, OnInit} from '@angular/core';
import {MatrixViewModel} from './matrix-view/matrix-view-model';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
    model: MatrixViewModel<any> = new MatrixViewModel();

    ngOnInit(): void {
        this.model.cells = [
            ['Header 1', 'Header 2', 'Header 3'],
        ];
    }

}
