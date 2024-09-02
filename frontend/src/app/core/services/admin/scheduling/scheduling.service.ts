import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

export interface Program {
  id: number;
  name: string;
  number_of_years: number;
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

@Injectable({
  providedIn: 'root',
})
export class SchedulingService {
  private mockData = {
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
    sections: <Record<string, string[]>>{
      BSIT: ['1'],
      BSA: ['1'],
    },
    schedules: [
      // Initial mock schedules
      {
        id: 1,
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
        curriculum: '2022',
        section: '1',
      },
      {
        id: 2,
        course_code: 'CS101',
        course_title: 'Programming 1',
        lec_hours: 2,
        lab_hours: 3,
        units: 3,
        tuition_hours: 5,
        day: 'Tuesday',
        time: '01:00 PM - 6:00 PM',
        professor: 'AJ San Luis',
        room: 'DOST Lab',
        program: 'BSIT',
        year: 2,
        curriculum: '2022',
        section: '1',
      },
      {
        id: 3,
        course_code: 'ACC101',
        course_title: 'Introduction to Accounting',
        lec_hours: 3,
        lab_hours: 0,
        units: 3,
        tuition_hours: 3,
        day: 'Wednesday',
        time: '09:00 AM - 12:00 PM',
        professor: 'Jennifer Ortega',
        room: '201',
        program: 'BSA',
        year: 1,
        curriculum: '2018',
        section: '1',
      },
    ],
    professors: [
      'Gecilie Almiranez',
      'AJ San Luis',
      'Jennifer Ortega',
      'Steven Villarosa',
    ],
    rooms: ['101', '102', '103', '201', '202', '203', 'DOST Lab'],
  };

  getAcademicYears(): Observable<any[]> {
    return this.simulateHttpRequest(this.mockData.academicYears);
  }

  getPrograms(): Observable<Program[]> {
    return this.simulateHttpRequest(this.mockData.programs);
  }

  getCurriculums(): Observable<Curriculum[]> {
    return this.simulateHttpRequest(this.mockData.curriculums);
  }

  getSections(program: string): Observable<string[]> {
    return this.simulateHttpRequest(this.mockData.sections[program] || ['1']);
  }

  getSchedules(
    program: string,
    year: number,
    curriculum: string,
    selectedSection: string
  ): Observable<Schedule[]> {
    const schedules = this.mockData.schedules.filter(
      (s) =>
        s.program === program &&
        s.year === year &&
        s.curriculum === curriculum &&
        s.section === selectedSection
    );
    return this.simulateHttpRequest(schedules);
  }

  getProfessors(): Observable<string[]> {
    return this.simulateHttpRequest(this.mockData.professors);
  }

  getRooms(): Observable<string[]> {
    return this.simulateHttpRequest(this.mockData.rooms);
  }

  addSection(program: string, sectionName: string): Observable<boolean> {
    if (!this.mockData.sections[program].includes(sectionName)) {
      this.mockData.sections[program].push(sectionName);
      return this.simulateHttpRequest(true);
    }
    return this.simulateHttpRequest(false);
  }

  updateSchedule(updatedSchedule: Schedule): Observable<Schedule> {
    const index = this.mockData.schedules.findIndex(
      (s) => s.id === updatedSchedule.id
    );
    if (index !== -1) {
      this.mockData.schedules[index] = {
        ...this.mockData.schedules[index],
        ...updatedSchedule,
      };
    }
    return this.simulateHttpRequest(updatedSchedule);
  }

  private getNextId(items: { id: number }[]): number {
    return Math.max(...items.map((item) => item.id), 0) + 1;
  }

  private simulateHttpRequest<T>(data: T): Observable<T> {
    return of(data).pipe(delay(300));
  }
}
