import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../../../environments/environment.dev';

@Injectable({
  providedIn: 'root',
})
export class ReportsService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // Faculty Schedules Report
  getFacultySchedulesReport(): Observable<any> {
    return this.http
      .get(`${this.baseUrl}/faculty-schedules-report`)
      .pipe(catchError(this.handleError));
  }

  // Room Schedules Report
  getRoomSchedulesReport(): Observable<any> {
    return this.http
      .get(`${this.baseUrl}/room-schedules-report`)
      .pipe(catchError(this.handleError));
  }

  // Program Schedules Report
  getProgramSchedulesReport(): Observable<any> {
    return this.http
      .get(`${this.baseUrl}/program-schedules-report`)
      .pipe(catchError(this.handleError));
  }

  // Single Faculty Schedule
  getSingleFacultySchedule(faculty_id: number): Observable<any> {
    return this.http
      .get(`${this.baseUrl}/single-faculty-schedule/${faculty_id}`)
      .pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse) {
    console.error('An error occurred:', error);
    return throwError(
      () => new Error('Something went wrong. Please try again later.')
    );
  }
}
