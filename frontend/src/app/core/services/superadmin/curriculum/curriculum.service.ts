import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {BehaviorSubject, Observable, of, throwError } from 'rxjs';

export interface Course {
  course_code: string;
  pre_req?: string;
  co_req?: string;
  course_title: string;
  lec_hours: number;
  lab_hours: number;
  units: number;
  tuition_hours: number;
}

export interface Semester {
  semester: number;
  courses: Course[];
}

export interface YearLevel {
  year: number;
  semesters: Semester[];
}

export interface Program {
  name: string;
  year_levels: YearLevel[];
  number_of_years: number;
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
  private baseUrl = 'http://127.0.0.1:8000/api'; // Replace with your backend API URL
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

  
}
