import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

export interface Subject {
  code: string;
  title: string;
  lec: number;
  lab: number;
  units: number;
}

@Injectable({
  providedIn: 'root',
})
export class MockSubjectService {
  private subjects: Subject[] = [
    {
      code: 'ACCO 20063',
      title: 'Conceptual Frameworks and Accounting Standards',
      lec: 3,
      lab: 1,
      units: 4,
    },
    {
      code: 'BUMA 20063',
      title: 'Principles of Management and Organization',
      lec: 2,
      lab: 2,
      units: 4,
    },
    {
      code: 'COMP 20163',
      title: 'Web Development',
      lec: 3,
      lab: 0,
      units: 3,
    },
    {
      code: 'ECEN 30024',
      title: 'Advanced Engineering Mathematics for ECE',
      lec: 3,
      lab: 1,
      units: 4,
    },
    {
      code: 'EDUC 30013',
      title: 'The Child and Adolescent Learner and Learning Principles',
      lec: 2,
      lab: 2,
      units: 4,
    },
    {
      code: 'COMP20138',
      title: 'Artificial Intelligence',
      lec: 3,
      lab: 1,
      units: 4,
    },
    {
      code: 'ENSC 20033',
      title: 'Engineering Management',
      lec: 3,
      lab: 1,
      units: 4,
    },
    {
      code: 'GEED 10053',
      title: 'Mathematics in the Modern World',
      lec: 2,
      lab: 2,
      units: 4,
    },
    {
      code: 'COMP20141',
      title: 'Strategic Business Analysis with Contemporary Issues and Trends',
      lec: 3,
      lab: 1,
      units: 4,
    },
    {
      code: 'HRMA 30013',
      title: 'Administrative and Office Management',
      lec: 3,
      lab: 1,
      units: 4,
    },
  ];

  getSubjects(): Observable<Subject[]> {
    // NOTE @FLS TEAM: This only simulate network delay.
    // Remove this on actual backend implementation.
    return of(this.subjects).pipe(delay(500));
  }
}
