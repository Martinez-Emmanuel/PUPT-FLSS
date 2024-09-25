import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogSchedulingComponent } from './dialog-scheduling.component';

describe('DialogSchedulingComponent', () => {
  let component: DialogSchedulingComponent;
  let fixture: ComponentFixture<DialogSchedulingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DialogSchedulingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DialogSchedulingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
