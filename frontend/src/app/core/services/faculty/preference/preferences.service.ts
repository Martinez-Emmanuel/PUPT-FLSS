import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { map, shareReplay, tap, take, catchError } from 'rxjs/operators';

import { PreferredDay, Program, AssignedCoursesResponse } from '../../../../core/models/preferences.model';

import { environment } from '../../../../../environments/environment.dev';

@Injectable({
  providedIn: 'root',
})
export class PreferencesService {
  private baseUrl = environment.apiUrl;

  private preferencesCache = new Map<string, Observable<any>>();
  private preferencesSubject = new BehaviorSubject<any>(null);
  private preferences$ = this.preferencesSubject.asObservable();
  private programsCache$: Observable<{
    programs: Program[];
    active_semester_id: number;
  }> | null = null;

  constructor(private http: HttpClient) {}

  /**
   * Retrieves the list of programs for the active semester.
   * Uses caching to avoid unnecessary API requests.
   */
  getPrograms(): Observable<{
    programs: Program[];
    active_semester_id: number;
  }> {
    if (!this.programsCache$) {
      const url = `${this.baseUrl}/offered-courses-sem`;
      this.programsCache$ = this.http.get<AssignedCoursesResponse>(url).pipe(
        map((response) => ({
          programs: response.programs,
          active_semester_id: response.active_semester_id,
        })),
        shareReplay(1),
        catchError((error) => {
          console.error('Error fetching programs:', error);
          this.programsCache$ = null;
          return throwError(() => error);
        })
      );
    }
    return this.programsCache$;
  }

  /**
   * Retrieves cached user preferences, triggering an API call if none are loaded.
   * **Note**: This method is separate from the cached preferences by faculty_id.
   */
  getPreferences(): Observable<any> {
    if (!this.preferencesSubject.value) {
      this.fetchPreferences();
    }
    return this.preferences$;
  }

  /**
   * Fetches preferences data from the API and updates the preferences cache.
   */
  private fetchPreferences(): void {
    const url = `${this.baseUrl}/get-unique-preferences`;
    this.http
      .get(url)
      .pipe(take(1))
      .subscribe({
        next: (response) => {
          this.preferencesSubject.next(response);
        },
        error: (error) => {
          console.error('Error fetching preferences:', error);
          this.preferencesSubject.error(error);
        },
      });
  }

  /**
   * Retrieves preferences for a specific faculty by ID with caching.
   * If preferences for the given faculty_id are already cached, returns the cached Observable.
   * Otherwise, makes an API call, caches the result, and returns the Observable.
   */
  getPreferencesByFacultyId(facultyId: string): Observable<any> {
    if (!facultyId) {
      console.error('Invalid faculty ID provided.');
      return throwError(() => new Error('Invalid faculty ID'));
    }

    if (this.preferencesCache.has(facultyId)) {
      return this.preferencesCache.get(facultyId)!;
    }

    const url = `${this.baseUrl}/get-preferences/${facultyId}`;
    const preferences$ = this.http.get(url).pipe(
      shareReplay(1),
      catchError((error) => {
        console.error(
          `Error fetching preferences for faculty ID ${facultyId}:`,
          error
        );
        this.preferencesCache.delete(facultyId);
        return throwError(() => error);
      })
    );

    this.preferencesCache.set(facultyId, preferences$);
    return preferences$;
  }

  /**
   * Submits a single preference for a faculty member.
   */
  submitSinglePreference(preference: {
    faculty_id: number;
    active_semester_id: number;
    course_assignment_id: number;
    preferred_days: PreferredDay[];
  }): Observable<any> {
    const url = `${this.baseUrl}/submit-preferences`;
    return this.http.post(url, preference).pipe(
      tap(() => this.clearCaches(preference.faculty_id.toString())),
      catchError((error) => {
        console.error('Error submitting single preference:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Deletes a specific preference by ID and clears relevant caches upon success.
   */
  deletePreference(
    preferenceId: number,
    facultyId: string,
    activeSemesterId: number
  ): Observable<any> {
    const params = new HttpParams()
      .set('faculty_id', facultyId)
      .set('active_semester_id', activeSemesterId.toString());

    const url = `${this.baseUrl}/delete-preferences/${preferenceId}`;
    return this.http.delete(url, { params }).pipe(
      tap(() => this.clearCaches(facultyId)),
      catchError((error) => {
        console.error(`Error deleting preference ID ${preferenceId}:`, error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Toggles the preferences status for all faculty members and
   * refreshes preferences cache upon success.
   */
  toggleAllPreferences(
    status: boolean,
    deadline: string | null,
    startDate: string | null,
    sendEmail: boolean
  ): Observable<any> {
    return this.http
      .post(`${this.baseUrl}/toggle-all-preferences`, {
        status,
        global_deadline: deadline,
        global_start_date: startDate,
        send_email: sendEmail,
      })
      .pipe(
        tap(() => {
          this.fetchPreferences();
        }),
        catchError((error) => {
          console.error('Error toggling all preferences:', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Toggles the preference status for a specific faculty member
   * and refreshes preferences cache upon success.
   */
  toggleSingleFacultyPreferences(
    faculty_id: number,
    status: boolean,
    individual_deadline: string | null,
    individual_start_date: string | null,
    sendEmail: boolean
  ): Observable<any> {
    return this.http
      .post(`${this.baseUrl}/toggle-single-preferences`, {
        faculty_id,
        status,
        individual_deadline,
        individual_start_date,
        send_email: sendEmail,
      })
      .pipe(
        tap(() => {
          this.fetchPreferences();
        }),
        catchError((error) => {
          console.error(
            `Error toggling preferences for faculty ID ${faculty_id}:`,
            error
          );
          return throwError(() => error);
        })
      );
  }

  /**
   * Sends a request to enable access for the selected faculty.
   */
  requestAccess(facultyId: string): Observable<any> {
    const url = `${this.baseUrl}/request-access`;
    return this.http.post(url, { faculty_id: parseInt(facultyId, 10) }).pipe(
      tap(() => {
        this.updatePreferencesCache(facultyId);
      }),
      catchError((error) => {
        console.error('Error requesting access:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Cancels the access request for the selected faculty.
   */
  cancelRequestAccess(facultyId: string): Observable<any> {
    const url = `${this.baseUrl}/cancel-request-access`;
    return this.http.post(url, { faculty_id: parseInt(facultyId, 10) }).pipe(
      tap(() => {
        this.updatePreferencesCache(facultyId);
      }),
      catchError((error) => {
        console.error('Error cancelling access request:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Updates the preferences cache by fetching the latest data for a specific faculty_id.
   */
  updatePreferencesCache(facultyId: string): void {
    this.preferencesCache.delete(facultyId);
    this.getPreferencesByFacultyId(facultyId).subscribe({
      next: () => {
        console.log(`Preferences cache updated for faculty ID ${facultyId}.`);
      },
      error: (error) => {
        console.error(
          `Error updating preferences cache for faculty ID ${facultyId}:`,
          error
        );
      },
    });
  }

  /**
   * Clears the cached preferences for a specific faculty_id.
   */
  private clearCaches(facultyId: string): void {
    if (this.preferencesCache.has(facultyId)) {
      this.preferencesCache.delete(facultyId);
    }
  }

  clearAllCaches(): void {
    this.preferencesCache.clear();
    this.programsCache$ = null;
    this.preferencesSubject.next(null);
  }

  clearPreferencesCache(): void {
    this.preferencesSubject.next(null);
  }
}
