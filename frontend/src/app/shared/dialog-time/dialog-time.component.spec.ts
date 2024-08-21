import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogTimeComponent } from './dialog-time.component';

describe('DialogTimeComponent', () => {
  let component: DialogTimeComponent;
  let fixture: ComponentFixture<DialogTimeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DialogTimeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DialogTimeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
