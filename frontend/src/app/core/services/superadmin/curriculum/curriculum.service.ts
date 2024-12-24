import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { environment } from '../../../../../environments/environment.dev';

export interface Course {
  course_id: number;
  course_code: string;
  prerequisites?: CourseRequirement[];
  corequisites?: CourseRequirement[];
  course_title: string;
  lec_hours: number;
  lab_hours: number;
  units: number;
  tuition_hours: number;
  semester_id?: number;
  pre_req?: string[] | string;
  co_req?: string[] | string;
}

export interface CourseRequirement {
  course_id: number;
  course_code: string;
  course_title: string;
}

export interface Semester {
  semester_id: number;
  semester: number;
  courses: Course[];
}

export interface YearLevel {
  year_level_id?: number;
  year: number;
  semesters: Semester[];
}

export interface Program {
  status: string;
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

  //Fetch all curricula
  getCurricula(): Observable<Curriculum[]> {
    return this.http.get<Curriculum[]>(`${this.baseUrl}/curricula`);
  }

  // Fetch all details based on curriculum year
  getCurriculumByYear(curriculumYear: string): Observable<Curriculum> {
    return this.http.get<Curriculum>(
      `${this.baseUrl}/curricula-details/${curriculumYear}`
    );
  }

  // For Programs

  // Fetch all programs associated to the Curriculum Year
  getProgramsByCurriculumYear(curriculumYear: string): Observable<Program[]> {
    return this.http.get<Program[]>(
      `${this.baseUrl}/programs-by-curriculum-year/${curriculumYear}`
    );
  }

  // Fetch all programs
  getAllPrograms(): Observable<Program[]> {
    return this.http.get<Program[]>(`${this.baseUrl}/programs`);
  }

  // Add the program to specific Curriculum year
  addProgramToCurriculum(
    curriculumYear: string,
    programId: number
  ): Observable<any> {
    return this.http.post(`${this.baseUrl}/addProgramToCurriculum`, {
      curriculum_year: curriculumYear,
      program_id: programId,
    });
  }

  // Delete a program in specific curriculum year
  removeProgramFromCurriculum(
    curriculumYear: string,
    programId: number
  ): Observable<any> {
    return this.http.post(`${this.baseUrl}/removeProgramFromCurriculum`, {
      curriculum_year: curriculumYear,
      program_id: programId,
    });
  }

  // Map semester number to string
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

  //For curriculum component

  //Add Curriculum
  addCurriculum(curriculum: Partial<Curriculum>): Observable<any> {
    return this.http.post(`${this.baseUrl}/addCurriculum`, curriculum);
  }

  // Update Curriculum
  updateCurriculum(
    id: number,
    curriculum: Partial<Curriculum>
  ): Observable<any> {
    return this.http.put(`${this.baseUrl}/updateCurriculum/${id}`, curriculum);
  }

  // Delete Curriculum
  deleteCurriculum(curriculum_year: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/deleteCurriculum`, {
      curriculum_year,
    });
  }

  // For copying an existing curriculum
  copyCurriculum(
    curriculumId: number,
    newCurriculumYear: string
  ): Observable<any> {
    return this.http.post(`${this.baseUrl}/copyCurriculum`, {
      curriculum_id: curriculumId,
      new_curriculum_year: newCurriculumYear,
    });
  }

  // For Course (inside the curriculum year)
  //Add course
  addCourse(courseData: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/addCourse`, courseData);
  }

  // Update course
  updateCourse(courseId: number, courseData: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/courses/${courseId}`, courseData);
  }

  // Delete course
  deleteCourse(courseId: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/courses/${courseId}`);
  }

  //will delete din naman
  updateEntireCurriculum(
    updatedCurriculum: Curriculum
  ): Observable<Curriculum> {
    const curricula = this.curriculaSubject.getValue();
    const index = curricula.findIndex(
      (c) => c.curriculum_year === updatedCurriculum.curriculum_year
    );
    if (index !== -1) {
      curricula[index] = updatedCurriculum;
      this.curriculaSubject.next([...curricula]);
      return of(updatedCurriculum);
    }
    return throwError(() => new Error('Curriculum not found'));
  }
}
