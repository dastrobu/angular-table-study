import {Component, OnInit} from '@angular/core';
import {MatrixViewModel} from './matrix-view/matrix-view-model';
import {MatrixViewConfig} from './matrix-view/matrix-view-config';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {FormControl} from '@angular/forms';
import {Cell} from './matrix-view/cell/cell';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
    public style = {
        cell: {
            'background': '#f5f5f5',

            'border-bottom': '1px solid black',
            'border-right': '1px solid black',
        },
        fixedCell: {
            top: {
                'background': '#d8d8d8',

                'border-bottom-width': '2px',
                'border-bottom-color': 'black',
                'border-bottom-style': 'solid',

                'border-right-width': '1px',
                'border-right-color': 'black',
                'border-right-style': 'solid',
            },
            right: {},
            bottom: {},
            left: {
                'background': '#d8d8d8',

                'border-bottom-width': '1px',
                'border-bottom-color': 'black',
                'border-bottom-style': 'solid',

                'border-right-width': '2px',
                'border-right-color': 'black',
                'border-right-style': 'solid',
            },
        },
        fixedCorner: {
            topLeft: {
                'background': '#d8d8d8',

                'border-bottom-width': '2px',
                'border-bottom-color': 'black',
                'border-bottom-style': 'solid',

                'border-right-width': '2px',
                'border-right-color': 'black',
                'border-right-style': 'solid',
            },
            topRight: {},
            bottomLeft: {},
            bottomRight: {},
        }
    };

    modelSubject = new BehaviorSubject<MatrixViewModel<string>>(null);
    colCountFormControl = new FormControl();
    tileHeightFormControl = new FormControl();
    tileWidthFormControl = new FormControl();
    private config: MatrixViewConfig = {};
    configSubject = new BehaviorSubject<MatrixViewConfig>(this.config);
    rowCountFormControl = new FormControl();
    fixedTopFormControl = new FormControl();
    fixedBottomFormControl = new FormControl();
    fixedLeftFormControl = new FormControl();
    fixedRightFormControl = new FormControl();
    logLevelFormControl = new FormControl();

    constructor() {
        this.colCountFormControl.setValue(2);
        this.rowCountFormControl.setValue(2);
        this.fixedTopFormControl.setValue(0);
        this.fixedBottomFormControl.setValue(1);
        this.fixedRightFormControl.setValue(0);
        this.fixedLeftFormControl.setValue(0);
        this.logLevelFormControl.setValue('trace');
        this.tileWidthFormControl.setValue(500);
        this.tileHeightFormControl.setValue(200);
    }

    ngOnInit(): void {
        this.updateMatrix();
    }

    ok(): void {
        this.updateMatrix();
    }

    mouseOverCell(cell: Cell<string>) {
        console.log(`mouseOverCell(${JSON.stringify(cell)})`);
    }

    mouseover(cell: Cell<string>) {
        console.log(`mouseover(${JSON.stringify(cell)})`);
    }

    mouseout(cell: Cell<string>) {
        console.log(`mouseout(${JSON.stringify(cell)})`);
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
                width: this.tileWidthFormControl.value,
                height: this.tileHeightFormControl.value,
            },
            // showFixedCorners: false,
        };
        this.configSubject.next(this.config);
        const cellValue = [];
        for (let i = 0; i < this.rowCountFormControl.value; ++i) {
            const row = [];
            for (let j = 0; j < this.colCountFormControl.value; ++j) {
                row.push(`Cell ${i} ${j}`);
            }
            cellValue.push(row);
        }
        this.modelSubject.next({
            cellValues: cellValue,
            colModel: {
                colWidths: 100,
            }
        });
    }
}
