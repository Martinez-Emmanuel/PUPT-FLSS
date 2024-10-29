import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
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

  private preferencesCache$: Observable<any> | null = null;
  private programsCache$: Observable<{
    programs: Program[];
    active_semester_id: number;
  }> | null = null;

  constructor(private http: HttpClient) {}

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

  getPreferences(): Observable<any> {
    if (!this.preferencesCache$) {
      const url = `${this.baseUrl}/view-preferences`;
      this.preferencesCache$ = this.http.get(url).pipe(shareReplay(1));
    }
    return this.preferencesCache$;
  }

  submitPreferences(preferences: any): Observable<any> {
    const url = `${this.baseUrl}/submit-preferences`;
    console.log('Submitting preferences:', preferences);
    return this.http.post(url, preferences).pipe(tap(() => this.clearCaches()));
  }

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

  toggleAllFacultyPreferences(status: boolean): Observable<any> {
    const url = `${this.baseUrl}/toggle-preferences-all`;
    return this.http.post(url, { status }).pipe(tap(() => this.clearCaches()));
  }

  toggleSingleFacultyPreferences(
    faculty_id: number,
    status: boolean
  ): Observable<any> {
    const url = `${this.baseUrl}/toggle-preferences-single`;
    return this.http
      .post(url, { faculty_id, status })
      .pipe(tap(() => this.clearCaches()));
  }

  clearCaches(): void {
    this.preferencesCache$ = null;
    this.programsCache$ = null;
  }

  clearPreferencesCache(): void {
    this.preferencesCache$ = null;
  }
}
