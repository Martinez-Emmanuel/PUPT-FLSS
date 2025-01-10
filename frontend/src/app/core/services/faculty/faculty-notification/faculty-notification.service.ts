import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

import { Observable, throwError, ReplaySubject } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

import { environment } from '../../../../../environments/environment.dev';

export interface Notification {
  faculty_notifications_id: number;
  faculty_id: number;
  message: string;
  is_read: number;
  created_at: string;
  updated_at: string;
  timestamp?: string;
}

@Injectable({
  providedIn: 'root',
})
export class FacultyNotificationService {
  private baseUrl = environment.apiUrl;

  private notificationsCache$ = new ReplaySubject<{
    notifications: Notification[];
  }>(1);
  private cacheExpirationTime: number = 0;
  private cacheTTL: number = 5 * 60 * 1000;

  constructor(private http: HttpClient) {}

  /**
   * Fetch notifications for the authenticated faculty.
   * Implements caching to minimize API calls.
   */
  getFacultyNotifications(): Observable<{ notifications: Notification[] }> {
    const now = Date.now();

    // If cache is available and valid, return cached data
    if (now < this.cacheExpirationTime) {
      return this.notificationsCache$.asObservable();
    }

    // Fetch from API if cache is expired or doesn't exist
    return this.http
      .get<{ notifications: Notification[] }>(
        `${this.baseUrl}/faculty-notifications`
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
   * Mark a specific notification as read.
   * @param notificationId - ID of the notification to mark as read.
   */
  markAsRead(notificationId: number): Observable<any> {
    return this.http
      .post(`${this.baseUrl}/faculty-notifications/${notificationId}/read`, {})
      .pipe(catchError(this.handleError));
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
