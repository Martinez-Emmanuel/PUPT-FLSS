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

  private handleError(error: HttpErrorResponse) {
    console.error('An error occurred:', error);
    return throwError(
      () => new Error('Something went wrong. Please try again later.')
    );
  }
}
