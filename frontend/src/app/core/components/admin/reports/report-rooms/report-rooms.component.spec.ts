import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportRoomsComponent } from './report-rooms.component';

describe('ReportRoomsComponent', () => {
  let component: ReportRoomsComponent;
  let fixture: ComponentFixture<ReportRoomsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReportRoomsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReportRoomsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
