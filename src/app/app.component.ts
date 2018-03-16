import {Component, OnInit} from '@angular/core';
import {MatrixViewModel} from './matrix-view/matrix-view-model';
import {MatrixViewConfig} from './matrix-view/matrix-view-config';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {FormControl} from '@angular/forms';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
    modelSubject = new BehaviorSubject<MatrixViewModel<string>>(null);
    colCountFormControl = new FormControl();
    tileSizeFormControl = new FormControl();
    private config: MatrixViewConfig = {};
    configSubject = new BehaviorSubject<MatrixViewConfig>(this.config);
    rowCountFormControl = new FormControl();
    fixedTopFormControl = new FormControl();
    fixedBottomFormControl = new FormControl();
    fixedLeftFormControl = new FormControl();
    fixedRightFormControl = new FormControl();
    logLevelFormControl = new FormControl();

    constructor() {
        this.colCountFormControl.setValue(10);
        this.rowCountFormControl.setValue(1);
        this.fixedTopFormControl.setValue(false);
        this.fixedBottomFormControl.setValue(false);
        this.fixedRightFormControl.setValue(false);
        this.fixedLeftFormControl.setValue(false);
        this.logLevelFormControl.setValue('debug');
        this.tileSizeFormControl.setValue(200);
    }

    ngOnInit(): void {
        this.updateMatrix();
    }

    ok(): void {
        this.updateMatrix();
    }

    private updateMatrix() {
        console.log('updateMatrix()');
        this.config = {
            logLevel: this.logLevelFormControl.value,
            showFixed: {
                top: this.fixedTopFormControl.value,
                bottom: this.fixedBottomFormControl.value,
                left: this.fixedLeftFormControl.value,
                right: this.fixedRightFormControl.value,
            },
            tileSize: {
                width: this.tileSizeFormControl.value,
                height: this.tileSizeFormControl.value,
            },
        };
        this.configSubject.next(this.config);
        const cells = [];
        for (let i = 0; i < this.rowCountFormControl.value; ++i) {
            const row = [];
            for (let j = 0; j < this.colCountFormControl.value; ++j) {
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
