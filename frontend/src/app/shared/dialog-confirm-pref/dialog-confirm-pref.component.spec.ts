import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogConfirmPrefComponent } from './dialog-confirm-pref.component';

describe('DialogConfirmPrefComponent', () => {
  let component: DialogConfirmPrefComponent;
  let fixture: ComponentFixture<DialogConfirmPrefComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DialogConfirmPrefComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DialogConfirmPrefComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
