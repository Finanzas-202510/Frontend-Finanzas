import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BonosVistaComponent } from './bonos-vista.component';

describe('BonosVistaComponent', () => {
  let component: BonosVistaComponent;
  let fixture: ComponentFixture<BonosVistaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BonosVistaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BonosVistaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
