import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http'; // Import HttpClient for API requests
import { Observable } from 'rxjs';

export interface Program {
  id: number;
  code: string;
  title: string;
  number_of_years: number;
}

export interface SectionsByProgram {
  [program: string]: {
    [year: number]: string[];
  };
}

export interface Curriculum {
  id: number;
  name: string;
}

export interface Schedule {
  id: number;
  course_code: string;
  course_title: string;
  lec_hours: number;
  lab_hours: number;
  units: number;
  tuition_hours: number;
  day: string;
  time: string;
  professor: string;
  room: string;
  program: string;
  year: number;
  curriculum: string;
  section: string;
}

// export type Semester = '1st Semester' | '2nd Semester' | 'Summer Semester';
// export type AcademicYear = `${number}-${number}`;

export interface Semester {
  semester_id: number;
  semester_number: string;
}

export interface AcademicYear {
  academic_year_id: number;
  academic_year: string;
  semesters: Semester[];
}


@Injectable({
  providedIn: 'root',
})
export class SchedulingService {
  // Base URL for the backend API
  private apiUrl = 'http://127.0.0.1:8000/api'; // Update this if needed to match your API's base URL

  constructor(private http: HttpClient) {}

  // Fetch academic years from the backend
  getAcademicYears(): Observable<any[]> {
    // Call your backend API to get academic years
    return this.http.get<any[]>(`${this.apiUrl}/academic-years-dropdown`);
  }

  getActiveYearAndSemester(): Observable<{ activeYear: string, activeSemester: string }> {
    return this.http.get<{ activeYear: string, activeSemester: string }>(`${this.apiUrl}/get-active-year-semester`);
  }
  
  

  setActiveYearAndSemester(
    activeYear: number,  // Expect the academic_year_id
    activeSemester: number  // Expect the semester_id
  ): Observable<void> {
    // Update the active year and semester via the backend
    return this.http.post<void>(`${this.apiUrl}/set-active-ay-sem`, {
      academic_year_id: activeYear,  // Send the ID, not the entire object
      semester_id: activeSemester,   // Send the semester ID
    });
  }
  

  // Other service methods...

  getPrograms(): Observable<Program[]> {
    return this.http.get<Program[]>(`${this.apiUrl}/programs`);
  }

  getSections(program: string, year: number): Observable<string[]> {
    return this.http.get<string[]>(
      `${this.apiUrl}/programs/${program}/year/${year}/sections`
    );
  }

  // You can modify other mock data-related methods to use backend API calls
  // according to your backend endpoints.
}
