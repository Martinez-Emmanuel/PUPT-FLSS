import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogAdminLoginComponent } from './dialog-admin-login.component';

describe('DialogAdminLoginComponent', () => {
  let component: DialogAdminLoginComponent;
  let fixture: ComponentFixture<DialogAdminLoginComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DialogAdminLoginComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DialogAdminLoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
