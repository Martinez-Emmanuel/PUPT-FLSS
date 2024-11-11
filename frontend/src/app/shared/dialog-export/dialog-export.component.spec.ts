import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogExportComponent } from './dialog-export.component';

describe('DialogExportComponent', () => {
  let component: DialogExportComponent;
  let fixture: ComponentFixture<DialogExportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DialogExportComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DialogExportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
