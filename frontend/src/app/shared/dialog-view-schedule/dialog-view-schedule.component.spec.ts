import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogViewScheduleComponent } from './dialog-view-schedule.component';

describe('DialogViewScheduleComponent', () => {
  let component: DialogViewScheduleComponent;
  let fixture: ComponentFixture<DialogViewScheduleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DialogViewScheduleComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DialogViewScheduleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
