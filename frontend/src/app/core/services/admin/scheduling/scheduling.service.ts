import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

import { Observable, throwError, forkJoin, of } from 'rxjs';
import { catchError, map, switchMap, shareReplay, tap } from 'rxjs/operators';

import {
  Schedule,
  PopulateSchedulesResponse,
  CourseResponse,
  Room,
  Faculty,
  SubmittedPrefResponse,
  ConflictingCourseDetail,
  ConflictingScheduleDetail,
} from '../../../models/scheduling.model';

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

  constructor(private http: HttpClient) {}

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Something went wrong; please try again later.';

    if (error.error?.message) {
      errorMessage = error.error.message;
    } else if (error.message) {
      errorMessage = error.message;
    }
    return throwError(() => new Error(errorMessage));
  }

  // Fetch sections by program and year level
  getSections(program: string, year: number): Observable<string[]> {
    return this.http
      .get<string[]>(
        `${this.baseUrl}/programs/${program}/year/${year}/sections`
      )
      .pipe(catchError(this.handleError));
  }

  // Get active year levels curricula
  getActiveYearLevelsCurricula(): Observable<any[]> {
    return this.http
      .get<any[]>(`${this.baseUrl}/active-year-levels-curricula`)
      .pipe(catchError(this.handleError));
  }

  // =============================
  // Scheduling-related methods
  // =============================

  // Populate schedules
  populateSchedules(): Observable<PopulateSchedulesResponse> {
    if (!this.schedulesCache$) {
      this.schedulesCache$ = this.http
        .get<PopulateSchedulesResponse>(`${this.baseUrl}/populate-schedules`)
        .pipe(shareReplay(1), catchError(this.handleError));
    }
    return this.schedulesCache$;
  }

  // Get all available rooms
  getAllRooms(): Observable<{ rooms: Room[] }> {
    if (!this.roomsCache$) {
      this.roomsCache$ = this.http
        .get<{ rooms: Room[] }>(`${this.baseUrl}/get-available-rooms`)
        .pipe(shareReplay(1), catchError(this.handleError));
    }
    return this.roomsCache$;
  }

  // Get faculty details
  getFacultyDetails(): Observable<{ faculty: Faculty[] }> {
    if (!this.facultyCache$) {
      this.facultyCache$ = this.http
        .get<{ faculty: Faculty[] }>(`${this.baseUrl}/get-active-faculty`)
        .pipe(shareReplay(1), catchError(this.handleError));
    }
    return this.facultyCache$;
  }

  // Get submitted preferences by faculty
  getSubmittedPreferencesForActiveSemester(
    forceRefresh: boolean = false
  ): Observable<SubmittedPrefResponse> {
    if (forceRefresh || !this.submittedPreferences$) {
      this.submittedPreferences$ = this.http
        .get<SubmittedPrefResponse>(`${this.baseUrl}/get-preferences`)
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

  // Assign schedule to faculty, room, and time
  public assignSchedule(
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
    return this.validateSchedule(
      schedule_id,
      faculty_id,
      room_id,
      day,
      start_time,
      end_time,
      program_id,
      year_level,
      section_id
    ).pipe(
      switchMap((validationResult) => {
        if (validationResult.isValid) {
          const payload = {
            schedule_id,
            faculty_id,
            room_id,
            day,
            start_time,
            end_time,
          };
          return this.http
            .post<any>(`${this.baseUrl}/assign-schedule`, payload)
            .pipe(
              tap(() => {
                this.resetCaches([CacheType.Schedules]);
              })
            );
        } else {
          return throwError(() => new Error(validationResult.message));
        }
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Duplicate a course by calling the backend API.
   * @param element The schedule element to duplicate.
   */
  duplicateCourse(element: Schedule): Observable<{ course: Schedule }> {
    return this.http
      .post<{ course: Schedule }>(`${this.baseUrl}/duplicate-course`, {
        section_course_id: element.section_course_id,
      })
      .pipe(
        tap(() => {
          this.resetCaches([CacheType.Schedules]);
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Remove a duplicated course copy by calling the backend API.
   * @param section_course_id The ID of the section_course to remove.
   */
  removeDuplicateCourse(section_course_id: number): Observable<any> {
    return this.http
      .delete(`${this.baseUrl}/remove-duplicate-course`, {
        body: { section_course_id },
      })
      .pipe(catchError(this.handleError));
  }

  /**
   * Reset specific caches based on the provided CacheType array.
   * @param cacheTypes Array of CacheType enums indicating which caches to reset.
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
          break;
      }
    });
  }

  // ===================================
  // Schedule validation-related methods
  // ===================================

  public validateSchedule(
    schedule_id: number,
    faculty_id: number | null,
    room_id: number | null,
    day: string | null,
    start_time: string | null,
    end_time: string | null,
    program_id: number,
    year_level: number,
    section_id: number
  ): Observable<{ isValid: boolean; message: string }> {
    console.log(`Received parameters:`, {
      schedule_id,
      faculty_id,
      room_id,
      day,
      start_time,
      end_time,
      program_id,
      year_level,
      section_id,
    });

    return forkJoin([
      this.populateSchedules(),
      this.getAllRooms(),
      this.getFacultyDetails(),
    ]).pipe(
      switchMap(([schedules, rooms, faculty]) => {
        const roomCheck = this.checkRoomAvailability(
          room_id,
          day,
          start_time,
          end_time,
          schedules,
          rooms,
          schedule_id
        );
        const facultyCheck = this.checkFacultyAvailability(
          faculty_id,
          day,
          start_time,
          end_time,
          schedules,
          schedule_id
        );
        // const loadCheck = this.checkFacultyLoad(
        //   faculty_id,
        //   schedule_id,
        //   schedules,
        //   faculty
        // );
        // Removed timeCheck validation
        // const timeCheck = this.validateTimeBlock(start_time, end_time);

        if (!roomCheck.isValid) return of(roomCheck);
        if (!facultyCheck.isValid) return of(facultyCheck);
        // if (!loadCheck.isValid) return of(loadCheck);
        // Removed timeCheck validation
        // if (!timeCheck.isValid) return of(timeCheck);
        return of({ isValid: true, message: 'All validations passed' });
      })
    );
  }

  /**
   * Validates faculty availability based on provided details.
   */
  public validateFacultyAvailability(
    schedule_id: number,
    faculty_id: number | null,
    day: string | null,
    start_time: string | null,
    end_time: string | null,
    program_id: number,
    year_level: number,
    section_id: number
  ): Observable<{ isValid: boolean; message: string }> {
    return forkJoin([
      this.populateSchedules(),
      this.getAllRooms(),
      this.getFacultyDetails(),
    ]).pipe(
      map(([schedules, rooms, faculty]) => {
        const result = this.checkFacultyAvailability(
          faculty_id,
          day,
          start_time,
          end_time,
          schedules,
          schedule_id
        );
        return result;
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Validates room availability based on provided details.
   */
  public validateRoomAvailability(
    schedule_id: number,
    room_id: number | null,
    day: string | null,
    start_time: string | null,
    end_time: string | null,
    program_id: number,
    year_level: number,
    section_id: number
  ): Observable<{ isValid: boolean; message: string }> {
    return forkJoin([
      this.populateSchedules(),
      this.getAllRooms(),
      this.getFacultyDetails(),
    ]).pipe(
      map(([schedules, rooms, faculty]) => {
        const result = this.checkRoomAvailability(
          room_id,
          day,
          start_time,
          end_time,
          schedules,
          rooms,
          schedule_id
        );
        return result;
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Validates program schedule overlap based on provided details.
   */
  public validateProgramOverlap(
    schedule_id: number,
    program_id: number,
    year_level: number,
    day: string | null,
    start_time: string | null,
    end_time: string | null
  ): Observable<{ isValid: boolean; message: string }> {
    if (!program_id || !year_level || !day || !start_time || !end_time) {
      return of({ isValid: true, message: 'Program overlap check skipped' });
    }

    return this.populateSchedules().pipe(
      map((schedules) => {
        const conflictingDetail = this.findConflictingCourseInProgram(
          schedules,
          program_id,
          year_level,
          day!,
          start_time!,
          end_time!,
          schedule_id
        );

        if (conflictingDetail) {
          const { course, sectionName } = conflictingDetail;
          const program = schedules.programs.find(
            (p) => p.program_id === program_id
          );
          const programCode = program
            ? program.program_code
            : 'Unknown Program';
          return {
            isValid: false,
            message: `${programCode} ${year_level}-${sectionName} is already 
            scheduled for ${course.course_code} (${course.course_title}) on 
            ${day} from ${this.formatTimeForDisplay(
              course.schedule?.start_time || ''
            )} to ${this.formatTimeForDisplay(
              course.schedule?.end_time || ''
            )}.`,
          };
        } else {
          return { isValid: true, message: 'No program overlap detected' };
        }
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Validates whether a professor is available for a specific day and time
   * or if they are already teaching another course during that time.
   */

  private checkFacultyAvailability(
    faculty_id: number | null,
    day: string | null,
    start_time: string | null,
    end_time: string | null,
    schedules: PopulateSchedulesResponse,
    currentScheduleId: number
  ): { isValid: boolean; message: string } {
    if (!faculty_id || !day || !start_time || !end_time) {
      return { isValid: true, message: 'Faculty availability check skipped' };
    }

    const conflictingDetail = this.findConflictingSchedule(
      schedules,
      (course) =>
        course.faculty_id === faculty_id &&
        course.schedule?.day === day &&
        course.schedule.schedule_id !== currentScheduleId &&
        this.isTimeOverlap(
          start_time,
          end_time,
          course.schedule.start_time,
          course.schedule.end_time
        )
    );

    if (conflictingDetail) {
      const { course, programCode, yearLevel, sectionName } = conflictingDetail;
      return {
        isValid: false,
        message: `${course.professor} is already assigned to ${
          course.course_code
        } (${
          course.course_title
        }) for ${programCode} ${yearLevel}-${sectionName} on ${day} from ${this.formatTimeForDisplay(
          course.schedule?.start_time || ''
        )} to ${this.formatTimeForDisplay(course.schedule?.end_time || '')}.`,
      };
    }

    return { isValid: true, message: 'Faculty is available' };
  }

  /**
   * Validates whether a room is available for the given day and time.
   * It checks if the room is already booked by another course.
   */
  private checkRoomAvailability(
    room_id: number | null,
    day: string | null,
    start_time: string | null,
    end_time: string | null,
    schedules: PopulateSchedulesResponse,
    rooms: { rooms: Room[] },
    currentScheduleId: number
  ): { isValid: boolean; message: string } {
    if (!room_id || !day || !start_time || !end_time) {
      return { isValid: true, message: 'Room availability check skipped' };
    }

    const room = rooms.rooms.find((r) => r.room_id === room_id);
    if (!room) {
      return { isValid: false, message: 'Invalid room selected' };
    }

    const conflictingDetail = this.findConflictingSchedule(
      schedules,
      (course) =>
        (course.schedule?.room_id === room_id ||
          course.room?.room_id === room_id) &&
        course.schedule?.day === day &&
        course.schedule.schedule_id !== currentScheduleId &&
        this.isTimeOverlap(
          start_time,
          end_time,
          course.schedule?.start_time,
          course.schedule?.end_time
        )
    );

    if (conflictingDetail) {
      const { course, programCode, yearLevel, sectionName } = conflictingDetail;
      return {
        isValid: false,
        message: `Room ${room.room_code} is already booked for ${
          course.course_code
        } (${
          course.course_title
        }) in ${programCode} ${yearLevel}-${sectionName} on ${day} from ${this.formatTimeForDisplay(
          course.schedule?.start_time || ''
        )} to ${this.formatTimeForDisplay(course.schedule?.end_time || '')}.`,
      };
    }

    return { isValid: true, message: 'Room is available' };
  }

  /**
   * Helper method to find conflicting course within the same program and year level
   */

  private findConflictingCourseInProgram(
    schedules: PopulateSchedulesResponse,
    program_id: number,
    year_level: number,
    day: string,
    start_time: string,
    end_time: string,
    currentScheduleId: number
  ): ConflictingCourseDetail | undefined {
    for (const program of schedules.programs) {
      if (program.program_id !== program_id) continue;
      for (const yl of program.year_levels) {
        if (yl.year_level !== year_level) continue;
        for (const semester of yl.semesters) {
          for (const section of semester.sections) {
            for (const course of section.courses) {
              if (course.schedule?.day !== day) continue;
              if (course.schedule?.schedule_id === currentScheduleId) continue;
              if (
                this.isTimeOverlap(
                  start_time,
                  end_time,
                  course.schedule?.start_time,
                  course.schedule?.end_time
                )
              ) {
                return {
                  course,
                  sectionName: section.section_name,
                };
              }
            }
          }
        }
      }
    }
    return undefined;
  }

  /**
   * Searches through all schedules to find a schedule that conflicts with the
   * given condition, which could be for room, faculty, or section conflicts.
   */
  private findConflictingSchedule(
    schedules: PopulateSchedulesResponse,
    predicate: (course: CourseResponse) => boolean
  ): ConflictingScheduleDetail | undefined {
    for (const program of schedules.programs) {
      for (const yearLevel of program.year_levels) {
        for (const semester of yearLevel.semesters) {
          for (const section of semester.sections) {
            for (const course of section.courses) {
              if (predicate(course)) {
                return {
                  course,
                  programCode: program.program_code,
                  yearLevel: yearLevel.year_level,
                  sectionName: section.section_name,
                };
              }
            }
          }
        }
      }
    }
    return undefined;
  }

  // =============================
  // Time Helper Methods
  // =============================

  public formatTimeForDisplay(time: string): string {
    if (!time) return '';
    const [hours, minutes, seconds] = time.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  }

  private timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  private isTimeOverlap(
    start1: string,
    end1: string,
    start2: string | undefined,
    end2: string | undefined
  ): boolean {
    if (!start2 || !end2) return false;

    const start1Minutes = this.timeToMinutes(start1);
    const end1Minutes = this.timeToMinutes(end1);
    const start2Minutes = this.timeToMinutes(start2);
    const end2Minutes = this.timeToMinutes(end2);

    console.log('Time overlap check:', {
      time1: `${start1}-${end1}`,
      time2: `${start2}-${end2}`,
      start1Minutes,
      end1Minutes,
      start2Minutes,
      end2Minutes,
    });

    return start1Minutes < end2Minutes && end1Minutes > start2Minutes;
  }
}
