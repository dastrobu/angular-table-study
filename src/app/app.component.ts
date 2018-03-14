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
        showFixed: {top: 1, left: 1, right: 0, bottom: 0}, logLevel: 'debug'
    };
    configSubject = new BehaviorSubject<MatrixViewConfig>(this.config);

    rows = 200;
    cols = 20;

    ngOnInit(): void {
        const cells = [];
        for (let i = 0; i < this.rows; ++i) {
            const row = [];
            for (let j = 0; j < this.cols; ++j) {
                row.push(`Cell ${i} ${j}`);
            }
            cells.push(row);
        }
        this.modelSubject.next({
            cells: cells,
            colModel: {
                colWidths: 100,
            }
        });

    }
}
