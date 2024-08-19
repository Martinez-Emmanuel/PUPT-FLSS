import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';

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
}

export interface Curriculum {
  curriculum_year: string;
  status: string;
  programs: Program[];
}

@Injectable({
  providedIn: 'root',
})
export class CurriculumService {
  private curriculaSubject = new BehaviorSubject<Curriculum[]>([
    // Sample mock data to simulate API response
    {
      curriculum_year: '2022',
      status: 'Active',
      programs: [
        {
          name: 'BSIT',
          number_of_years: 4,
          year_levels: [
            {
              year: 1,
              semesters: [
                {
                  semester: 1,
                  courses: [
                    {
                      course_code: 'IT101',
                      course_title: 'Introduction to Information Technology',
                      lec_hours: 3,
                      lab_hours: 0,
                      units: 3,
                      tuition_hours: 3,
                    },
                    {
                      course_code: 'CS101',
                      course_title: 'Programming 1',
                      lec_hours: 2,
                      lab_hours: 3,
                      units: 3,
                      tuition_hours: 5,
                    },
                    {
                      course_code: 'GE101',
                      course_title: 'Mathematics in the Modern World',
                      lec_hours: 3,
                      lab_hours: 0,
                      units: 3,
                      tuition_hours: 3,
                    },
                    {
                      course_code: 'GE102',
                      course_title: 'Understanding the Self',
                      lec_hours: 3,
                      lab_hours: 0,
                      units: 3,
                      tuition_hours: 3,
                    },
                    {
                      course_code: 'PE101',
                      course_title: 'Physical Education 1',
                      lec_hours: 2,
                      lab_hours: 0,
                      units: 2,
                      tuition_hours: 2,
                    },
                  ],
                },
                {
                  semester: 2,
                  courses: [
                    {
                      course_code: 'IT102',
                      course_title: 'Computer Organization',
                      lec_hours: 3,
                      lab_hours: 0,
                      units: 3,
                      tuition_hours: 3,
                    },
                    {
                      course_code: 'CS102',
                      course_title: 'Programming 2',
                      lec_hours: 2,
                      lab_hours: 3,
                      units: 3,
                      tuition_hours: 5,
                    },
                    {
                      course_code: 'GE103',
                      course_title: 'Purposive Communication',
                      lec_hours: 3,
                      lab_hours: 0,
                      units: 3,
                      tuition_hours: 3,
                    },
                    {
                      course_code: 'GE104',
                      course_title: 'Art Appreciation',
                      lec_hours: 3,
                      lab_hours: 0,
                      units: 3,
                      tuition_hours: 3,
                    },
                    {
                      course_code: 'PE102',
                      course_title: 'Physical Education 2',
                      lec_hours: 2,
                      lab_hours: 0,
                      units: 2,
                      tuition_hours: 2,
                    },
                  ],
                },
                {
                  semester: 3,
                  courses: [
                    {
                      course_code: 'IT103',
                      course_title: 'Introduction to Web Development',
                      lec_hours: 2,
                      lab_hours: 3,
                      units: 3,
                      tuition_hours: 5,
                    },
                    {
                      course_code: 'CS103',
                      course_title: 'Data Structures and Algorithms',
                      lec_hours: 2,
                      lab_hours: 3,
                      units: 3,
                      tuition_hours: 5,
                    },
                    {
                      course_code: 'GE105',
                      course_title: 'Science, Technology, and Society',
                      lec_hours: 3,
                      lab_hours: 0,
                      units: 3,
                      tuition_hours: 3,
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          name: 'BSA',
          number_of_years: 5,
          year_levels: [
            {
              year: 1,
              semesters: [
                {
                  semester: 1,
                  courses: [
                    {
                      course_code: 'ACC101',
                      course_title: 'Introduction to Accounting',
                      lec_hours: 3,
                      lab_hours: 0,
                      units: 3,
                      tuition_hours: 3,
                    },
                    {
                      course_code: 'GE101',
                      course_title: 'Mathematics in the Modern World',
                      lec_hours: 3,
                      lab_hours: 0,
                      units: 3,
                      tuition_hours: 3,
                    },
                    {
                      course_code: 'GE102',
                      course_title: 'Understanding the Self',
                      lec_hours: 3,
                      lab_hours: 0,
                      units: 3,
                      tuition_hours: 3,
                    },
                    {
                      course_code: 'PE101',
                      course_title: 'Physical Education 1',
                      lec_hours: 2,
                      lab_hours: 0,
                      units: 2,
                      tuition_hours: 2,
                    },
                  ],
                },
                {
                  semester: 2,
                  courses: [
                    {
                      course_code: 'ACC102',
                      course_title: 'Fundamentals of Financial Accounting',
                      lec_hours: 3,
                      lab_hours: 0,
                      units: 3,
                      tuition_hours: 3,
                    },
                    {
                      course_code: 'GE103',
                      course_title: 'Purposive Communication',
                      lec_hours: 3,
                      lab_hours: 0,
                      units: 3,
                      tuition_hours: 3,
                    },
                    {
                      course_code: 'GE104',
                      course_title: 'Art Appreciation',
                      lec_hours: 3,
                      lab_hours: 0,
                      units: 3,
                      tuition_hours: 3,
                    },
                    {
                      course_code: 'PE102',
                      course_title: 'Physical Education 2',
                      lec_hours: 2,
                      lab_hours: 0,
                      units: 2,
                      tuition_hours: 2,
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  ]);

  private predefinedPrograms: Program[] = [
    {
      name: 'BSIT',
      number_of_years: 4,
      year_levels: this.generateYearLevels(4),
    },
    {
      name: 'BSA',
      number_of_years: 4,
      year_levels: this.generateYearLevels(4),
    },
  ];

  getCurricula(): Observable<Curriculum[]> {
    return this.curriculaSubject.asObservable();
  }

  getCurriculumByYear(year: string): Observable<Curriculum | undefined> {
    return of(
      this.curriculaSubject.getValue().find((c) => c.curriculum_year === year)
    );
  }

  addCurriculum(curriculum: Curriculum): Observable<Curriculum[]> {
    const curricula = this.curriculaSubject.getValue();
    this.curriculaSubject.next([...curricula, curriculum]);
    return of(this.curriculaSubject.getValue());
  }

  updateCurriculum(
    index: number,
    updatedCurriculum: Curriculum
  ): Observable<Curriculum[]> {
    const curricula = this.curriculaSubject.getValue();
    curricula[index] = updatedCurriculum;
    this.curriculaSubject.next([...curricula]);
    return of(this.curriculaSubject.getValue());
  }

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

  deleteCurriculum(index: number): Observable<Curriculum[]> {
    const curricula = this.curriculaSubject.getValue();
    curricula.splice(index, 1);
    this.curriculaSubject.next([...curricula]);
    return of(this.curriculaSubject.getValue());
  }

  getPredefinedPrograms(): Observable<Program[]> {
    return of(this.predefinedPrograms);
  }

  private generateYearLevels(years: number): YearLevel[] {
    return Array.from({ length: years }, (_, i) => ({
      year: i + 1,
      semesters: [
        { semester: 1, courses: [] },
        { semester: 2, courses: [] },
        { semester: 3, courses: [] },
      ],
    }));
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
}
