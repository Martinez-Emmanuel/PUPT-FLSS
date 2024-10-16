import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FacultyScheduleTimetableComponent } from './faculty-schedule-timetable.component';

describe('FacultyScheduleTimetableComponent', () => {
  let component: FacultyScheduleTimetableComponent;
  let fixture: ComponentFixture<FacultyScheduleTimetableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FacultyScheduleTimetableComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FacultyScheduleTimetableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
