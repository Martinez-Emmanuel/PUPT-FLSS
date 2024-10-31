import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

import { ReplaySubject, Observable } from 'rxjs';
import { map, shareReplay, tap } from 'rxjs/operators';

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
  end_date?: string;
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

  private preferencesCacheSubject = new ReplaySubject<any>(1);
  private preferencesCache$ = this.preferencesCacheSubject.asObservable();

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
        shareReplay(1)
      );
    }
    return this.programsCache$;
  }

  /**
   * Retrieves the current user preferences.
   * Uses ReplaySubject to cache the preferences data.
   */
  getPreferences(): Observable<any> {
    if (!this.preferencesCacheSubject.observed) {
      const url = `${this.baseUrl}/view-preferences`;
      this.http.get(url).subscribe(
        (response) => {
          this.preferencesCacheSubject.next(response);
        },
        (error) => {
          this.preferencesCacheSubject.error(error);
        }
      );
    }
    return this.preferencesCache$;
  }

  /**
   * Submits user preferences and clears the caches.
   */
  submitPreferences(preferences: any): Observable<any> {
    const url = `${this.baseUrl}/submit-preferences`;
    return this.http.post(url, preferences).pipe(tap(() => this.clearCaches()));
  }

  /**
   * Deletes a specific preference by ID and clears preferences cache.
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
    return this.http
      .delete(url, { params })
      .pipe(tap(() => this.clearPreferencesCache()));
  }

  /**
   * Deletes all preferences for a specific faculty and active semester,
   * then clears the cache.
   */
  deleteAllPreferences(
    facultyId: string,
    activeSemesterId: number
  ): Observable<any> {
    const params = new HttpParams()
      .set('faculty_id', facultyId)
      .set('active_semester_id', activeSemesterId.toString());

    const url = `${this.baseUrl}/preferences`;
    return this.http
      .delete(url, { params })
      .pipe(tap(() => this.clearPreferencesCache()));
  }

  /**
   * Toggles the preferences status for all faculty members.
   * Optionally accepts a deadline for the preference.
   */
  toggleAllPreferences(
    status: boolean,
    deadline?: string | null
  ): Observable<any> {
    return this.http
      .post(`${this.baseUrl}/toggle-preferences-all`, {
        status,
        end_date: deadline,
      })
      .pipe(tap(() => this.updatePreferencesCache()));
  }

  /**
   * Sends a preference-related email.
   */
  sendPrefEmail(): Observable<any> {
    const url = `${this.baseUrl}/email-pref-enable`;
    return this.http.post(url, {}).pipe(
      tap(() => {
        console.log('Preference-related email sent.');
      })
    );
  }

  /**
   * Toggles the preference status for a specific faculty member.
   */
  toggleSingleFacultyPreferences(
    faculty_id: number,
    status: boolean
  ): Observable<any> {
    return this.http
      .post(`${this.baseUrl}/toggle-preferences-single`, { faculty_id, status })
      .pipe(tap(() => this.clearCaches()));
  }

  /**
   * Updates the preferences cache by fetching the latest data.
   */
  private updatePreferencesCache(): void {
    const url = `${this.baseUrl}/view-preferences`;
    this.http.get(url).subscribe((response) => {
      this.preferencesCacheSubject.next(response);
    });
  }

  /**
   * Clears both preferences and programs caches.
   */
  clearCaches(): void {
    this.clearPreferencesCache();
    this.programsCache$ = null;
  }

  /**
   * Clears the preferences cache and reinitializes the ReplaySubject.
   */
  clearPreferencesCache(): void {
    this.preferencesCacheSubject.next(null);
    this.preferencesCacheSubject = new ReplaySubject<any>(1);
    this.preferencesCache$ = this.preferencesCacheSubject.asObservable();
  }
}
