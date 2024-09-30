import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { environment } from '../../../../../environments/environment.dev';

export interface Course {
  course_id: string;  
  course_code: string;
  pre_req: string;
  co_req: string;
  course_title: string;
  lec_hours: number;
  lab_hours: number;
  units: number;
  tuition_hours: number;
}

export interface Semester {
  semester: number | string;
  courses: Course[];
}

export interface YearLevel {
  year_level: number;
  curriculum_id: number;
  curriculum_year: string;
  semester: {
    semester: number;
    courses: Course[];
  };
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
  providedIn: 'root'
})

export class PreferencesService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // Fetch assigned courses and programs by semester
  getAssignedCoursesBySem(): Observable<AssignedCoursesResponse> {
    return this.http.get<AssignedCoursesResponse>(`${this.baseUrl}/get-assigned-courses-sem`);
  }

  // Implement the submitPreferences method
  submitPreferences(preferences: any): Observable<any> {
    console.log('Submitting preferences:', preferences);
    // For now, we're just logging the preferences. You can modify this to handle actual submission to a backend
    return of({ success: true });
  }
}
