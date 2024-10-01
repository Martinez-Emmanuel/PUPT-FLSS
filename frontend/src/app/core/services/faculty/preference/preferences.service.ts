// preferences.service.ts

import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
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

  constructor(private http: HttpClient) {}

  getPrograms(): Observable<Program[]> {
    const url = `${this.baseUrl}/get-assigned-courses-sem`;
    return this.http
      .get<AssignedCoursesResponse>(url)
      .pipe(map((response) => response.programs));
  }

  submitPreferences(preferences: any): Observable<any> {
    const url = `${this.baseUrl}/submit-preferences`;
    console.log('Submitting preferences:', preferences);
    return this.http.post(url, preferences);
  }
}
