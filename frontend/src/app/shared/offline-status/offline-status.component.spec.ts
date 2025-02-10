import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OfflineStatusComponent } from './offline-status.component';

describe('OfflineStatusComponent', () => {
  let component: OfflineStatusComponent;
  let fixture: ComponentFixture<OfflineStatusComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OfflineStatusComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OfflineStatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
