import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TimeSelectionDialogComponent } from './time-selection-dialog.component';

describe('TimeSelectionDialogComponent', () => {
  let component: TimeSelectionDialogComponent;
  let fixture: ComponentFixture<TimeSelectionDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TimeSelectionDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TimeSelectionDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
