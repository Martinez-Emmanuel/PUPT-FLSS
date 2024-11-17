import { TestBed } from '@angular/core/testing';

import { FacultyNotificationService } from './faculty-notification.service';

describe('FacultyNotificationService', () => {
  let service: FacultyNotificationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FacultyNotificationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
