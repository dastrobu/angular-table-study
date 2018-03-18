import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {MatrixViewCellComponent} from './matrix-view-cell.component';

describe('MatrixViewCellComponent', () => {
    let component: MatrixViewCellComponent;
    let fixture: ComponentFixture<MatrixViewCellComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [MatrixViewCellComponent]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(MatrixViewCellComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
