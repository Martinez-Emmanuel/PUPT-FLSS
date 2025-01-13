import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogRedirectComponent } from './dialog-redirect.component';

describe('DialogRedirectComponent', () => {
  let component: DialogRedirectComponent;
  let fixture: ComponentFixture<DialogRedirectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DialogRedirectComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DialogRedirectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
