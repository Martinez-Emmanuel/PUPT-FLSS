import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TableGenericComponent } from './table-generic.component';

describe('TableGenericComponent', () => {
  let component: TableGenericComponent;
  let fixture: ComponentFixture<TableGenericComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TableGenericComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TableGenericComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
