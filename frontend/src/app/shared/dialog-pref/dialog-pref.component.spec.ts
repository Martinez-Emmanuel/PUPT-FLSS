import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogPrefComponent } from './dialog-pref.component';

describe('DialogPrefComponent', () => {
  let component: DialogPrefComponent;
  let fixture: ComponentFixture<DialogPrefComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DialogPrefComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DialogPrefComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
