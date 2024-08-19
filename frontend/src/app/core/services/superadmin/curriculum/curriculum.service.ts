import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';

export interface Curriculum {
  curriculum_year: string;
  status: string;
}

@Injectable({
  providedIn: 'root',
})
export class CurriculumService {
  private curriculaSubject = new BehaviorSubject<Curriculum[]>([
    {
      curriculum_year: '2223',
      status: 'Active',
    },
    {
      curriculum_year: '1819',
      status: 'Active',
    },
    {
      curriculum_year: '1617',
      status: 'Inactive',
    },
    {
      curriculum_year: '1213',
      status: 'Inactive',
    },
  ]);

  getCurricula(): Observable<Curriculum[]> {
    return this.curriculaSubject.asObservable().pipe();
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

  deleteCurriculum(index: number): Observable<Curriculum[]> {
    const curricula = this.curriculaSubject.getValue();
    curricula.splice(index, 1);
    this.curriculaSubject.next([...curricula]);
    return of(this.curriculaSubject.getValue());
  }
}
