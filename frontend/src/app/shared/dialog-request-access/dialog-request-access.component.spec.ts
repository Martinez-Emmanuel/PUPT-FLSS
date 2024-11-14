import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogRequestAccessComponent } from './dialog-request-access.component';

describe('DialogRequestAccessComponent', () => {
  let component: DialogRequestAccessComponent;
  let fixture: ComponentFixture<DialogRequestAccessComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DialogRequestAccessComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DialogRequestAccessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
