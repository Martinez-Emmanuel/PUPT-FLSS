import { Injectable } from '@angular/core';
import { Observable, of, tap } from 'rxjs';
import { delay } from 'rxjs/operators';

export interface Program {
  id: number;
  name: string;
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

export type Semester = '1st Semester' | '2nd Semester' | 'Summer Semester';
export type AcademicYear = '2023-2024' | '2024-2025';

interface SchedulesBySemester {
  [semester: string]: Schedule[];
}

interface SchedulesByYear {
  [year: string]: SchedulesBySemester;
}

@Injectable({
  providedIn: 'root',
})
export class SchedulingService {
  private mockData: {
    academicYears: {
      id: number;
      year: AcademicYear;
      semesters: Semester[];
      activeCurricula: string[];
    }[];
    programs: Program[];
    curriculums: Curriculum[];
    sections: SectionsByProgram;
    schedules: SchedulesByYear;
    professors: string[];
    rooms: string[];
    activeYear: AcademicYear;
    activeSemester: Semester;
  } = {
    academicYears: [
      {
        id: 1,
        year: '2023-2024',
        semesters: ['1st Semester', '2nd Semester', 'Summer Semester'],
        activeCurricula: ['2018', '2022'],
      },
      {
        id: 2,
        year: '2024-2025',
        semesters: ['1st Semester', '2nd Semester', 'Summer Semester'],
        activeCurricula: ['2018', '2022'],
      },
    ],
    programs: [
      { id: 1, name: 'BSIT', number_of_years: 4 },
      { id: 2, name: 'BSA', number_of_years: 5 },
    ],
    curriculums: [
      { id: 1, name: '2018' },
      { id: 2, name: '2022' },
    ],
    sections: {
      BSIT: {
        1: ['1', '2'],
        2: ['1'],
        3: ['1'],
        4: ['1'],
      },
      BSA: {
        1: ['1', '2'],
        2: ['1'],
        3: ['1'],
        4: ['1'],
      },
    } as SectionsByProgram,
    schedules: {
      '2023-2024': {
        '2nd Semester': [
          // BSIT Year 1 - Curriculum 2018
          {
            id: 1,
            course_code: 'IT104',
            course_title: 'Web Development Fundamentals',
            lec_hours: 3,
            lab_hours: 2,
            units: 4,
            tuition_hours: 5,
            day: 'Monday',
            time: '10:00 AM - 12:00 PM',
            professor: 'Jennifer Ortega',
            room: '201',
            program: 'BSIT',
            year: 1,
            curriculum: '2018',
            section: '1',
          },
          {
            id: 2,
            course_code: 'IT105',
            course_title: 'Database Management Systems',
            lec_hours: 3,
            lab_hours: 1,
            units: 3,
            tuition_hours: 4,
            day: 'Wednesday',
            time: '1:00 PM - 4:00 PM',
            professor: 'Steven Villarosa',
            room: '202',
            program: 'BSIT',
            year: 1,
            curriculum: '2018',
            section: '2',
          },
          // BSIT Year 1 - Curriculum 2022
          {
            id: 3,
            course_code: 'IT106',
            course_title: 'Introduction to Programming',
            lec_hours: 3,
            lab_hours: 2,
            units: 4,
            tuition_hours: 5,
            day: 'Tuesday',
            time: '8:00 AM - 11:00 AM',
            professor: 'Nikki Dela Rosa',
            room: '203',
            program: 'BSIT',
            year: 1,
            curriculum: '2022',
            section: '1',
          },
          {
            id: 4,
            course_code: 'IT107',
            course_title: 'Computer Organization and Architecture',
            lec_hours: 3,
            lab_hours: 0,
            units: 3,
            tuition_hours: 3,
            day: 'Thursday',
            time: '2:00 PM - 5:00 PM',
            professor: 'AJ San Luis',
            room: '204',
            program: 'BSIT',
            year: 1,
            curriculum: '2022',
            section: '2',
          },
          // BSIT Year 2 - Curriculum 2018
          {
            id: 5,
            course_code: 'IT201',
            course_title: 'Data Structures and Algorithms',
            lec_hours: 3,
            lab_hours: 2,
            units: 4,
            tuition_hours: 5,
            day: 'Monday',
            time: '8:00 AM - 10:00 AM',
            professor: 'Erica Caturay',
            room: '101',
            program: 'BSIT',
            year: 2,
            curriculum: '2018',
            section: '1',
          },
          // BSIT Year 2 - Curriculum 2022
          {
            id: 6,
            course_code: 'IT202',
            course_title: 'Object-Oriented Programming',
            lec_hours: 3,
            lab_hours: 2,
            units: 4,
            tuition_hours: 5,
            day: 'Wednesday',
            time: '10:00 AM - 12:00 PM',
            professor: 'John Dustin Santos',
            room: '102',
            program: 'BSIT',
            year: 2,
            curriculum: '2022',
            section: '1',
          },
          // BSIT Year 3 - Curriculum 2018
          {
            id: 7,
            course_code: 'IT301',
            course_title: 'Operating Systems',
            lec_hours: 3,
            lab_hours: 1,
            units: 3,
            tuition_hours: 4,
            day: 'Tuesday',
            time: '1:00 PM - 4:00 PM',
            professor: 'Gecilie Almiranez',
            room: '201',
            program: 'BSIT',
            year: 3,
            curriculum: '2018',
            section: '1',
          },
          // BSIT Year 3 - Curriculum 2022
          {
            id: 8,
            course_code: 'IT302',
            course_title: 'Software Engineering',
            lec_hours: 3,
            lab_hours: 1,
            units: 3,
            tuition_hours: 4,
            day: 'Thursday',
            time: '8:00 AM - 11:00 AM',
            professor: 'Jennifer Ortega',
            room: '202',
            program: 'BSIT',
            year: 3,
            curriculum: '2022',
            section: '1',
          },
          // Repeat similar pattern for BSIT Year 4 and for BSA Year 1 to Year 4, for both curricula
          // Following similar structure for the 2024-2025 year
        ],
      },
      '2024-2025': {
        '1st Semester': [
          // BSIT Year 1 - Curriculum 2018
          {
            id: 17,
            course_code: 'IT101',
            course_title: 'Introduction to Information Technology',
            lec_hours: 3,
            lab_hours: 0,
            units: 3,
            tuition_hours: 3,
            day: 'Monday',
            time: '08:00 AM - 11:00 AM',
            professor: 'Gecilie Almiranez',
            room: '101',
            program: 'BSIT',
            year: 1,
            curriculum: '2018',
            section: '1',
          },
          {
            id: 18,
            course_code: 'IT102',
            course_title: 'Computer Programming I',
            lec_hours: 3,
            lab_hours: 2,
            units: 4,
            tuition_hours: 5,
            day: 'Wednesday',
            time: '10:00 AM - 1:00 PM',
            professor: 'AJ San Luis',
            room: '102',
            program: 'BSIT',
            year: 1,
            curriculum: '2018',
            section: '2',
          },
          // Repeat the same pattern for other years and programs for both curricula
        ],
      },
    },
    professors: [
      'Gecilie Almiranez',
      'AJ San Luis',
      'Jennifer Ortega',
      'Steven Villarosa',
      'Nikki Dela Rosa',
      'John Dustin Santos',
      'Erica Caturay',
    ],
    rooms: [
      '101',
      '102',
      '103',
      '201',
      '202',
      '203',
      '104',
      '105',
      '106',
      '204',
      '205',
      '206',
      '301',
      '302',
      '303',
      '304',
      '305',
      '306',
      '401',
      '402',
      '403',
      '404',
      '405',
      '406',
      'DOST Lab',
    ],
    activeYear: '2023-2024',
    activeSemester: '2nd Semester',
  };

  getAcademicYears(): Observable<any[]> {
    return this.simulateHttpRequest(this.mockData.academicYears);
  }

  getActiveYearAndSemester(): Observable<{
    activeYear: AcademicYear;
    activeSemester: Semester;
  }> {
    return this.simulateHttpRequest({
      activeYear: this.mockData.activeYear,
      activeSemester: this.mockData.activeSemester,
    });
  }

  setActiveYearAndSemester(
    activeYear: AcademicYear,
    activeSemester: Semester
  ): Observable<void> {
    this.mockData.activeYear = activeYear;
    this.mockData.activeSemester = activeSemester;
    return this.simulateHttpRequest(undefined);
  }

  getPrograms(): Observable<Program[]> {
    return this.simulateHttpRequest(this.mockData.programs);
  }

  getCurriculums(): Observable<Curriculum[]> {
    return this.simulateHttpRequest(this.mockData.curriculums);
  }

  getSections(program: string, year: number): Observable<string[]> {
    return this.simulateHttpRequest(
      this.mockData.sections[program]?.[year] || ['1']
    );
  }

  getSchedules(
    program: string,
    year: number,
    curriculum: string,
    selectedSection: string,
    activeYear: AcademicYear,
    activeSemester: Semester
  ): Observable<Schedule[]> {
    const yearSchedules = this.mockData.schedules[
      activeYear
    ] as SchedulesBySemester;
    const semesterSchedules = yearSchedules?.[activeSemester] || [];

    const filteredSchedules = semesterSchedules.filter(
      (s) =>
        s.program === program &&
        s.year === year &&
        s.curriculum === curriculum &&
        s.section === selectedSection
    );

    return this.simulateHttpRequest(filteredSchedules);
  }

  getProfessors(): Observable<string[]> {
    return this.simulateHttpRequest(this.mockData.professors);
  }

  getRooms(): Observable<string[]> {
    return this.simulateHttpRequest(this.mockData.rooms);
  }

  addSection(
    program: string,
    year: number,
    sectionName: string
  ): Observable<boolean> {
    if (!this.mockData.sections[program]) {
      this.mockData.sections[program] = {};
    }
    if (!this.mockData.sections[program][year]) {
      this.mockData.sections[program][year] = [];
    }
    if (!this.mockData.sections[program][year].includes(sectionName)) {
      this.mockData.sections[program][year].push(sectionName);
      return this.simulateHttpRequest(true);
    }
    return this.simulateHttpRequest(false);
  }

  updateSchedule(updatedSchedule: Schedule): Observable<Schedule> {
    const yearSchedules = this.mockData.schedules[this.mockData.activeYear];
    
    if (yearSchedules) {
      const semesterSchedules = yearSchedules[this.mockData.activeSemester];

      if (semesterSchedules) {
        const index = semesterSchedules.findIndex(
          (s) => s.id === updatedSchedule.id
        );

        if (index !== -1) {
          semesterSchedules[index] = {
            ...semesterSchedules[index],
            ...updatedSchedule,
          };
        }
      }
    }

    return this.simulateHttpRequest(updatedSchedule).pipe(
      tap(() => console.log('Updated schedule:', updatedSchedule))
    );
  }

  private getNextId(items: { id: number }[]): number {
    return Math.max(...items.map((item) => item.id), 0) + 1;
  }

  private simulateHttpRequest<T>(data: T): Observable<T> {
    return of(data).pipe(delay(300));
  }
}
