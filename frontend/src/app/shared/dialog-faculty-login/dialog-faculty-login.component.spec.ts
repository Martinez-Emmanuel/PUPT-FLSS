import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogFacultyLoginComponent } from './dialog-faculty-login.component';

describe('DialogFacultyLoginComponent', () => {
  let component: DialogFacultyLoginComponent;
  let fixture: ComponentFixture<DialogFacultyLoginComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DialogFacultyLoginComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DialogFacultyLoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
