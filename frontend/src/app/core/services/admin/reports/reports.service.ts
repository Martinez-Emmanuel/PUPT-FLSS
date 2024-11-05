import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, shareReplay } from 'rxjs/operators';
import { environment } from '../../../../../environments/environment.dev';

@Injectable({
  providedIn: 'root',
})
export class ReportsService {
  private baseUrl = environment.apiUrl;

  private cache: {
    facultySchedulesReport$: Observable<any> | null;
    roomSchedulesReport$: Observable<any> | null;
    programSchedulesReport$: Observable<any> | null;
    singleFacultySchedule: { [facultyId: number]: Observable<any> };
  } = {
    facultySchedulesReport$: null,
    roomSchedulesReport$: null,
    programSchedulesReport$: null,
    singleFacultySchedule: {},
  };

  constructor(private http: HttpClient) {}

  // Faculty Schedules Report
  getFacultySchedulesReport(): Observable<any> {
    if (!this.cache.facultySchedulesReport$) {
      const url = `${this.baseUrl}/faculty-schedules-report`;
      this.cache.facultySchedulesReport$ = this.http
        .get(url)
        .pipe(shareReplay(1), catchError(this.handleError));
    }
    return this.cache.facultySchedulesReport$;
  }

  // Room Schedules Report
  getRoomSchedulesReport(): Observable<any> {
    if (!this.cache.roomSchedulesReport$) {
      const url = `${this.baseUrl}/room-schedules-report`;
      this.cache.roomSchedulesReport$ = this.http
        .get(url)
        .pipe(shareReplay(1), catchError(this.handleError));
    }
    return this.cache.roomSchedulesReport$;
  }

  // Program Schedules Report
  getProgramSchedulesReport(): Observable<any> {
    if (!this.cache.programSchedulesReport$) {
      const url = `${this.baseUrl}/program-schedules-report`;
      this.cache.programSchedulesReport$ = this.http
        .get(url)
        .pipe(shareReplay(1), catchError(this.handleError));
    }
    return this.cache.programSchedulesReport$;
  }

  // Single Faculty Schedule
  getSingleFacultySchedule(faculty_id: number): Observable<any> {
    if (!this.cache.singleFacultySchedule[faculty_id]) {
      const url = `${this.baseUrl}/single-faculty-schedule/${faculty_id}`;
      this.cache.singleFacultySchedule[faculty_id] = this.http
        .get(url)
        .pipe(shareReplay(1), catchError(this.handleError));
    }
    return this.cache.singleFacultySchedule[faculty_id];
  }

  // Toggle All Faculty Schedule
  togglePublishAllSchedules(is_published: number): Observable<any> {
    const payload = { is_published };
    return this.http
      .post(`${this.baseUrl}/toggle-all-schedule`, payload)
      .pipe(catchError(this.handleError));
  }

  // Send Schedule Email to All Faculty
  sendAllSchedulesEmail(): Observable<any> {
    const url = `${this.baseUrl}/email-all-faculty-schedule`;
    return this.http.post(url, {}).pipe(catchError(this.handleError));
  }

  // Toggle Single Faculty Schedule
  togglePublishSingleSchedule(
    faculty_id: number,
    is_published: number
  ): Observable<any> {
    const payload = { faculty_id, is_published };
    return this.http
      .post(`${this.baseUrl}/toggle-single-schedule`, payload)
      .pipe(catchError(this.handleError));
  }

  // Send Schedule Email to Single Faculty
  sendSingleFacultyScheduleEmail(faculty_id: number): Observable<any> {
    const payload = { faculty_id };
    return this.http
      .post(`${this.baseUrl}/email-single-faculty-schedule`, payload)
      .pipe(catchError(this.handleError));
  }

  clearCache(
    cacheType: 'faculty' | 'room' | 'program' | 'singleFaculty',
    faculty_id?: number
  ): void {
    switch (cacheType) {
      case 'faculty':
        this.cache.facultySchedulesReport$ = null;
        break;
      case 'room':
        this.cache.roomSchedulesReport$ = null;
        break;
      case 'program':
        this.cache.programSchedulesReport$ = null;
        break;
      case 'singleFaculty':
        if (faculty_id !== undefined) {
          delete this.cache.singleFacultySchedule[faculty_id];
        }
        break;
      default:
        console.warn('Invalid cache type specified');
    }
  }

  clearAllCaches(): void {
    this.cache.facultySchedulesReport$ = null;
    this.cache.roomSchedulesReport$ = null;
    this.cache.programSchedulesReport$ = null;
    this.cache.singleFacultySchedule = {};
  }

  private handleError(error: HttpErrorResponse) {
    console.error('An error occurred:', error);
    return throwError(
      () => new Error('Something went wrong. Please try again later.')
    );
  }
}
