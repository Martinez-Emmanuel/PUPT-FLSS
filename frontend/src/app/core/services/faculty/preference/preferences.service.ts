import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { map, shareReplay, tap, take, catchError } from 'rxjs/operators';

import { environment } from '../../../../../environments/environment.dev';

export interface Course {
  course_assignment_id: number;
  course_id: number;
  course_code: string;
  pre_req: string;
  co_req: string;
  course_title: string;
  lec_hours: number;
  lab_hours: number;
  units: number;
  tuition_hours: number;
}

export interface ActiveSemester {
  active_semester_id: number;
  academic_year_id: number;
  academic_year: string;
  semester_id: number;
  semester_label: string;
  courses: Course[];
  global_deadline?: Date | null;
  individual_deadline?: Date | null;
}

export interface SemesterDetails {
  semester: number;
  courses: Course[];
}

export interface YearLevel {
  year_level: number;
  curriculum_id: number;
  curriculum_year: string;
  semester: SemesterDetails;
}

export interface Program {
  program_id: number;
  program_code: string;
  program_title: string;
  year_levels: YearLevel[];
}

export interface AssignedCoursesResponse {
  active_semester_id: number;
  academic_year_id: number;
  semester_id: number;
  programs: Program[];
}

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
          return throwError(() => new Error('Failed to fetch programs'));
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
    const url = `${this.baseUrl}/get-preferences`;
    this.http
      .get(url)
      .pipe(take(1))
      .subscribe({
        next: (response) => {
          this.preferencesSubject.next(response);
        },
        error: (error) => {
          console.error('Error fetching preferences:', error);
          this.preferencesSubject.error(
            new Error('Failed to fetch preferences')
          );
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
        return throwError(
          () =>
            new Error(`Failed to fetch preferences for faculty ID ${facultyId}`)
        );
      })
    );

    this.preferencesCache.set(facultyId, preferences$);
    return preferences$;
  }

  /**
   * Submits user preferences and clears relevant caches upon success.
   */
  submitPreferences(preferences: any): Observable<any> {
    const url = `${this.baseUrl}/submit-preferences`;
    return this.http.post(url, preferences).pipe(
      tap(() => this.clearCaches(preferences.faculty_id.toString())),
      catchError((error) => {
        console.error('Error submitting preferences:', error);
        return throwError(() => new Error('Failed to submit preferences'));
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

    const url = `${this.baseUrl}/preferences/${preferenceId}`;
    return this.http.delete(url, { params }).pipe(
      tap(() => this.clearCaches(facultyId)),
      catchError((error) => {
        console.error(`Error deleting preference ID ${preferenceId}:`, error);
        return throwError(
          () => new Error(`Failed to delete preference ID ${preferenceId}`)
        );
      })
    );
  }

  /**
   * Deletes all preferences for a specific faculty and active semester,
   * then clears the cache upon success.
   */
  deleteAllPreferences(
    facultyId: string,
    activeSemesterId: number
  ): Observable<any> {
    const params = new HttpParams()
      .set('faculty_id', facultyId)
      .set('active_semester_id', activeSemesterId.toString());

    const url = `${this.baseUrl}/preferences`;
    return this.http.delete(url, { params }).pipe(
      tap(() => this.clearCaches(facultyId)),
      catchError((error) => {
        console.error(
          `Error deleting all preferences for faculty ID ${facultyId}:`,
          error
        );
        return throwError(
          () =>
            new Error(
              `Failed to delete all preferences for faculty ID ${facultyId}`
            )
        );
      })
    );
  }

  /**
   * Toggles the preferences status for all faculty members and
   * refreshes preferences cache upon success.
   */
  toggleAllPreferences(
    status: boolean,
    deadline: string | null
  ): Observable<any> {
    return this.http
      .post(`${this.baseUrl}/toggle-preferences-all`, {
        status,
        global_deadline: deadline,
      })
      .pipe(
        tap(() => {
          this.fetchPreferences();
        }),
        catchError((error) => {
          console.error('Error toggling all preferences:', error);
          return throwError(
            () => new Error('Failed to toggle all preferences')
          );
        })
      );
  }

  /**
   * Sends an email to all faculty members to submit their preferences.
   */
  sendPreferencesEmailToAll(): Observable<any> {
    const url = `${this.baseUrl}/email-all-faculty-preferences`;
    return this.http.post(url, {}).pipe(
      tap(() => {
        console.log('Preference-related email sent to all faculty.');
      }),
      catchError((error) => {
        console.error('Error sending email to all faculty:', error);
        return throwError(
          () => new Error('Failed to send email to all faculty')
        );
      })
    );
  }

  /**
   * Toggles the preference status for a specific faculty member
   * and refreshes preferences cache upon success..
   */
  toggleSingleFacultyPreferences(
    faculty_id: number,
    status: boolean,
    individual_deadline: string | null
  ): Observable<any> {
    return this.http
      .post(`${this.baseUrl}/toggle-preferences-single`, {
        faculty_id,
        status,
        individual_deadline,
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
          return throwError(
            () =>
              new Error(
                `Failed to toggle preferences for faculty ID ${faculty_id}`
              )
          );
        })
      );
  }

  /**
   * Sends an email to a specific faculty member to submit their preferences.
   */
  sendPreferencesEmailToFaculty(faculty_id: number): Observable<any> {
    const url = `${this.baseUrl}/email-single-faculty-preferences`;
    return this.http.post(url, { faculty_id }).pipe(
      tap(() => {
        console.log(
          `Preference-related email sent to faculty ID ${faculty_id}.`
        );
      }),
      catchError((error) => {
        console.error(
          `Error sending email to faculty ID ${faculty_id}:`,
          error
        );
        return throwError(
          () => new Error(`Failed to send email to faculty ID ${faculty_id}`)
        );
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
