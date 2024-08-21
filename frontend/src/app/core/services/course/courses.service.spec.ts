import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { CourseService } from './courses.service';

describe('CourseService', () => {
  let service: CourseService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        CourseService,
        { provide: CourseService, useValue: { baseUrl: 'http://localhost:3000/api' } } // Provide a mock value
      ]
    });
    service = TestBed.inject(CourseService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch courses', () => {
    const dummyCourses = [
      { course_id: 1, subject_code: 'CS101', subject_title: 'Computer Science 101', lec_hours: 3, lab_hours: 2, total_units: 4 }
    ];

    service.getCourses().subscribe(courses => {
      expect(courses.length).toBe(1);
      expect(courses).toEqual(dummyCourses);
    });

    const request = httpMock.expectOne('http://localhost');
    expect(request.request.method).toBe('GET');
    request.flush(dummyCourses);
  });
});
