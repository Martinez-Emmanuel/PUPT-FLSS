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
                  semester: 1, // First Semester
                  courses: [
                    {
                      course_code: 'IT101',
                      pre_req: '',
                      co_req: '',
                      course_title: 'Intro to Programming',
                      lec_hours: 3,
                      lab_hours: 1,
                      units: 3,
                      tuition_hours: 4,
                    },
                    {
                      course_code: 'IT102',
                      pre_req: '',
                      co_req: '',
                      course_title: 'Intro to Computing',
                      lec_hours: 3,
                      lab_hours: 0,
                      units: 3,
                      tuition_hours: 3,
                    },
                  ],
                },
                {
                  semester: 2, // Second Semester
                  courses: [
                    {
                      course_code: 'IT201',
                      pre_req: 'IT101',
                      co_req: '',
                      course_title: 'Web Development',
                      lec_hours: 2,
                      lab_hours: 2,
                      units: 3,
                      tuition_hours: 4,
                    },
                    {
                      course_code: 'IT202',
                      pre_req: 'IT102',
                      co_req: '',
                      course_title: 'Data Structures & Algorithms',
                      lec_hours: 3,
                      lab_hours: 1,
                      units: 3,
                      tuition_hours: 4,
                    },
                  ],
                },
                {
                  semester: 3, // Summer Semester
                  courses: [
                    {
                      course_code: 'IT203',
                      pre_req: '',
                      co_req: '',
                      course_title: 'Introduction to Software Tools',
                      lec_hours: 2,
                      lab_hours: 2,
                      units: 3,
                      tuition_hours: 4,
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          name: 'BSA',
          number_of_years: 4,
          year_levels: [
            {
              year: 1,
              semesters: [
                {
                  semester: 1, // First Semester
                  courses: [
                    {
                      course_code: 'AC101',
                      pre_req: '',
                      co_req: '',
                      course_title: 'Intro to Accounting',
                      lec_hours: 3,
                      lab_hours: 0,
                      units: 3,
                      tuition_hours: 3,
                    },
                    {
                      course_code: 'AC102',
                      pre_req: '',
                      co_req: '',
                      course_title: 'Intro to Finances',
                      lec_hours: 3,
                      lab_hours: 0,
                      units: 3,
                      tuition_hours: 3,
                    },
                  ],
                },
                {
                  semester: 2, // Second Semester
                  courses: [
                    {
                      course_code: 'AC201',
                      pre_req: 'AC101',
                      co_req: '',
                      course_title: 'Principles of Management',
                      lec_hours: 3,
                      lab_hours: 0,
                      units: 3,
                      tuition_hours: 3,
                    },
                    {
                      course_code: 'AC202',
                      pre_req: 'AC102',
                      co_req: '',
                      course_title: 'Accounting Principles',
                      lec_hours: 3,
                      lab_hours: 1,
                      units: 3,
                      tuition_hours: 4,
                    },
                  ],
                },
                {
                  semester: 3, // Summer Semester
                  courses: [
                    {
                      course_code: 'AC203',
                      pre_req: '',
                      co_req: '',
                      course_title: 'Introduction to Business',
                      lec_hours: 3,
                      lab_hours: 0,
                      units: 3,
                      tuition_hours: 3,
                    },
                  ],
                },
              ],
            },
            {
              year: 2,
              semesters: [
                {
                  semester: 1, // First Semester
                  courses: [
                    {
                      course_code: 'AC301',
                      pre_req: 'AC202',
                      co_req: '',
                      course_title: 'Intermediate Accounting I',
                      lec_hours: 3,
                      lab_hours: 1,
                      units: 3,
                      tuition_hours: 4,
                    },
                    {
                      course_code: 'AC302',
                      pre_req: '',
                      co_req: '',
                      course_title: 'Business Law',
                      lec_hours: 3,
                      lab_hours: 0,
                      units: 3,
                      tuition_hours: 3,
                    },
                  ],
                },
                {
                  semester: 2, // Second Semester
                  courses: [
                    {
                      course_code: 'AC401',
                      pre_req: 'AC301',
                      co_req: '',
                      course_title: 'Intermediate Accounting II',
                      lec_hours: 3,
                      lab_hours: 1,
                      units: 3,
                      tuition_hours: 4,
                    },
                    {
                      course_code: 'AC402',
                      pre_req: 'AC302',
                      co_req: '',
                      course_title: 'Taxation',
                      lec_hours: 3,
                      lab_hours: 0,
                      units: 3,
                      tuition_hours: 3,
                    },
                  ],
                },
                {
                  semester: 3, // Summer Semester
                  courses: [
                    {
                      course_code: 'AC403',
                      pre_req: '',
                      co_req: '',
                      course_title: 'Business Ethics',
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
      ],
    },
  ]);

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

  mapSemesterToEnum(semesterNumber: number): string {
    switch (semesterNumber) {
      case 1:
        return 'First Semester';
      case 2:
        return 'Second Semester';
      case 3:
        return 'Summer Semester';
      default:
        return `${semesterNumber}`;
    }
  }
}
