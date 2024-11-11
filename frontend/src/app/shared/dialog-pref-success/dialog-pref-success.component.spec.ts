import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogPrefSuccessComponent } from './dialog-pref-success.component';

describe('DialogPrefSuccessComponent', () => {
  let component: DialogPrefSuccessComponent;
  let fixture: ComponentFixture<DialogPrefSuccessComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DialogPrefSuccessComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DialogPrefSuccessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
