import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http'; // Import HttpClient for API requests
import { Observable } from 'rxjs';

export interface Program {
  program_id: number;
  program_code: string;
  program_title: string;
  year_levels: YearLevel[];  // Array of YearLevel objects
  sections: { [yearLevel: string]: number };
  curriculums: { [yearLevel: string]: string };
}


export interface SectionsByProgram {
  [program: string]: {
    [year: number]: string[];
  };
}

export interface Curriculum {
  id: number;
  curriculum_year: string;
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

export interface Semester {
  semester_id: number;
  semester_number: string;
}

export interface AcademicYear {
  academic_year_id: number;
  academic_year: string;
  semesters: Semester[];
}

export interface YearLevel {
  year_level: number;
  curriculum_id: number;
  curriculum_year: string;
  number_of_sections: number;
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

  // Fetch program details with year levels and curriculum versions for a specific academic year
  fetchProgramDetailsByAcademicYear(payload: { academic_year_id: number }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/fetch-ay-prog-details`, payload);
  }

  // Update year levels' curricula for a specific academic year and program
 // Ensure this method is sending the correct program_id in the payload
  updateYearLevelsCurricula(academicYearId: number, programId: number, yearLevels: YearLevel[]): Observable<any> {
    const payload = {
      academic_year_id: academicYearId,
      program_id: programId,  // Ensure program_id is being sent correctly here
      year_levels: yearLevels.map((yl) => ({
          year_level: yl.year_level,
          curriculum_id: yl.curriculum_id
      }))
    }
    return this.http.post<any>(`${this.apiUrl}/update-yr-lvl-curricula`, payload);
  }

  deleteAcademicYear(academicYearId: number): Observable<any> {
    // Make sure to log the ID being sent
    console.log('Deleting academic year with ID:', academicYearId);
  
    return this.http.request('DELETE', `${this.apiUrl}/delete-ay`, {
      body: { academic_year_id: academicYearId }
    });
  }
  
  
  
  
  
  
  
  


  // Update the number of sections per program year level
  updateSections(academicYearId: number, programId: number, yearLevel: number, numberOfSections: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/update-sections`, {
      academic_year_id: academicYearId,
      program_id: programId,
      year_level: yearLevel,
      number_of_sections: numberOfSections
    });
  }

  // Fetch all programs
  getPrograms(): Observable<Program[]> {
    return this.http.get<Program[]>(`${this.apiUrl}/programs`);
  }

  // Fetch sections by program and year
  getSections(program: string, year: number): Observable<string[]> {
    return this.http.get<string[]>(
      `${this.apiUrl}/programs/${program}/year/${year}/sections`
    );
  }

  // Other service methods...
}
