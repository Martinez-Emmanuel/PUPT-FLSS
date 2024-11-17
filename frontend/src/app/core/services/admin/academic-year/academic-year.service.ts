import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { AcademicYear, YearLevel } from '../../../models/scheduling.model';

import { environment } from '../../../../../environments/environment.dev';

@Injectable({
  providedIn: 'root',
})
export class AcademicYearService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  /**
   * Fetches all academic years from the backend.
   */
  getAcademicYears(): Observable<AcademicYear[]> {
    return this.http
      .get<AcademicYear[]>(`${this.baseUrl}/get-academic-years`)
      .pipe(catchError(this.handleError));
  }

  /**
   * Add a new academic year with improved error handling
   */
  addAcademicYear(yearStart: string, yearEnd: string): Observable<any> {
    return this.http
      .post<any>(`${this.baseUrl}/add-academic-year`, {
        year_start: yearStart,
        year_end: yearEnd,
      })
      .pipe(
        catchError((error: HttpErrorResponse) => {
          let errorMessage = 'An unexpected error occurred.';

          if (error.error && error.error.message) {
            errorMessage = error.error.message;
          }

          // Handle 422 Unprocessable Entity responses specifically
          if (error.status === 422) {
            errorMessage = error.error.message;
          }

          return throwError(() => new Error(errorMessage));
        })
      );
  }

  /**
   * Delete an existing academic year.
   */
  deleteAcademicYear(academicYearId: number): Observable<any> {
    return this.http
      .request('DELETE', `${this.baseUrl}/delete-academic-year`, {
        body: { academic_year_id: academicYearId },
      })
      .pipe(catchError(this.handleError));
  }

  /**
   * Get active academic year and semester details.
   */
  getActiveYearAndSemester(): Observable<{
    activeYear: string;
    activeSemester: number;
    startDate: string;
    endDate: string;
  }> {
    return this.http
      .get<{
        activeYear: string;
        activeSemester: number;
        startDate: string;
        endDate: string;
      }>(`${this.baseUrl}/get-active-year-semester`)
      .pipe(catchError(this.handleError));
  }

  /**
   * Set the active academic year and semester.
   */
  setActiveYearAndSemester(
    academicYearId: number,
    semesterId: number,
    startDate: string,
    endDate: string
  ): Observable<void> {
    return this.http
      .post<void>(`${this.baseUrl}/set-active-year-semester`, {
        academic_year_id: academicYearId,
        semester_id: semesterId,
        start_date: startDate,
        end_date: endDate,
      })
      .pipe(catchError(this.handleError));
  }

  /**
   * Fetches program details, including year levels and curriculum versions, for a specific academic year.
   */
  fetchProgramDetailsByAcademicYear(payload: {
    academic_year_id: number;
  }): Observable<any> {
    return this.http
      .post<any>(`${this.baseUrl}/fetch-ay-prog-details`, payload)
      .pipe(catchError(this.handleError));
  }

  /**
   * Updates the curriculum versions for year levels within a specific academic year and program.
   */
  updateYearLevelsCurricula(
    academicYearId: number,
    programId: number,
    yearLevels: YearLevel[]
  ): Observable<any> {
    const payload = {
      academic_year_id: academicYearId,
      program_id: programId,
      year_levels: yearLevels.map((yl) => ({
        year_level: yl.year_level,
        curriculum_id: yl.curriculum_id,
      })),
    };
    return this.http
      .post<any>(`${this.baseUrl}/update-yr-lvl-curricula`, payload)
      .pipe(catchError(this.handleError));
  }

  /**
   * Updates the number of sections for a specific year level
   * within a program and academic year.
   */
  updateSections(
    academicYearId: number,
    programId: number,
    yearLevel: number,
    numberOfSections: number
  ): Observable<any> {
    return this.http
      .post<any>(`${this.baseUrl}/update-sections`, {
        academic_year_id: academicYearId,
        program_id: programId,
        year_level: yearLevel,
        number_of_sections: numberOfSections,
      })
      .pipe(catchError(this.handleError));
  }

  /**
   * Removes a specific program from an academic year.
   */
  removeProgramFromAcademicYear(
    academicYearId: number,
    programId: number
  ): Observable<any> {
    return this.http
      .request('DELETE', `${this.baseUrl}/remove-program`, {
        body: { academic_year_id: academicYearId, program_id: programId },
      })
      .pipe(catchError(this.handleError));
  }

  /**
   * Handle HTTP errors.
   * @param error - The HTTP error response.
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Something went wrong; please try again later.';

    if (error.error?.message) {
      errorMessage = error.error.message;
    } else if (error.message) {
      errorMessage = error.message;
    }
    return throwError(() => new Error(errorMessage));
  }
}
