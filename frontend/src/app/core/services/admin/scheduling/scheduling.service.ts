import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

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
  [key: string]: string | number;
}

@Injectable({
  providedIn: 'root'
})
export class SchedulingService {
  private programs: Program[] = [
    { id: 1, name: 'BSIT', number_of_years: 4 },
    { id: 2, name: 'BSA', number_of_years: 5 }
  ];

  private curriculums: Curriculum[] = [
    { id: 1, name: '2018' },
    { id: 2, name: '2022' }
  ];

  private schedules: Schedule[] = [
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
      room: 'Room 101'
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
      room: 'Room 201'
    },
    
  ];

  private schedulesSubject = new BehaviorSubject<Schedule[]>(this.schedules);

  getPrograms(): Observable<Program[]> {
    return of(this.programs);
  }

  getCurriculums(): Observable<Curriculum[]> {
    return of(this.curriculums);
  }

  getSchedules(program: string, year: number, curriculum: string): Observable<Schedule[]> {
    return this.schedulesSubject.asObservable().pipe(
      map(schedules => schedules.filter(s => 
        // Add actual filtering logic here when you have real data
        true
      ))
    );
  }

  addSchedule(schedule: Partial<Schedule>): Observable<Schedule[]> {
    const currentSchedules = this.schedulesSubject.getValue();
    const newSchedule = { ...schedule, id: this.getNextId(currentSchedules) } as Schedule;
    this.schedulesSubject.next([...currentSchedules, newSchedule]);
    return this.schedulesSubject.asObservable();
  }

  updateSchedule(updatedSchedule: Schedule): Observable<Schedule[]> {
    const currentSchedules = this.schedulesSubject.getValue();
    const updatedSchedules = currentSchedules.map(s => 
      s.id === updatedSchedule.id ? updatedSchedule : s
    );
    this.schedulesSubject.next(updatedSchedules);
    return this.schedulesSubject.asObservable();
  }

  deleteSchedule(scheduleId: number): Observable<Schedule[]> {
    const currentSchedules = this.schedulesSubject.getValue();
    const updatedSchedules = currentSchedules.filter(s => s.id !== scheduleId);
    this.schedulesSubject.next(updatedSchedules);
    return this.schedulesSubject.asObservable();
  }

  private getNextId(schedules: Schedule[]): number {
    return Math.max(...schedules.map(s => s.id), 0) + 1;
  }
}