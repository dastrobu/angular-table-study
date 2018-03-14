import {Component, OnInit} from '@angular/core';
import {MatrixViewModel} from './matrix-view/matrix-view-model';
import {MatrixViewConfig} from './matrix-view/matrix-view-config';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
    modelSubject = new BehaviorSubject<MatrixViewModel<string>>(null);
    private config: MatrixViewConfig = {
        showFixed: {top: 1, left: 1, right: 0, bottom: 0}, logLevel: 'trace'
    };
    configSubject = new BehaviorSubject<MatrixViewConfig>(this.config);

    ngOnInit(): void {
        this.modelSubject.next(
            {
                cells: [
                    // ['Header 1', 'Header 2', 'Header 3'],
                ]
            });

    }
}
