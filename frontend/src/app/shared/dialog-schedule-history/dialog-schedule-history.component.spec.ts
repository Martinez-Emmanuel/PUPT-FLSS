import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogScheduleHistoryComponent } from './dialog-schedule-history.component';

describe('DialogScheduleHistoryComponent', () => {
  let component: DialogScheduleHistoryComponent;
  let fixture: ComponentFixture<DialogScheduleHistoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DialogScheduleHistoryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DialogScheduleHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
