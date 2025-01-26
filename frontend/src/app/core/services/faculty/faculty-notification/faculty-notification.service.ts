import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

import { Observable, throwError, ReplaySubject } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

import { environment } from '../../../../../environments/environment.dev';

export interface FacultyNotificationResponse {
  academic_year: string;
  semester: string;
  faculty_status: {
    preferences_enabled: boolean;
    schedule_published: boolean;
    preferences_deadline: string | null;
    preferences_start: string | null;
  };
}

@Injectable({
  providedIn: 'root',
})
export class FacultyNotificationService {
  private baseUrl = environment.apiUrl;

  private notificationsCache$ = new ReplaySubject<FacultyNotificationResponse>(
    1
  );
  private cacheExpirationTime: number = 0;
  private cacheTTL: number = 5 * 60 * 1000; // 5 minutes

  constructor(private http: HttpClient) {}

  /**
   * Fetch notifications and status for the faculty.
   * @param facultyId - The ID of the faculty member
   */
  getFacultyNotifications(
    facultyId: number
  ): Observable<FacultyNotificationResponse> {
    const now = Date.now();

    // If cache is available and valid, return cached data
    if (now < this.cacheExpirationTime) {
      return this.notificationsCache$.asObservable();
    }

    // Fetch from API if cache is expired or doesn't exist
    return this.http
      .get<FacultyNotificationResponse>(
        `${this.baseUrl}/faculty-notifications`,
        { params: { faculty_id: facultyId.toString() } }
      )
      .pipe(
        tap((response) => {
          this.notificationsCache$.next(response);
          this.cacheExpirationTime = Date.now() + this.cacheTTL;
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Handle HTTP errors.
   * @param error - The HTTP error response.
   */
  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Unknown error!';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else {
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    return throwError(() => new Error(errorMessage));
  }
}
