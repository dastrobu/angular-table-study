import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {TileRendererComponent} from './tile-renderer.component';

describe('TileRendererComponent', () => {
    let component: TileRendererComponent<string>;
    let fixture: ComponentFixture<TileRendererComponent<string>>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [TileRendererComponent]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(TileRendererComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
