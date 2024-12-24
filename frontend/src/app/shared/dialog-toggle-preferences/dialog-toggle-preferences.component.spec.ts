import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogTogglePreferencesComponent } from './dialog-toggle-preferences.component';

describe('DialogTogglePreferencesComponent', () => {
  let component: DialogTogglePreferencesComponent;
  let fixture: ComponentFixture<DialogTogglePreferencesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DialogTogglePreferencesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DialogTogglePreferencesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
