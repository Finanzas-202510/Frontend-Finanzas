import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NuevoBonoComponent } from './nuevo-bono.component';

describe('NuevoBonoComponent', () => {
  let component: NuevoBonoComponent;
  let fixture: ComponentFixture<NuevoBonoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NuevoBonoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NuevoBonoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
