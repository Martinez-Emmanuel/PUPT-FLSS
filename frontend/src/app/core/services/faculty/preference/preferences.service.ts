import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

import { Observable, BehaviorSubject } from 'rxjs';
import { map, shareReplay, tap, take } from 'rxjs/operators';

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

  private preferencesSubject = new BehaviorSubject<any>(null);
  private preferences$ = this.preferencesSubject.asObservable();

  private isLoading = false;
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
   * Retrieves cached user preferences, triggering an API call if none are loaded.
   */
  getPreferences(): Observable<any> {
    if (!this.preferencesSubject.value && !this.isLoading) {
      this.fetchPreferences();
    }
    return this.preferences$;
  }

  /**
   * Fetches preferences data from the API and updates the preferences cache.
   */
  private fetchPreferences(): void {
    this.isLoading = true;
    const url = `${this.baseUrl}/view-preferences`;
    this.http
      .get(url)
      .pipe(take(1))
      .subscribe({
        next: (response) => {
          this.preferencesSubject.next(response);
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error fetching preferences:', error);
          this.preferencesSubject.error(error);
          this.isLoading = false;
        },
      });
  }

  /**
   * Retrieves preferences for a specific faculty by ID.
   */
  getPreferencesByFacultyId(facultyId: string): Observable<any> {
    const url = `${this.baseUrl}/view-preferences/${facultyId}`;
    return this.http.get(url);
  }

  /**
   * Submits user preferences and clears the cached data.
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
        })
      );
  }

  /**
   * Sends email to all faculty members to submit their preferences.
   */
  sendPreferencesEmailToAll(): Observable<any> {
    const url = `${this.baseUrl}/email-all-faculty-preferences`;
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
        })
      );
  }

  /**
   * Sends email to a specific faculty to submit their preferences.
   */
  sendPreferencesEmailToFaculty(faculty_id: number): Observable<any> {
    const url = `${this.baseUrl}/email-single-faculty-preferences`;
    return this.http.post(url, { faculty_id });
  }

  /**
   * Updates the preferences cache by fetching the latest data.
   */
  updatePreferencesCache(): void {
    this.fetchPreferences();
  }

  clearCaches(): void {
    this.preferencesSubject.next(null);
    this.programsCache$ = null;
  }

  clearPreferencesCache(): void {
    this.preferencesSubject.next(null);
  }
}
