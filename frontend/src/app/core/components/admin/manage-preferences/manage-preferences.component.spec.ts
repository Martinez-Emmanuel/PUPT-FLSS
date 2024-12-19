import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManagePreferencesComponent } from './manage-preferences.component';

describe('ManagePreferencesComponent', () => {
  let component: ManagePreferencesComponent;
  let fixture: ComponentFixture<ManagePreferencesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManagePreferencesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManagePreferencesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
