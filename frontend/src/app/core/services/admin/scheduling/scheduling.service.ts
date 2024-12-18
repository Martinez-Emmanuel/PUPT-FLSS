import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

import { Observable, throwError, forkJoin } from 'rxjs';
import { catchError, map, shareReplay, tap } from 'rxjs/operators';

import { ScheduleValidationService } from './schedule-validation.service';
import { Schedule, PopulateSchedulesResponse, Room, Faculty, SubmittedPrefResponse } from '../../../models/scheduling.model';

import { environment } from '../../../../../environments/environment.dev';

export enum CacheType {
  Rooms = 'rooms',
  Faculty = 'faculty',
  Schedules = 'schedules',
  Preferences = 'preferences',
}

@Injectable({
  providedIn: 'root',
})
export class SchedulingService {
  private baseUrl = environment.apiUrl;

  private roomsCache$?: Observable<{ rooms: Room[] }>;
  private facultyCache$?: Observable<{ faculty: Faculty[] }>;
  private schedulesCache$?: Observable<PopulateSchedulesResponse>;
  private submittedPreferences$?: Observable<SubmittedPrefResponse>;

  constructor(
    private http: HttpClient,
    private scheduleValidationService: ScheduleValidationService
  ) {}

  /**
   * Retrieves the sections for a given program and year.
   */
  getSections(program: string, year: number): Observable<string[]> {
    return this.http
      .get<string[]>(
        `${this.baseUrl}/programs/${program}/year/${year}/sections`
      )
      .pipe(catchError(this.handleError));
  }

  /**
   * Retrieves the active year levels and their associated curricula.
   */
  getActiveYearLevelsCurricula(): Observable<any[]> {
    return this.http
      .get<any[]>(`${this.baseUrl}/active-year-levels-curricula`)
      .pipe(catchError(this.handleError));
  }

  /**
   * Retrieves and caches all schedules. 
   * Subsequent calls return the cached data unless reset.
   */
  populateSchedules(): Observable<PopulateSchedulesResponse> {
    if (!this.schedulesCache$) {
      this.schedulesCache$ = this.http
        .get<PopulateSchedulesResponse>(`${this.baseUrl}/populate-schedules`)
        .pipe(shareReplay(1), catchError(this.handleError));
    }
    return this.schedulesCache$;
  }

  /**
   * Retrieves and caches all available rooms. 
   * Subsequent calls return the cached data unless reset.
   */
  getAllRooms(): Observable<{ rooms: Room[] }> {
    if (!this.roomsCache$) {
      this.roomsCache$ = this.http
        .get<{ rooms: Room[] }>(`${this.baseUrl}/get-available-rooms`)
        .pipe(shareReplay(1), catchError(this.handleError));
    }
    return this.roomsCache$;
  }

  /**
   * Retrieves and caches details of all active faculty members.
   * Subsequent calls return the cached data unless reset.
   */
  getFacultyDetails(): Observable<{ faculty: Faculty[] }> {
    if (!this.facultyCache$) {
      this.facultyCache$ = this.http
        .get<{ faculty: Faculty[] }>(`${this.baseUrl}/get-active-faculty`)
        .pipe(shareReplay(1), catchError(this.handleError));
    }
    return this.facultyCache$;
  }

  /**
   * Retrieves and caches submitted preferences for the active semester.
   * Subsequent calls return the cached data unless forced to refresh.
   * @param forceRefresh A boolean indicating whether to 
   * force a refresh of the cached data. Defaults to false.
   */
  getSubmittedPreferencesForActiveSemester(
    forceRefresh: boolean = false
  ): Observable<SubmittedPrefResponse> {
    if (forceRefresh || !this.submittedPreferences$) {
      this.submittedPreferences$ = this.http
        .get<SubmittedPrefResponse>(`${this.baseUrl}/get-all-preferences`)
        .pipe(
          shareReplay(1),
          catchError((error) => {
            this.submittedPreferences$ = undefined;
            return this.handleError(error);
          })
        );
    }
    return this.submittedPreferences$;
  }

  /**
   * Assigns a schedule to a faculty, room, day, and time.
   */
  assignSchedule(
    schedule_id: number,
    faculty_id: number | null,
    room_id: number | null,
    day: string | null,
    start_time: string | null,
    end_time: string | null,
    program_id: number,
    year_level: number,
    section_id: number
  ): Observable<any> {
    const payload = {
      schedule_id,
      faculty_id,
      room_id,
      day,
      start_time,
      end_time,
    };
    return this.http.post<any>(`${this.baseUrl}/assign-schedule`, payload).pipe(
      tap(() => this.resetCaches([CacheType.Schedules])),
      catchError(this.handleError)
    );
  }

  /**
   * Duplicates a course.
   */
  duplicateCourse(element: Schedule): Observable<{ course: Schedule }> {
    return this.http
      .post<{ course: Schedule }>(`${this.baseUrl}/duplicate-course`, {
        section_course_id: element.section_course_id,
      })
      .pipe(
        tap(() => this.resetCaches([CacheType.Schedules])),
        catchError(this.handleError)
      );
  }

  /**
   * Removes a duplicated course.
   */
  removeDuplicateCourse(section_course_id: number): Observable<any> {
    return this.http
      .delete(`${this.baseUrl}/remove-duplicate-course`, {
        body: { section_course_id },
      })
      .pipe(catchError(this.handleError));
  }

  /**
   * Checks for schedule conflicts based on provided parameters.
   */
  checkForScheduleConflicts(
    schedule_id: number,
    program_id: number,
    year_level: number,
    day: string,
    start_time: string,
    end_time: string,
    section_id: number,
    faculty_id: number | null,
    room_id: number | null
  ): Observable<{ hasConflicts: boolean; messages: string[] }> {
    return forkJoin([this.populateSchedules(), this.getAllRooms()]).pipe(
      map(([schedules, rooms]) => {
        return this.scheduleValidationService.validateScheduleConflicts(
          schedules,
          rooms,
          {
            schedule_id,
            program_id,
            year_level,
            day,
            start_time,
            end_time,
            section_id,
            faculty_id,
            room_id,
          }
        );
      }),
      catchError(() => {
        return throwError(
          () => new Error('An error occurred during conflict detection.')
        );
      })
    );
  }

  /**
   * Handles HTTP errors; returns an observable that emits an error notif.
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    const errorMessage =
      error.error?.message || error.message || 'An unknown error occurred!';
    return throwError(() => new Error(errorMessage));
  }

  /**
   * Resets specified caches to force data refresh on the next request.
   */
  public resetCaches(cacheTypes: CacheType[] = []): void {
    cacheTypes.forEach((type) => {
      switch (type) {
        case CacheType.Rooms:
          this.roomsCache$ = undefined;
          break;
        case CacheType.Faculty:
          this.facultyCache$ = undefined;
          break;
        case CacheType.Schedules:
          this.schedulesCache$ = undefined;
          break;
        case CacheType.Preferences:
          this.submittedPreferences$ = undefined;
          break;
        default:
          console.warn(`Unknown CacheType: ${type}`);
      }
    });
  }
}
