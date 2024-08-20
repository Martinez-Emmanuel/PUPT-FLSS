import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TableDialogComponent } from './table-dialog.component';

describe('TableDialogComponent', () => {
  let component: TableDialogComponent;
  let fixture: ComponentFixture<TableDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TableDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TableDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
