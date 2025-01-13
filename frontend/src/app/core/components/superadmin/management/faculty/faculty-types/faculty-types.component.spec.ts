import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FacultyTypesComponent } from './faculty-types.component';

describe('FacultyTypesComponent', () => {
  let component: FacultyTypesComponent;
  let fixture: ComponentFixture<FacultyTypesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FacultyTypesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FacultyTypesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
