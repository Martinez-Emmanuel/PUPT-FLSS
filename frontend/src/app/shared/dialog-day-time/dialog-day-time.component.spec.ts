import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogDayTimeComponent } from './dialog-day-time.component';

describe('DialogDayTimeComponent', () => {
  let component: DialogDayTimeComponent;
  let fixture: ComponentFixture<DialogDayTimeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DialogDayTimeComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DialogDayTimeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
