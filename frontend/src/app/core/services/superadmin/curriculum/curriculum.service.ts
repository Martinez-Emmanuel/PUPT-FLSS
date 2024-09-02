import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { environment } from '../../../../../environments/environment.dev';

export interface Course {
  course_id: number;
  course_code: string;
  pre_req?: string;
  co_req?: string;
  course_title: string;
  lec_hours: number;
  lab_hours: number;
  units: number;
  tuition_hours: number;
  semester_id?: number;
}

export interface Semester {
  semester_id: number;
  semester: number;
  courses: Course[];
}

export interface YearLevel {
  year_level_id: number;
  year: number;
  semesters: Semester[];
}

export interface Program {
  name: string;
  year_levels: YearLevel[];
  number_of_years: number;
  curricula_program_id: number;
  program_id: number;
  program_code: string;
  program_title: string;
}

export interface Curriculum {
  curriculum_id: number;
  curriculum_year: string;
  status: string;
  programs: Program[];
}

@Injectable({
  providedIn: 'root',
})
export class CurriculumService {
  private baseUrl = environment.apiUrl;
  private curriculaSubject = new BehaviorSubject<Curriculum[]>([]);

  constructor(private http: HttpClient) {}

  getCurricula(): Observable<Curriculum[]> {
    return this.http.get<Curriculum[]>(`${this.baseUrl}/curricula`);
  }

  getCurriculumByYear(curriculumYear: string): Observable<Curriculum> {
    return this.http.get<Curriculum>(`${this.baseUrl}/curricula-details/${curriculumYear}`);
  }

  getProgramsByCurriculumYear(curriculumYear: string): Observable<Program[]> {
    return this.http.get<Program[]>(`${this.baseUrl}/programs-by-curriculum-year/${curriculumYear}`);
  }
  
  // updateCurriculum(updatedCurriculum: Curriculum): Observable<Curriculum> {
  //   const curricula = this.curriculaSubject.getValue();
  //   const index = curricula.findIndex(
  //       (c) => c.curriculum_year === updatedCurriculum.curriculum_year
  //   );
    
  //   if (index !== -1) {
  //       curricula[index] = updatedCurriculum;
  //       this.curriculaSubject.next([...curricula]);
  //       return of(updatedCurriculum);
  //   } else {
  //       console.error('Curriculum not found for year:', updatedCurriculum.curriculum_year);
  //       return throwError(() => new Error('Curriculum not found'));
  //   }
  // }

  getAllPrograms(): Observable<Program[]> {
    return this.http.get<Program[]>(`${this.baseUrl}/programs`); // Adjust the API endpoint according to your backend
  }

  mapSemesterToEnum(semesterNumber: number): string {
    switch (semesterNumber) {
      case 1:
        return 'First Semester';
      case 2:
        return 'Second Semester';
      case 3:
        return 'Summer Semester';
      default:
        return `Semester ${semesterNumber}`;
    }
  }

  updateCurriculaSubject(curricula: Curriculum[]): void {
    this.curriculaSubject.next(curricula);
  }

  //for curriculum component
  addCurriculum(curriculum: Partial<Curriculum>): Observable<any> {
    return this.http.post(`${this.baseUrl}/addCurriculum`, curriculum);
  }
  
  updateCurriculum(id: number, curriculum: Partial<Curriculum>): Observable<any> {
    return this.http.put(`${this.baseUrl}/updateCurriculum/${id}`, curriculum);
  }

  // curriculum.service.ts
  deleteCurriculum(curriculum_year: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/deleteCurriculum`, { curriculum_year });
  }

  //temp
  removeProgramFromCurriculum(curriculumYear: string, programId: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/removeProgramFromCurriculum`, {
      curriculum_year: curriculumYear,
      program_id: programId
    });
  }

  addProgramToCurriculum(curriculumYear: string, programId: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/addProgramToCurriculum`, {
      curriculum_year: curriculumYear,
      program_id: programId
    });
  }

  //add course
  addCourse(courseData: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/addCourse`, courseData);
  }

  // updateCourse(courseId: number, courseData: any): Observable<any> {
  //   return this.http.put(`${this.baseUrl}/courses/${courseId}`, courseData);
  // }

}
