import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { environment } from '../../../../../environments/environment.dev';

export interface Notification {
  id: number;
  faculty_id: number;
  message: string;
  is_read: boolean;
  created_at: string;
  updated_at: string;
  timestamp?: string;
}

@Injectable({
  providedIn: 'root',
})
export class FacultyNotificationService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  /**
   * Fetch notifications for the authenticated faculty.
   */
  getFacultyNotifications(): Observable<{ notifications: Notification[] }> {
    return this.http
      .get<{ notifications: Notification[] }>(`${this.baseUrl}/faculty-notifications`)
      .pipe(catchError(this.handleError));
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
    // Customize error handling as needed
    let errorMessage = 'Unknown error!';
    if (error.error instanceof ErrorEvent) {
      // Client-side errors
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side errors
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    return throwError(() => new Error(errorMessage));
  }
}
