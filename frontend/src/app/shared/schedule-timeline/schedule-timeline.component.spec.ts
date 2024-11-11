import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScheduleTimelineComponent } from './schedule-timeline.component';

describe('ScheduleTimelineComponent', () => {
  let component: ScheduleTimelineComponent;
  let fixture: ComponentFixture<ScheduleTimelineComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScheduleTimelineComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ScheduleTimelineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
