import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http'; 
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment.dev';

export interface Program {
  program_id: number;
  program_code: string;
  program_title: string;
  year_levels: YearLevel[]; 
  sections: { [yearLevel: string]: number };
  curriculums: { [yearLevel: string]: string };
}

export interface Section {
  section_id: number;
  section_name: string;
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
  course_id: number;
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
  courses: Schedule[];
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
  sections: Section[];
  semester?: {
    semester: number;
    courses: Schedule[];  // Assuming Schedule[] is the correct type for courses
  };
}



@Injectable({
  providedIn: 'root',
})
export class SchedulingService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // Fetch academic years from the backend
  getAcademicYears(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/academic-years-dropdown`);
  }
  
  // Set the active academic year and semester
  setActiveYearAndSemester(
    activeYear: number,  
    activeSemester: number  
  ): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/set-active-ay-sem`, {
      academic_year_id: activeYear,  
      semester_id: activeSemester,  
    });
  }

  // Fetch program details with year levels and curriculum versions for a specific academic year
  fetchProgramDetailsByAcademicYear(
    payload: { academic_year_id: number }): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/fetch-ay-prog-details`, payload);
  }

  // Update year levels' curricula for a specific academic year and program
  updateYearLevelsCurricula(
    academicYearId: number, 
    programId: number, yearLevels: YearLevel[]): 
    Observable<any> {
    const payload = {
      academic_year_id: academicYearId,
      program_id: programId,  
      year_levels: yearLevels.map((yl) => ({
          year_level: yl.year_level,
          curriculum_id: yl.curriculum_id
      }))
    }
    return this.http.post<any>(`${this.baseUrl}/update-yr-lvl-curricula`, 
      payload);
  }

  //Delete academic year
  deleteAcademicYear(academicYearId: number): Observable<any> {
    return this.http.request('DELETE', `${this.baseUrl}/delete-ay`, {
      body: { academic_year_id: academicYearId }
    });
  }
  
  // Delete a program from an academic year
  removeProgramFromAcademicYear(
    academicYearId: number, 
    programId: number): Observable<any> {
    return this.http.request('DELETE', `${this.baseUrl}/remove-program`, {
      body: { academic_year_id: academicYearId, program_id: programId }
    });
  }

  // Add new academic year
  addAcademicYear(yearStart: string, yearEnd: string): Observable<any> {
    const payload = { year_start: yearStart, year_end: yearEnd };
    return this.http.post<any>(`${this.baseUrl}/add-academic-year`, payload);
  }

  // Edit section on a specific year level
  updateSections(
    academicYearId: number, 
    programId: number, 
    yearLevel: number, 
    numberOfSections: number): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/update-sections`, {
      academic_year_id: academicYearId,
      program_id: programId,
      year_level: yearLevel,  
      number_of_sections: numberOfSections  
    });
  }

  // // Fetch all programs
  // getPrograms(): Observable<Program[]> {
  //   return this.http.get<Program[]>(`${this.baseUrl}/programs`);
  // }

  // Fetch sections by program and year
  getSections(program: string, year: number): Observable<string[]> {
    return this.http.get<string[]>(
      `${this.baseUrl}/programs/${program}/year/${year}/sections`
    );
  }

  getActiveYearAndSemester(): Observable<{ activeYear: string, activeSemester: number }> {
    return this.http.get<{ activeYear: string, activeSemester: number }>(
      `${this.baseUrl}/active-year-semester`
    );
  }

  getProgramsFromYearLevels(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/active-year-levels-curricula`);
  }

  getActiveYearLevelsCurricula(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/active-year-levels-curricula`);
  }
  
  getAssignedCoursesByProgramYearAndSection(programId: number, yearLevel: number, sectionId: number): Observable<any> {
    return this.http.get<any>(
      `${this.baseUrl}/get-assigned-courses-sem`, // Adjust the endpoint if necessary
      {
        params: {
          programId: programId.toString(),
          yearLevel: yearLevel.toString(),
          sectionId: sectionId.toString(),
        },
      }
    );
  }
  


}
