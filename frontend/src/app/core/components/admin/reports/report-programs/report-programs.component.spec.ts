import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportProgramsComponent } from './report-programs.component';

describe('ReportProgramsComponent', () => {
  let component: ReportProgramsComponent;
  let fixture: ComponentFixture<ReportProgramsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReportProgramsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReportProgramsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
