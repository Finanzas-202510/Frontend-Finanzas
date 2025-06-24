import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BonosEditarComponent } from './bonos-editar.component';

describe('BonosEditarComponent', () => {
  let component: BonosEditarComponent;
  let fixture: ComponentFixture<BonosEditarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BonosEditarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BonosEditarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
