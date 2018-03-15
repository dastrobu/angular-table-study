import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {MatrixViewTileRendererComponent} from './matrix-view-tile-renderer.component';

describe('MatrixViewTileRendererComponent', () => {
    let component: MatrixViewTileRendererComponent<string>;
    let fixture: ComponentFixture<MatrixViewTileRendererComponent<string>>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [MatrixViewTileRendererComponent]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(MatrixViewTileRendererComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
