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
}

@Injectable({
  providedIn: 'root'
})
export class SchedulingService {
  private mockData = {
    programs: [
      { id: 1, name: 'BSIT', number_of_years: 4 },
      { id: 2, name: 'BSA', number_of_years: 5 }
    ],
    curriculums: [
      { id: 1, name: '2018' },
      { id: 2, name: '2022' }
    ],
    schedules: [
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
        room: '101'
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
        room: 'DOST Lab'
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
        room: '201'
      },
    ],
    professors: ['Gecilie Almiranez', 'AJ San Luis', 'Jennifer Ortega', 'Steven Villarosa'],
    rooms: ['101', '102', '103', '201', '202', '203', 'DOST Lab']
  };

  getPrograms(): Observable<Program[]> {
    return this.simulateHttpRequest(this.mockData.programs);
  }

  getCurriculums(): Observable<Curriculum[]> {
    return this.simulateHttpRequest(this.mockData.curriculums);
  }

  getSchedules(program: string, year: number, curriculum: string): Observable<Schedule[]> {
    return this.simulateHttpRequest(this.mockData.schedules);
  }

  getProfessors(): Observable<string[]> {
    return this.simulateHttpRequest(this.mockData.professors);
  }

  getRooms(): Observable<string[]> {
    return this.simulateHttpRequest(this.mockData.rooms);
  }

  addSchedule(schedule: Partial<Schedule>): Observable<Schedule> {
    const newSchedule = { ...schedule, id: this.getNextId(this.mockData.schedules) } as Schedule;
    this.mockData.schedules.push(newSchedule);
    return this.simulateHttpRequest(newSchedule);
  }

  updateSchedule(updatedSchedule: Schedule): Observable<Schedule> {
    const index = this.mockData.schedules.findIndex(s => s.id === updatedSchedule.id);
    if (index !== -1) {
      this.mockData.schedules[index] = updatedSchedule;
    }
    return this.simulateHttpRequest(updatedSchedule);
  }

  deleteSchedule(scheduleId: number): Observable<boolean> {
    const index = this.mockData.schedules.findIndex(s => s.id === scheduleId);
    if (index !== -1) {
      this.mockData.schedules.splice(index, 1);
      return this.simulateHttpRequest(true);
    }
    return this.simulateHttpRequest(false);
  }

  private getNextId(items: { id: number }[]): number {
    return Math.max(...items.map(item => item.id), 0) + 1;
  }

  private simulateHttpRequest<T>(data: T): Observable<T> {
    return of(data).pipe(delay(300));
  }
}