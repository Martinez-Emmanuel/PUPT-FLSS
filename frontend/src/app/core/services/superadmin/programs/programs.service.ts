import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';

export interface Program {
  program_code: string;
  program_title: string;
  program_info: string;
  program_status: string;
  number_of_years: number;
}

@Injectable({
  providedIn: 'root',
})
export class ProgramsService {
  private programsSubject = new BehaviorSubject<Program[]>([
    {
      program_code: 'BSA-TG',
      program_title: 'Bachelor of Science in Accountancy',
      program_info:
        'This program focuses on financial accounting, management accounting, auditing, and taxation.',
      program_status: 'Active',
      number_of_years: 4,
    },
    {
      program_code: 'BSEE-TG',
      program_title: 'Bachelor of Science in Electronics Engineering',
      program_info:
        'This program focuses on the design, development, and testing of electronic devices and systems.',
      program_status: 'Active',
      number_of_years: 4,
    },
    {
      program_code: 'BSME-TG',
      program_title: 'Bachelor of Science in Mechanical Engineering',
      program_info:
        'This program focuses on the design, manufacturing, and maintenance of mechanical systems.',
      program_status: 'Active',
      number_of_years: 4,
    },
    {
      program_code: 'BSIT-TG',
      program_title: 'Bachelor of Science in Information Technology',
      program_info:
        'This program focuses on computer science and information technology.',
      program_status: 'Active',
      number_of_years: 4,
    },
    {
      program_code: 'BSBA-MM-TG',
      program_title:
        'Bachelor of Science in Business Administration Major in Marketing Management',
      program_info:
        'This program focuses on marketing principles, consumer behavior, and market research.',
      program_status: 'Active',
      number_of_years: 4,
    },
    {
      program_code: 'BSBA-HRM-TG',
      program_title:
        'Bachelor of Science in Business Administration Major in Human Resource Management',
      program_info:
        'This program focuses on employee recruitment, training, development, and performance management.',
      program_status: 'Active',
      number_of_years: 4,
    },
    {
      program_code: 'BSED-ENG-TG',
      program_title:
        'Bachelor of Science in Secondary Education Major in English',
      program_info:
        'This program focuses on teaching English language and literature to secondary level students.',
      program_status: 'Active',
      number_of_years: 4,
    },
    {
      program_code: 'BSED-MATH-TG',
      program_title: 'Bachelor of Science in Secondary Education Major in Math',
      program_info:
        'This program focuses on teaching mathematics to secondary level students.',
      program_status: 'Active',
      number_of_years: 4,
    },
    {
      program_code: 'BSOA-LT-TG',
      program_title:
        'Bachelor of Science in Office Administration Major in Legal Transcription',
      program_info:
        'This program focuses on legal transcription, document formatting, and legal terminology.',
      program_status: 'Active',
      number_of_years: 4,
    },
    {
      program_code: 'DOMT-LOM-TG',
      program_title:
        'Diploma in Office Management Technology with Specialization in Legal Office Management',
      program_info:
        'This program focuses on legal office procedures, document management, and legal support services.',
      program_status: 'Active',
      number_of_years: 4,
    },
    {
      program_code: 'DICT-TG',
      program_title: 'Diploma in Communication Information Technology',
      program_info:
        'This program focuses on computer networks, software applications, and digital communication.',
      program_status: 'Active',
      number_of_years: 4,
    },
  ]);

  getPrograms(): Observable<Program[]> {
    return this.programsSubject.asObservable().pipe();
  }

  addProgram(program: Program): Observable<Program[]> {
    const programs = this.programsSubject.getValue();
    this.programsSubject.next([...programs, program]);
    return of(this.programsSubject.getValue());
  }

  updateProgram(index: number, updatedProgram: Program): Observable<Program[]> {
    const programs = this.programsSubject.getValue();
    programs[index] = updatedProgram;
    this.programsSubject.next([...programs]);
    return of(this.programsSubject.getValue());
  }

  deleteProgram(index: number): Observable<Program[]> {
    const programs = this.programsSubject.getValue();
    programs.splice(index, 1);
    this.programsSubject.next([...programs]);
    return of(this.programsSubject.getValue());
  }
}
