import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoadAndScheduleComponent } from './load-and-schedule.component';

describe('LoadAndScheduleComponent', () => {
  let component: LoadAndScheduleComponent;
  let fixture: ComponentFixture<LoadAndScheduleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoadAndScheduleComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LoadAndScheduleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
