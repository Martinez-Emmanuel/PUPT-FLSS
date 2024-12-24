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
    academicYearsHistory$: Observable<any[]> | null;
    facultyAcademicYearsHistory: { [facultyId: number]: Observable<any[]> };
  } = {
    facultySchedulesReport$: null,
    roomSchedulesReport$: null,
    programSchedulesReport$: null,
    singleFacultySchedule: {},
    academicYearsHistory$: null,
    facultyAcademicYearsHistory: {},
  };

  constructor(private http: HttpClient) {}

  /**
   * Fetches the cached faculty schedules report or requests it if not cached
   */
  getFacultySchedulesReport(): Observable<any> {
    if (!this.cache.facultySchedulesReport$) {
      const url = `${this.baseUrl}/faculty-schedules-report`;
      this.cache.facultySchedulesReport$ = this.http
        .get(url)
        .pipe(shareReplay(1), catchError(this.handleError));
    }
    return this.cache.facultySchedulesReport$;
  }

  /**
   * Fetches the cached room schedules report or requests it if not cached.
   */
  getRoomSchedulesReport(): Observable<any> {
    if (!this.cache.roomSchedulesReport$) {
      const url = `${this.baseUrl}/room-schedules-report`;
      this.cache.roomSchedulesReport$ = this.http
        .get(url)
        .pipe(shareReplay(1), catchError(this.handleError));
    }
    return this.cache.roomSchedulesReport$;
  }

  /**
   * Fetches the cached program schedules report or requests it if not cached.
   */
  getProgramSchedulesReport(): Observable<any> {
    if (!this.cache.programSchedulesReport$) {
      const url = `${this.baseUrl}/program-schedules-report`;
      this.cache.programSchedulesReport$ = this.http
        .get(url)
        .pipe(shareReplay(1), catchError(this.handleError));
    }
    return this.cache.programSchedulesReport$;
  }

  /**
   * Fetches the schedule for a specific faculty member or requests it if not cached.
   */
  getSingleFacultySchedule(faculty_id: number): Observable<any> {
    if (!this.cache.singleFacultySchedule[faculty_id]) {
      const url = `${this.baseUrl}/single-faculty-schedule/${faculty_id}`;
      this.cache.singleFacultySchedule[faculty_id] = this.http
        .get(url)
        .pipe(shareReplay(1), catchError(this.handleError));
    }
    return this.cache.singleFacultySchedule[faculty_id];
  }

  /**
   * Fetches the schedule history for a single faculty based on
   * the selected academic year and semester.
   */
  getFacultyScheduleHistory(
    facultyId: number,
    activeSemesterId: number
  ): Observable<any> {
    const url = `${this.baseUrl}/faculty-schedule-history/${facultyId}`;
    const params = {
      active_semester_id: activeSemesterId.toString(),
    };
    return this.http.get(url, { params }).pipe(catchError(this.handleError));
  }

  /**
   * Fetches the past academic years and semesters where the faculty had schedules.
   */
  getFacultyAcademicYearsHistory(faculty_id: number): Observable<any[]> {
    if (!this.cache.facultyAcademicYearsHistory[faculty_id]) {
      const url = `${this.baseUrl}/faculty-academic-years-history/${faculty_id}`;
      this.cache.facultyAcademicYearsHistory[faculty_id] = this.http
        .get<any[]>(url)
        .pipe(shareReplay(1), catchError(this.handleError));
    }
    return this.cache.facultyAcademicYearsHistory[faculty_id];
  }

  /**
   * Toggles the publication status of all faculty schedules.
   */
  togglePublishAllSchedules(is_published: number): Observable<any> {
    const payload = { is_published };
    return this.http
      .post(`${this.baseUrl}/toggle-all-schedule`, payload)
      .pipe(catchError(this.handleError));
  }

  /**
   * Sends the schedule email to all faculty members.
   */
  sendAllSchedulesEmail(): Observable<any> {
    const url = `${this.baseUrl}/email-all-faculty-schedule`;
    return this.http.post(url, {}).pipe(catchError(this.handleError));
  }

  /**
   * Toggles the publication status of a specific faculty member's schedule.
   */
  togglePublishSingleSchedule(
    faculty_id: number,
    is_published: number
  ): Observable<any> {
    const payload = { faculty_id, is_published };
    return this.http
      .post(`${this.baseUrl}/toggle-single-schedule`, payload)
      .pipe(catchError(this.handleError));
  }

  /**
   * Sends the schedule email to a specific faculty member.
   */
  sendSingleFacultyScheduleEmail(faculty_id: number): Observable<any> {
    const payload = { faculty_id };
    return this.http
      .post(`${this.baseUrl}/email-single-faculty-schedule`, payload)
      .pipe(catchError(this.handleError));
  }

  /**
   * Clears a specified cache type or a single faculty cache by ID.
   */
  clearCache(
    cacheType:
      | 'faculty'
      | 'room'
      | 'program'
      | 'singleFaculty'
      | 'academicYears'
      | 'facultyAcademicYears',
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
      case 'academicYears':
        this.cache.academicYearsHistory$ = null;
        break;
      case 'facultyAcademicYears':
        if (faculty_id !== undefined) {
          delete this.cache.facultyAcademicYearsHistory[faculty_id];
        }
        break;
      default:
        console.warn('Invalid cache type specified');
    }
  }

  /**
   * Clears all caches.
   */
  clearAllCaches(): void {
    this.cache.facultySchedulesReport$ = null;
    this.cache.roomSchedulesReport$ = null;
    this.cache.programSchedulesReport$ = null;
    this.cache.singleFacultySchedule = {};
    this.cache.academicYearsHistory$ = null;
    this.cache.facultyAcademicYearsHistory = {};
  }

  private handleError(error: HttpErrorResponse) {
    console.error('An error occurred:', error);
    return throwError(
      () => new Error('Something went wrong. Please try again later.')
    );
  }
}
