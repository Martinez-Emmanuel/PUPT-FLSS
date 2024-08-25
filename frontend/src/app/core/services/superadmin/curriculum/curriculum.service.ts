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
  sections: number;
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
          name: 'BSIT - Bachelor of Science In Information Technology',
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
              sections: 1,
            },
            {
              year: 2,
              semesters: [
                {
                  semester: 1,
                  courses: [
                    {
                      course_code: 'IT201',
                      course_title: 'Database Management Systems',
                      lec_hours: 2,
                      lab_hours: 3,
                      units: 3,
                      tuition_hours: 5,
                    },
                    {
                      course_code: 'CS201',
                      course_title: 'Object-Oriented Programming',
                      lec_hours: 2,
                      lab_hours: 3,
                      units: 3,
                      tuition_hours: 5,
                    },
                    {
                      course_code: 'GE201',
                      course_title: 'Ethics',
                      lec_hours: 3,
                      lab_hours: 0,
                      units: 3,
                      tuition_hours: 3,
                    },
                    {
                      course_code: 'PE201',
                      course_title: 'Physical Education 3',
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
                      course_code: 'IT202',
                      course_title: 'Network Fundamentals',
                      lec_hours: 2,
                      lab_hours: 3,
                      units: 3,
                      tuition_hours: 5,
                    },
                    {
                      course_code: 'CS202',
                      course_title: 'Software Engineering',
                      lec_hours: 2,
                      lab_hours: 3,
                      units: 3,
                      tuition_hours: 5,
                    },
                    {
                      course_code: 'GE202',
                      course_title: 'The Contemporary World',
                      lec_hours: 3,
                      lab_hours: 0,
                      units: 3,
                      tuition_hours: 3,
                    },
                    {
                      course_code: 'PE202',
                      course_title: 'Physical Education 4',
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
                      course_code: 'IT203',
                      course_title: 'Human-Computer Interaction',
                      lec_hours: 2,
                      lab_hours: 3,
                      units: 3,
                      tuition_hours: 5,
                    },
                    {
                      course_code: 'CS203',
                      course_title: 'Web Development Frameworks',
                      lec_hours: 2,
                      lab_hours: 3,
                      units: 3,
                      tuition_hours: 5,
                    },
                    {
                      course_code: 'GE203',
                      course_title: 'Life and Works of Rizal',
                      lec_hours: 3,
                      lab_hours: 0,
                      units: 3,
                      tuition_hours: 3,
                    },
                  ],
                },
              ],
              sections: 1,
            },
            {
              year: 3,
              semesters: [
                {
                  semester: 1,
                  courses: [
                    {
                      course_code: 'IT301',
                      course_title: 'Advanced Database Systems',
                      lec_hours: 2,
                      lab_hours: 3,
                      units: 3,
                      tuition_hours: 5,
                    },
                    {
                      course_code: 'CS301',
                      course_title: 'Mobile Application Development',
                      lec_hours: 2,
                      lab_hours: 3,
                      units: 3,
                      tuition_hours: 5,
                    },
                    {
                      course_code: 'IT302',
                      course_title: 'Information Security',
                      lec_hours: 3,
                      lab_hours: 0,
                      units: 3,
                      tuition_hours: 3,
                    },
                    {
                      course_code: 'GE301',
                      course_title: 'Environmental Science',
                      lec_hours: 3,
                      lab_hours: 0,
                      units: 3,
                      tuition_hours: 3,
                    },
                  ],
                },
                {
                  semester: 2,
                  courses: [
                    {
                      course_code: 'IT303',
                      course_title: 'Systems Administration',
                      lec_hours: 2,
                      lab_hours: 3,
                      units: 3,
                      tuition_hours: 5,
                    },
                    {
                      course_code: 'CS302',
                      course_title: 'Data Analytics',
                      lec_hours: 2,
                      lab_hours: 3,
                      units: 3,
                      tuition_hours: 5,
                    },
                    {
                      course_code: 'IT304',
                      course_title: 'Cloud Computing',
                      lec_hours: 2,
                      lab_hours: 3,
                      units: 3,
                      tuition_hours: 5,
                    },
                  ],
                },
                {
                  semester: 3,
                  courses: [
                    {
                      course_code: 'IT305',
                      course_title: 'IT Project Management',
                      lec_hours: 3,
                      lab_hours: 0,
                      units: 3,
                      tuition_hours: 3,
                    },
                    {
                      course_code: 'CS303',
                      course_title: 'Artificial Intelligence',
                      lec_hours: 2,
                      lab_hours: 3,
                      units: 3,
                      tuition_hours: 5,
                    },
                    {
                      course_code: 'IT306',
                      course_title: 'Capstone Project 1',
                      lec_hours: 3,
                      lab_hours: 0,
                      units: 3,
                      tuition_hours: 3,
                    },
                  ],
                },
              ],
              sections: 1,
            },
            {
              year: 4,
              semesters: [
                {
                  semester: 1,
                  courses: [
                    {
                      course_code: 'IT401',
                      course_title: 'Cybersecurity',
                      lec_hours: 3,
                      lab_hours: 0,
                      units: 3,
                      tuition_hours: 3,
                    },
                    {
                      course_code: 'CS401',
                      course_title: 'Machine Learning',
                      lec_hours: 2,
                      lab_hours: 3,
                      units: 3,
                      tuition_hours: 5,
                    },
                    {
                      course_code: 'IT402',
                      course_title: 'Capstone Project 2',
                      lec_hours: 3,
                      lab_hours: 0,
                      units: 3,
                      tuition_hours: 3,
                    },
                  ],
                },
                {
                  semester: 2,
                  courses: [
                    {
                      course_code: 'IT403',
                      course_title: 'Emerging Technologies',
                      lec_hours: 3,
                      lab_hours: 0,
                      units: 3,
                      tuition_hours: 3,
                    },
                    {
                      course_code: 'CS402',
                      course_title: 'Big Data',
                      lec_hours: 2,
                      lab_hours: 3,
                      units: 3,
                      tuition_hours: 5,
                    },
                    {
                      course_code: 'IT404',
                      course_title: 'Industry Immersion',
                      lec_hours: 0,
                      lab_hours: 0,
                      units: 6,
                      tuition_hours: 6,
                    },
                  ],
                },
              ],
              sections: 1,
            },
          ],
        },
        {
          name: 'BSA - Bachelor of Science In Accountancy',
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
              sections: 1,
            },
            {
              year: 2,
              semesters: [
                {
                  semester: 1,
                  courses: [
                    {
                      course_code: 'ACC201',
                      course_title: 'Intermediate Accounting 1',
                      lec_hours: 3,
                      lab_hours: 0,
                      units: 3,
                      tuition_hours: 3,
                    },
                    {
                      course_code: 'ACC202',
                      course_title: 'Financial Management',
                      lec_hours: 3,
                      lab_hours: 0,
                      units: 3,
                      tuition_hours: 3,
                    },
                    {
                      course_code: 'GE201',
                      course_title: 'Ethics',
                      lec_hours: 3,
                      lab_hours: 0,
                      units: 3,
                      tuition_hours: 3,
                    },
                    {
                      course_code: 'PE201',
                      course_title: 'Physical Education 3',
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
                      course_code: 'ACC203',
                      course_title: 'Intermediate Accounting 2',
                      lec_hours: 3,
                      lab_hours: 0,
                      units: 3,
                      tuition_hours: 3,
                    },
                    {
                      course_code: 'ACC204',
                      course_title: 'Business Law and Taxation',
                      lec_hours: 3,
                      lab_hours: 0,
                      units: 3,
                      tuition_hours: 3,
                    },
                    {
                      course_code: 'GE202',
                      course_title: 'The Contemporary World',
                      lec_hours: 3,
                      lab_hours: 0,
                      units: 3,
                      tuition_hours: 3,
                    },
                    {
                      course_code: 'PE202',
                      course_title: 'Physical Education 4',
                      lec_hours: 2,
                      lab_hours: 0,
                      units: 2,
                      tuition_hours: 2,
                    },
                  ],
                },
              ],
              sections: 1,
            },
            {
              year: 3,
              semesters: [
                {
                  semester: 1,
                  courses: [
                    {
                      course_code: 'ACC301',
                      course_title:
                        'Advanced Financial Accounting and Reporting',
                      lec_hours: 3,
                      lab_hours: 0,
                      units: 3,
                      tuition_hours: 3,
                    },
                    {
                      course_code: 'ACC302',
                      course_title: 'Cost Accounting',
                      lec_hours: 3,
                      lab_hours: 0,
                      units: 3,
                      tuition_hours: 3,
                    },
                    {
                      course_code: 'GE301',
                      course_title: 'Environmental Science',
                      lec_hours: 3,
                      lab_hours: 0,
                      units: 3,
                      tuition_hours: 3,
                    },
                  ],
                },
                {
                  semester: 2,
                  courses: [
                    {
                      course_code: 'ACC303',
                      course_title: 'Auditing and Assurance Principles',
                      lec_hours: 3,
                      lab_hours: 0,
                      units: 3,
                      tuition_hours: 3,
                    },
                    {
                      course_code: 'ACC304',
                      course_title: 'Management Accounting',
                      lec_hours: 3,
                      lab_hours: 0,
                      units: 3,
                      tuition_hours: 3,
                    },
                  ],
                },
              ],
              sections: 1,
            },
            {
              year: 4,
              semesters: [
                {
                  semester: 1,
                  courses: [
                    {
                      course_code: 'ACC401',
                      course_title: 'Taxation and Law',
                      lec_hours: 3,
                      lab_hours: 0,
                      units: 3,
                      tuition_hours: 3,
                    },
                    {
                      course_code: 'ACC402',
                      course_title: 'Accounting Information Systems',
                      lec_hours: 3,
                      lab_hours: 0,
                      units: 3,
                      tuition_hours: 3,
                    },
                  ],
                },
                {
                  semester: 2,
                  courses: [
                    {
                      course_code: 'ACC403',
                      course_title: 'Capstone Project for Accountancy',
                      lec_hours: 3,
                      lab_hours: 0,
                      units: 3,
                      tuition_hours: 3,
                    },
                    {
                      course_code: 'ACC404',
                      course_title: 'Strategic Business Analysis',
                      lec_hours: 3,
                      lab_hours: 0,
                      units: 3,
                      tuition_hours: 3,
                    },
                  ],
                },
              ],
              sections: 1,
            },
            {
              year: 5,
              semesters: [
                {
                  semester: 1,
                  courses: [
                    {
                      course_code: 'ACC501',
                      course_title: 'Practicum in Accounting',
                      lec_hours: 0,
                      lab_hours: 0,
                      units: 6,
                      tuition_hours: 6,
                    },
                  ],
                },
                {
                  semester: 2,
                  courses: [
                    {
                      course_code: 'ACC502',
                      course_title: 'Business Law and Ethics',
                      lec_hours: 3,
                      lab_hours: 0,
                      units: 3,
                      tuition_hours: 3,
                    },
                  ],
                },
              ],
              sections: 1,
            },
          ],
        },
      ],
    },
    {
      curriculum_year: '2018',
      status: 'Active',
      programs: [
        {
          name: 'BSIT - Bachelor of Science In Information Technology',
          number_of_years: 4,
          year_levels: [
            {
              year: 1,
              semesters: [
                {
                  semester: 1,
                  courses: []
                },
                {
                  semester: 2,
                  courses: []
                }
              ],
              sections: 1,
            },
            {
              year: 2,
              semesters: [
                {
                  semester: 1,
                  courses: []
                },
                {
                  semester: 2,
                  courses: []
                }
              ],
              sections: 1,
            },
            {
              year: 3,
              semesters: [
                {
                  semester: 1,
                  courses: []
                },
                {
                  semester: 2,
                  courses: []
                }
              ],
              sections: 1,
            },
            {
              year: 4,
              semesters: [
                {
                  semester: 1,
                  courses: []
                },
                {
                  semester: 2,
                  courses: []
                }
              ],
              sections: 1,
            }
          ]
        },
        {
          name: 'BSA - Bachelor of Science In Accountancy',
          number_of_years: 4,
          year_levels: []
        },
        {
          name: 'BSME - Bachelor of Science in Mechanical Engineering',
          number_of_years: 4,
          year_levels: []
        },
      ]
    },
  ]);

  private predefinedPrograms: Omit<Program, 'year_levels'>[] = [
    {
      name: 'BSIT - Bachelor of Science In Information Technology',
      number_of_years: 4,
    },
    {
      name: 'BSA - Bachelor of Science In Accountancy',
      number_of_years: 5,
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
    const programs = this.predefinedPrograms.map(program => ({
      ...program,
      year_levels: this.generateYearLevels(program.number_of_years)
    }));
    return of(programs);
  }

  private generateYearLevels(years: number): YearLevel[] {
    return Array.from({ length: years }, (_, i) => ({
      year: i + 1,
      semesters: [
        { semester: 1, courses: [] },
        { semester: 2, courses: [] },
        { semester: 3, courses: [] },
      ],
      sections: 1,
    }));
  }

  getAvailableCurriculumYears(): Observable<string[]> {
    const curriculaYears = this.curriculaSubject
      .getValue()
      .map((curriculum) => curriculum.curriculum_year);
    return of(curriculaYears);
  }

  updateSections(curriculumYear: string, programName: string, yearLevel: number, sections: number): Observable<Curriculum> {
    const curricula = this.curriculaSubject.getValue();
    const curriculumIndex = curricula.findIndex(c => c.curriculum_year === curriculumYear);
    
    if (curriculumIndex !== -1) {
      const programIndex = curricula[curriculumIndex].programs.findIndex(p => p.name === programName);
      
      if (programIndex !== -1) {
        const yearLevelIndex = curricula[curriculumIndex].programs[programIndex].year_levels.findIndex(y => y.year === yearLevel);
        
        if (yearLevelIndex !== -1) {
          curricula[curriculumIndex].programs[programIndex].year_levels[yearLevelIndex].sections = sections;
          this.curriculaSubject.next([...curricula]);
          return of(curricula[curriculumIndex]);
        }
      }
    }
    
    return throwError(() => new Error('Curriculum, program, or year level not found'));
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
