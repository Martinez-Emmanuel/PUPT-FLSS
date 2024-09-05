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
export type AcademicYear = `${number}-${number}`;

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
          // BSIT Year 1 - Curriculum 2018 and 2022
          {
            id: 1,
            course_code: 'IT101',
            course_title: 'Introduction to Computing',
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
            course_code: 'COMP101',
            course_title: 'Introduction to Computing',
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
            id: 3,
            course_code: 'IT102',
            course_title: 'Computer Programming',
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
          {
            id: 4,
            course_code: 'COMP102',
            course_title: 'Computer Programming',
            lec_hours: 3,
            lab_hours: 1,
            units: 3,
            tuition_hours: 4,
            day: 'Thursday',
            time: '2:00 PM - 5:00 PM',
            professor: 'AJ San Luis',
            room: '204',
            program: 'BSIT',
            year: 1,
            curriculum: '2022',
            section: '2',
          },
          // BSIT Year 2 - Curriculum 2018 and 2022
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
          {
            id: 6,
            course_code: 'COMP201',
            course_title: 'Data Structures and Algorithms',
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
          // BSIT Year 3 - Curriculum 2018 and 2022
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
          {
            id: 8,
            course_code: 'COMP301',
            course_title: 'Operating Systems',
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
          // BSIT Year 4 - Curriculum 2018 and 2022
          {
            id: 9,
            course_code: 'IT401',
            course_title: 'Capstone Project I',
            lec_hours: 3,
            lab_hours: 1,
            units: 4,
            tuition_hours: 4,
            day: 'Friday',
            time: '8:00 AM - 12:00 PM',
            professor: 'Jennifer Ortega',
            room: '301',
            program: 'BSIT',
            year: 4,
            curriculum: '2018',
            section: '1',
          },
          {
            id: 10,
            course_code: 'COMP401',
            course_title: 'Capstone Project I',
            lec_hours: 3,
            lab_hours: 2,
            units: 4,
            tuition_hours: 5,
            day: 'Monday',
            time: '1:00 PM - 4:00 PM',
            professor: 'Steven Villarosa',
            room: '302',
            program: 'BSIT',
            year: 4,
            curriculum: '2022',
            section: '1',
          },
          // BSA Year 1 - Curriculum 2018 and 2022
          {
            id: 11,
            course_code: 'AC101',
            course_title: 'Fundamentals of Accounting',
            lec_hours: 3,
            lab_hours: 0,
            units: 3,
            tuition_hours: 3,
            day: 'Tuesday',
            time: '10:00 AM - 12:00 PM',
            professor: 'Nikki Dela Rosa',
            room: '103',
            program: 'BSA',
            year: 1,
            curriculum: '2018',
            section: '1',
          },
          {
            id: 12,
            course_code: 'MGMT101',
            course_title: 'Fundamentals of Accounting',
            lec_hours: 3,
            lab_hours: 1,
            units: 4,
            tuition_hours: 4,
            day: 'Thursday',
            time: '2:00 PM - 5:00 PM',
            professor: 'Erica Caturay',
            room: '104',
            program: 'BSA',
            year: 1,
            curriculum: '2022',
            section: '2',
          },
          // BSA Year 2 - Curriculum 2018 and 2022
          {
            id: 13,
            course_code: 'AC201',
            course_title: 'Financial Accounting',
            lec_hours: 3,
            lab_hours: 0,
            units: 3,
            tuition_hours: 3,
            day: 'Wednesday',
            time: '8:00 AM - 10:00 AM',
            professor: 'Gecilie Almiranez',
            room: '105',
            program: 'BSA',
            year: 2,
            curriculum: '2018',
            section: '1',
          },
          {
            id: 14,
            course_code: 'MGMT201',
            course_title: 'Financial Accounting',
            lec_hours: 3,
            lab_hours: 1,
            units: 3,
            tuition_hours: 4,
            day: 'Friday',
            time: '10:00 AM - 12:00 PM',
            professor: 'AJ San Luis',
            room: '106',
            program: 'BSA',
            year: 2,
            curriculum: '2022',
            section: '1',
          },
          // BSA Year 3 - Curriculum 2018 and 2022
          {
            id: 15,
            course_code: 'AC301',
            course_title: 'Auditing Theory',
            lec_hours: 3,
            lab_hours: 0,
            units: 3,
            tuition_hours: 3,
            day: 'Monday',
            time: '1:00 PM - 3:00 PM',
            professor: 'John Dustin Santos',
            room: '203',
            program: 'BSA',
            year: 3,
            curriculum: '2018',
            section: '1',
          },
          {
            id: 16,
            course_code: 'MGMT301',
            course_title: 'Auditing Theory',
            lec_hours: 3,
            lab_hours: 1,
            units: 4,
            tuition_hours: 4,
            day: 'Thursday',
            time: '3:00 PM - 5:00 PM',
            professor: 'Steven Villarosa',
            room: '204',
            program: 'BSA',
            year: 3,
            curriculum: '2022',
            section: '1',
          },
          // BSA Year 4 - Curriculum 2018 and 2022
          {
            id: 17,
            course_code: 'AC401',
            course_title: 'Advanced Financial Accounting and Reporting',
            lec_hours: 3,
            lab_hours: 1,
            units: 4,
            tuition_hours: 4,
            day: 'Tuesday',
            time: '8:00 AM - 11:00 AM',
            professor: 'Jennifer Ortega',
            room: '301',
            program: 'BSA',
            year: 4,
            curriculum: '2018',
            section: '1',
          },
          {
            id: 18,
            course_code: 'MGMT401',
            course_title: 'Advanced Financial Accounting and Reporting',
            lec_hours: 3,
            lab_hours: 0,
            units: 3,
            tuition_hours: 3,
            day: 'Wednesday',
            time: '1:00 PM - 4:00 PM',
            professor: 'Erica Caturay',
            room: '302',
            program: 'BSA',
            year: 4,
            curriculum: '2022',
            section: '1',
          },
          // BSA Year 5 - Curriculum 2018 and 2022
          {
            id: 19,
            course_code: 'AC501',
            course_title: 'Advanced Auditing and Assurance Services',
            lec_hours: 3,
            lab_hours: 0,
            units: 3,
            tuition_hours: 3,
            day: 'Monday',
            time: '10:00 AM - 12:00 PM',
            professor: 'John Dustin Santos',
            room: '401',
            program: 'BSA',
            year: 5,
            curriculum: '2018',
            section: '1',
          },
          {
            id: 20,
            course_code: 'MGMT501',
            course_title: 'Advanced Auditing and Assurance Services',
            lec_hours: 3,
            lab_hours: 0,
            units: 3,
            tuition_hours: 3,
            day: 'Tuesday',
            time: '1:00 PM - 3:00 PM',
            professor: 'Nikki Dela Rosa',
            room: '403',
            program: 'BSA',
            year: 5,
            curriculum: '2022',
            section: '1',
          },
        ],
      },
      '2024-2025': {
        '1st Semester': [
          // BSIT Year 1 - Curriculum 2018 and 2022
          {
            id: 21,
            course_code: 'IT103',
            course_title: 'Web Development Fundamentals',
            lec_hours: 2,
            lab_hours: 3,
            units: 4,
            tuition_hours: 5,
            day: 'Monday',
            time: '1:00 PM - 4:00 PM',
            professor: 'Jennifer Ortega',
            room: '201',
            program: 'BSIT',
            year: 1,
            curriculum: '2018',
            section: '1',
          },
          {
            id: 22,
            course_code: 'COMP103',
            course_title: 'Web Development Fundamentals',
            lec_hours: 2,
            lab_hours: 3,
            units: 4,
            tuition_hours: 5,
            day: 'Wednesday',
            time: '10:00 AM - 1:00 PM',
            professor: 'Nikki Dela Rosa',
            room: '203',
            program: 'BSIT',
            year: 1,
            curriculum: '2022',
            section: '1',
          },
          {
            id: 23,
            course_code: 'IT104',
            course_title: 'Computer Hardware Fundamentals',
            lec_hours: 3,
            lab_hours: 2,
            units: 4,
            tuition_hours: 5,
            day: 'Tuesday',
            time: '8:00 AM - 11:00 AM',
            professor: 'Steven Villarosa',
            room: '202',
            program: 'BSIT',
            year: 1,
            curriculum: '2018',
            section: '2',
          },
          {
            id: 24,
            course_code: 'COMP104',
            course_title: 'Computer Hardware Fundamentals',
            lec_hours: 3,
            lab_hours: 2,
            units: 4,
            tuition_hours: 5,
            day: 'Thursday',
            time: '2:00 PM - 5:00 PM',
            professor: 'AJ San Luis',
            room: '204',
            program: 'BSIT',
            year: 1,
            curriculum: '2022',
            section: '2',
          },
          // BSIT Year 2 - Curriculum 2018 and 2022
          {
            id: 25,
            course_code: 'IT202',
            course_title: 'Object-Oriented Programming',
            lec_hours: 3,
            lab_hours: 1,
            units: 3,
            tuition_hours: 4,
            day: 'Monday',
            time: '10:00 AM - 12:00 PM',
            professor: 'Erica Caturay',
            room: '101',
            program: 'BSIT',
            year: 2,
            curriculum: '2018',
            section: '1',
          },
          {
            id: 26,
            course_code: 'COMP202',
            course_title: 'Object-Oriented Programming',
            lec_hours: 3,
            lab_hours: 1,
            units: 3,
            tuition_hours: 4,
            day: 'Wednesday',
            time: '1:00 PM - 3:00 PM',
            professor: 'John Dustin Santos',
            room: '102',
            program: 'BSIT',
            year: 2,
            curriculum: '2022',
            section: '1',
          },
          // BSIT Year 3 - Curriculum 2018 and 2022
          {
            id: 27,
            course_code: 'IT302',
            course_title: 'Database Management Systems',
            lec_hours: 3,
            lab_hours: 2,
            units: 4,
            tuition_hours: 5,
            day: 'Tuesday',
            time: '8:00 AM - 11:00 AM',
            professor: 'Gecilie Almiranez',
            room: '201',
            program: 'BSIT',
            year: 3,
            curriculum: '2018',
            section: '1',
          },
          {
            id: 28,
            course_code: 'COMP302',
            course_title: 'Database Management Systems',
            lec_hours: 3,
            lab_hours: 2,
            units: 4,
            tuition_hours: 5,
            day: 'Thursday',
            time: '10:00 AM - 1:00 PM',
            professor: 'Jennifer Ortega',
            room: '202',
            program: 'BSIT',
            year: 3,
            curriculum: '2022',
            section: '1',
          },
          // BSIT Year 4 - Curriculum 2018 and 2022
          {
            id: 29,
            course_code: 'IT402',
            course_title: 'Software Engineering',
            lec_hours: 3,
            lab_hours: 1,
            units: 4,
            tuition_hours: 4,
            day: 'Friday',
            time: '8:00 AM - 12:00 PM',
            professor: 'Jennifer Ortega',
            room: '301',
            program: 'BSIT',
            year: 4,
            curriculum: '2018',
            section: '1',
          },
          {
            id: 30,
            course_code: 'COMP402',
            course_title: 'Software Engineering',
            lec_hours: 3,
            lab_hours: 2,
            units: 4,
            tuition_hours: 5,
            day: 'Monday',
            time: '1:00 PM - 4:00 PM',
            professor: 'Steven Villarosa',
            room: '302',
            program: 'BSIT',
            year: 4,
            curriculum: '2022',
            section: '1',
          },
          // BSA Year 1 - Curriculum 2018 and 2022
          {
            id: 31,
            course_code: 'AC102',
            course_title: 'Business Law and Ethics',
            lec_hours: 3,
            lab_hours: 0,
            units: 3,
            tuition_hours: 3,
            day: 'Tuesday',
            time: '1:00 PM - 3:00 PM',
            professor: 'Nikki Dela Rosa',
            room: '103',
            program: 'BSA',
            year: 1,
            curriculum: '2018',
            section: '1',
          },
          {
            id: 32,
            course_code: 'MGMT102',
            course_title: 'Business Law and Ethics',
            lec_hours: 3,
            lab_hours: 1,
            units: 4,
            tuition_hours: 4,
            day: 'Thursday',
            time: '3:00 PM - 5:00 PM',
            professor: 'Erica Caturay',
            room: '104',
            program: 'BSA',
            year: 1,
            curriculum: '2022',
            section: '2',
          },
          // BSA Year 2 - Curriculum 2018 and 2022
          {
            id: 33,
            course_code: 'AC202',
            course_title: 'Cost Accounting',
            lec_hours: 3,
            lab_hours: 0,
            units: 3,
            tuition_hours: 3,
            day: 'Wednesday',
            time: '8:00 AM - 10:00 AM',
            professor: 'Gecilie Almiranez',
            room: '105',
            program: 'BSA',
            year: 2,
            curriculum: '2018',
            section: '1',
          },
          {
            id: 34,
            course_code: 'MGMT202',
            course_title: 'Cost Accounting',
            lec_hours: 3,
            lab_hours: 1,
            units: 4,
            tuition_hours: 4,
            day: 'Friday',
            time: '10:00 AM - 12:00 PM',
            professor: 'AJ San Luis',
            room: '106',
            program: 'BSA',
            year: 2,
            curriculum: '2022',
            section: '1',
          },
          // BSA Year 3 - Curriculum 2018 and 2022
          {
            id: 35,
            course_code: 'AC302',
            course_title: 'Taxation',
            lec_hours: 3,
            lab_hours: 0,
            units: 3,
            tuition_hours: 3,
            day: 'Monday',
            time: '1:00 PM - 3:00 PM',
            professor: 'John Dustin Santos',
            room: '203',
            program: 'BSA',
            year: 3,
            curriculum: '2018',
            section: '1',
          },
          {
            id: 36,
            course_code: 'MGMT302',
            course_title: 'Taxation',
            lec_hours: 3,
            lab_hours: 1,
            units: 4,
            tuition_hours: 4,
            day: 'Thursday',
            time: '1:00 PM - 3:00 PM',
            professor: 'Steven Villarosa',
            room: '204',
            program: 'BSA',
            year: 3,
            curriculum: '2022',
            section: '1',
          },
          // BSA Year 4 - Curriculum 2018 and 2022
          {
            id: 37,
            course_code: 'AC401',
            course_title: 'Financial Management',
            lec_hours: 3,
            lab_hours: 1,
            units: 4,
            tuition_hours: 4,
            day: 'Tuesday',
            time: '9:00 AM - 12:00 PM',
            professor: 'Jennifer Ortega',
            room: '301',
            program: 'BSA',
            year: 4,
            curriculum: '2018',
            section: '1',
          },
          {
            id: 38,
            course_code: 'MGMT401',
            course_title: 'Financial Management',
            lec_hours: 3,
            lab_hours: 0,
            units: 3,
            tuition_hours: 3,
            day: 'Wednesday',
            time: '1:00 PM - 4:00 PM',
            professor: 'Erica Caturay',
            room: '302',
            program: 'BSA',
            year: 4,
            curriculum: '2022',
            section: '1',
          },
          // BSA Year 5 - Curriculum 2018 and 2022
          {
            id: 39,
            course_code: 'AC501',
            course_title: 'Strategic Management',
            lec_hours: 3,
            lab_hours: 0,
            units: 3,
            tuition_hours: 3,
            day: 'Monday',
            time: '10:00 AM - 12:00 PM',
            professor: 'John Dustin Santos',
            room: '401',
            program: 'BSA',
            year: 5,
            curriculum: '2018',
            section: '1',
          },
          {
            id: 40,
            course_code: 'MGMT501',
            course_title: 'Strategic Management',
            lec_hours: 3,
            lab_hours: 0,
            units: 3,
            tuition_hours: 3,
            day: 'Tuesday',
            time: '1:00 PM - 3:00 PM',
            professor: 'Nikki Dela Rosa',
            room: '403',
            program: 'BSA',
            year: 5,
            curriculum: '2022',
            section: '1',
          },
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

  getActiveYearAndSemester(): Observable<{ activeYear: AcademicYear; activeSemester: Semester; }> {
    return this.simulateHttpRequest({ activeYear: this.mockData.activeYear, activeSemester: this.mockData.activeSemester });
  }

  setActiveYearAndSemester(activeYear: AcademicYear, activeSemester: Semester): Observable<void> {
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
    return this.simulateHttpRequest(this.mockData.sections[program]?.[year] || ['1']);
  }

  getSchedules(program: string, year: number, curriculum: string, selectedSection: string, activeYear: AcademicYear, activeSemester: Semester): Observable<Schedule[]> {
    const yearSchedules = this.mockData.schedules[activeYear] as SchedulesBySemester;
    const semesterSchedules = yearSchedules?.[activeSemester] || [];

    const filteredSchedules = semesterSchedules.filter(
      (s) => s.program === program && s.year === year && s.curriculum === curriculum && s.section === selectedSection
    );

    return this.simulateHttpRequest(filteredSchedules);
  }

  getProfessors(): Observable<string[]> {
    return this.simulateHttpRequest(this.mockData.professors);
  }

  getRooms(): Observable<string[]> {
    return this.simulateHttpRequest(this.mockData.rooms);
  }

  addSection(program: string, year: number, sectionName: string): Observable<boolean> {
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
        const index = semesterSchedules.findIndex((s) => s.id === updatedSchedule.id);
        if (index !== -1) {
          semesterSchedules[index] = { ...semesterSchedules[index], ...updatedSchedule };
        }
      }
    }

    return this.simulateHttpRequest(updatedSchedule).pipe(tap(() => console.log('Updated schedule:', updatedSchedule)));
  }

  private simulateHttpRequest<T>(data: T): Observable<T> {
    return of(data).pipe(delay(300));
  }
}
