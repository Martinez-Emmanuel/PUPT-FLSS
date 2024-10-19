import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, forkJoin, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { environment } from '../../../../../environments/environment.dev';

export interface Program {
  program_id: number;
  program_code: string;
  program_title: string;
  year_levels: YearLevel[];
  sections: { [yearLevel: string]: number };
  curriculums: { [yearLevel: string]: string };
}

export interface Section {
  section_id: number;
  section_name: string;
}

export interface SectionsByProgram {
  [program: string]: {
    [year: number]: string[];
  };
}

export interface Curriculum {
  id: number;
  curriculum_year: string;
  name: string;
}

export interface Schedule {
  course_id: number;
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
  program_code: string;
  year: number;
  curriculum: string;
  section: string;

  schedule_id?: number;
  faculty_id?: number;
  faculty_email?: string;
  room_id?: number;
}

export interface Semester {
  semester_id: number;
  semester_number: string;
  semester: number;
  start_date: string;
  end_date: string;
  courses: Schedule[];
}

export interface AcademicYear {
  academic_year_id: number;
  academic_year: string;
  semesters: Semester[];
}

export interface YearLevel {
  year_level: number;
  curriculum_id: number;
  curriculum_year: string;
  number_of_sections: number;
  sections: Section[];
  semesters: Semester[];
}

export interface PopulateSchedulesResponse {
  active_semester_id: number;
  academic_year_id: number;
  semester_id: number;
  programs: ProgramResponse[];
}

export interface ProgramResponse {
  program_id: number;
  program_code: string;
  program_title: string;
  year_levels: YearLevelResponse[];
}

export interface YearLevelResponse {
  year_level: number;
  curriculum_id: number;
  curriculum_year: string;
  semesters: SemesterResponse[];
}

export interface SemesterResponse {
  semester: number;
  sections: SectionResponse[];
}

export interface SectionResponse {
  section_per_program_year_id: number;
  section_name: string;
  courses: CourseResponse[];
}

export interface CourseResponse {
  course_assignment_id: number;
  course_id: number;
  course_code: string;
  course_title: string;
  lec_hours: number;
  lab_hours: number;
  units: number;
  tuition_hours: number;
  schedule?: {
    schedule_id: number;
    day: string;
    start_time: string;
    end_time: string;
    room_id?: number;
  };
  professor: string;
  faculty_id: number;
  faculty_email: string;
  room?: {
    room_id: number;
    room_code: string;
  };
}

export interface Room {
  room_id: number;
  room_code: string;
  location: string;
  floor_level: string;
  room_type: string;
  capacity: number;
  status: string;
}

export interface Faculty {
  faculty_id: number;
  name: string;
  faculty_email: string;
  faculty_type: string;
  faculty_units: number;
}

export interface SubmittedPrefResponse {
  preferences: Preference[];
}

export interface Preference {
  faculty_id: number;
  faculty_name: string;
  faculty_code: string;
  faculty_units: string;
  active_semesters: ActiveSemester[];
}

export interface ActiveSemester {
  active_semester_id: number;
  academic_year_id: number;
  academic_year: string;
  semester_id: number;
  semester_label: string;
  courses: CoursePreference[];
}

export interface CoursePreference {
  course_assignment_id: number;
  course_details: CourseDetails;
  preferred_day: string;
  preferred_start_time: string;
  preferred_end_time: string;
  created_at: string;
  updated_at: string;
}

export interface CourseDetails {
  course_id: number;
  course_code: string;
  course_title: string;
}

@Injectable({
  providedIn: 'root',
})
export class SchedulingService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  /**
   * Handle HTTP errors.
   * This is a higher-order function that accepts a custom message and returns an error handler function.
   */
  private handleError(message: string) {
    return (error: HttpErrorResponse): Observable<never> => {
      console.error(`${message}:`, error);
      return throwError(() => new Error(`${message}. Please try again.`));
    };
  }

  // =============================
  // Academic Year-related methods
  // =============================

  // Fetch academic years from the backend
  getAcademicYears(): Observable<any[]> {
    return this.http
      .get<any[]>(`${this.baseUrl}/get-academic-years`)
      .pipe(catchError(this.handleError('Failed to fetch academic years')));
  }

  // Set the active academic year and semester
  setActiveYearAndSemester(
    academicYearId: number,
    semesterId: number,
    startDate: string,
    endDate: string
  ): Observable<void> {
    return this.http
      .post<void>(`${this.baseUrl}/set-active-ay-sem`, {
        academic_year_id: academicYearId,
        semester_id: semesterId,
        start_date: startDate,
        end_date: endDate,
      })
      .pipe(catchError(this.handleError('Failed to set active year and semester')));
  }

  // Delete academic year
  deleteAcademicYear(academicYearId: number): Observable<any> {
    return this.http
      .request('DELETE', `${this.baseUrl}/delete-ay`, {
        body: { academic_year_id: academicYearId },
      })
      .pipe(catchError(this.handleError('Failed to delete academic year')));
  }

  // Add new academic year
  addAcademicYear(yearStart: string, yearEnd: string): Observable<any> {
    return this.http
      .post<any>(`${this.baseUrl}/add-academic-year`, {
        year_start: yearStart,
        year_end: yearEnd,
      })
      .pipe(catchError(this.handleError('Failed to add academic year')));
  }

  // Get active academic year and semester details
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
      }>(`${this.baseUrl}/active-year-semester`)
      .pipe(catchError(this.handleError('Failed to fetch active year and semester')));
  }

  // =============================
  // Program-related methods
  // =============================

  // Fetch program details with year levels and curriculum versions for a specific academic year
  fetchProgramDetailsByAcademicYear(payload: {
    academic_year_id: number;
  }): Observable<any> {
    return this.http
      .post<any>(`${this.baseUrl}/fetch-ay-prog-details`, payload)
      .pipe(catchError(this.handleError('Failed to fetch program details by academic year')));
  }

  // Update year levels' curricula for a specific academic year and program
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
      .pipe(catchError(this.handleError('Failed to update year levels curricula')));
  }

  // Remove a program from an academic year
  removeProgramFromAcademicYear(
    academicYearId: number,
    programId: number
  ): Observable<any> {
    return this.http
      .request('DELETE', `${this.baseUrl}/remove-program`, {
        body: { academic_year_id: academicYearId, program_id: programId },
      })
      .pipe(catchError(this.handleError('Failed to remove program from academic year')));
  }

  // Edit section on a specific year level
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
      .pipe(catchError(this.handleError('Failed to update sections')));
  }

  // Fetch sections by program and year level
  getSections(program: string, year: number): Observable<string[]> {
    return this.http
      .get<string[]>(
        `${this.baseUrl}/programs/${program}/year/${year}/sections`
      )
      .pipe(catchError(this.handleError('Failed to fetch sections')));
  }

  // Fetch active year levels and curricula for programs
  getProgramsFromYearLevels(): Observable<any[]> {
    return this.http
      .get<any[]>(`${this.baseUrl}/active-year-levels-curricula`)
      .pipe(catchError(this.handleError('Failed to fetch programs from year levels')));
  }

  // Get active year levels curricula
  getActiveYearLevelsCurricula(): Observable<any[]> {
    return this.http
      .get<any[]>(`${this.baseUrl}/active-year-levels-curricula`)
      .pipe(catchError(this.handleError('Failed to fetch active year levels curricula')));
  }

  // =============================
  // Scheduling-related methods
  // =============================

  // Get assigned courses by program, year level, and section
  getAssignedCoursesByProgramYearAndSection(
    programId: number,
    yearLevel: number,
    sectionId: number
  ): Observable<any> {
    return this.http
      .get<any>(`${this.baseUrl}/get-assigned-courses-sem`, {
        params: {
          programId: programId.toString(),
          yearLevel: yearLevel.toString(),
          sectionId: sectionId.toString(),
        },
      })
      .pipe(catchError(this.handleError('Failed to fetch assigned courses')));
  }

  // Populate schedules
  populateSchedules(): Observable<PopulateSchedulesResponse> {
    return this.http
      .get<PopulateSchedulesResponse>(`${this.baseUrl}/populate-schedules`)
      .pipe(catchError(this.handleError('Failed to populate schedules')));
  }

  // Get all available rooms
  getAllRooms(): Observable<{ rooms: Room[] }> {
    return this.http
      .get<{ rooms: Room[] }>(`${this.baseUrl}/get-rooms`)
      .pipe(catchError(this.handleError('Failed to fetch rooms')));
  }

  // Get faculty details
  getFacultyDetails(): Observable<{ faculty: Faculty[] }> {
    return this.http
      .get<{ faculty: Faculty[] }>(`${this.baseUrl}/get-faculty`)
      .pipe(catchError(this.handleError('Failed to fetch faculty details')));
  }

  getSubmittedPreferencesForActiveSemester(): Observable<SubmittedPrefResponse> {
    return this.http
      .get<SubmittedPrefResponse>(`${this.baseUrl}/view-preferences`)
      .pipe(catchError(this.handleError('Failed to fetch submitted preferences')));
  }

  // Assign schedule to faculty, room, and time
  public assignSchedule(
    schedule_id: number,
    course_id: number, // added course_id
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
      course_id, // pass course_id
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
          return this.http.post<any>(
            `${this.baseUrl}/assign-schedule`,
            payload
          );
        } else {
          return throwError(() => new Error(validationResult.message));
        }
      }),
      catchError(this.handleError('Failed to assign schedule'))
    );
  }

  // ===================================
  // Schedule validation-related methods
  // ===================================

  public validateSchedule(
    schedule_id: number,
    course_id: number, // added course_id
    faculty_id: number | null,
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
      switchMap(([schedules, rooms, faculty]) => {
        // Perform all checks: program overlap, faculty availability, room availability
        // Return isValid and message
        return this.validateProgramOverlap(
          schedule_id,
          course_id, // pass course_id
          program_id,
          year_level,
          day,
          start_time,
          end_time
        ).pipe(
          switchMap((programResult) => {
            if (!programResult.isValid) {
              return of(programResult);
            }
            return this.validateFacultyAvailability(
              schedule_id,
              faculty_id,
              day,
              start_time,
              end_time,
              program_id,
              year_level,
              section_id
            ).pipe(
              switchMap((facultyResult) => {
                if (!facultyResult.isValid) {
                  return of(facultyResult);
                }
                return this.validateRoomAvailability(
                  schedule_id,
                  room_id,
                  day,
                  start_time,
                  end_time,
                  program_id,
                  year_level,
                  section_id
                ).pipe(
                  map((roomResult) => {
                    if (!roomResult.isValid) {
                      return roomResult;
                    }
                    return { isValid: true, message: 'All validations passed' };
                  })
                );
              })
            );
          })
        );
      }),
      catchError(this.handleError('Failed to validate schedule'))
    );
  }

  /**
   * Validates program overlap by checking if any course in the same program and year level
   * is scheduled on the same day and overlapping time, excluding the current schedule,
   * and excluding courses with the same course_id.
   */
  public validateProgramOverlap(
    schedule_id: number,
    course_id: number, // added course_id
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
        const conflictingCourse = this.findConflictingCourseInProgram(
          schedules,
          program_id,
          year_level,
          day,
          start_time,
          end_time,
          schedule_id,
          course_id // pass course_id
        );
        if (conflictingCourse) {
          const program = schedules.programs.find(
            (p) => p.program_id === program_id
          );
          const programCode = program
            ? program.program_code
            : 'Unknown Program';
          return {
            isValid: false,
            message: `Course ${conflictingCourse.course_code} (${
              conflictingCourse.course_title
            }) in Year Level ${year_level} of Program ${programCode} is already scheduled on ${day} from ${this.formatTimeForDisplay(
              conflictingCourse.schedule?.start_time || ''
            )} to ${this.formatTimeForDisplay(
              conflictingCourse.schedule?.end_time || ''
            )}.`,
          };
        } else {
          return { isValid: true, message: 'No program overlap detected' };
        }
      }),
      catchError(this.handleError('Failed to validate program overlap'))
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
    if (!faculty_id || !day || !start_time || !end_time) {
      return of({ isValid: true, message: 'Faculty availability check skipped' });
    }

    return this.populateSchedules().pipe(
      map((schedules) => {
        const conflictingSchedule = this.findConflictingSchedule(
          schedules,
          (course) =>
            course.faculty_id === faculty_id &&
            course.schedule?.schedule_id !== schedule_id && // Exclude current schedule being edited
            course.schedule?.day === day &&
            this.isTimeOverlap(
              start_time,
              end_time,
              course.schedule?.start_time || '',
              course.schedule?.end_time || ''
            )
        );

        return conflictingSchedule
          ? {
              isValid: false,
              message: `Professor ${
                conflictingSchedule.professor
              } is already assigned to ${conflictingSchedule.course_code} 
                        (${conflictingSchedule.course_title}) on ${day} from 
                        ${this.formatTimeForDisplay(
                          conflictingSchedule.schedule?.start_time || ''
                        )} to 
                        ${this.formatTimeForDisplay(
                          conflictingSchedule.schedule?.end_time || ''
                        )}.`,
            }
          : { isValid: true, message: 'Faculty is available' };
      }),
      catchError(this.handleError('Failed to validate faculty availability'))
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
    if (!room_id || !day || !start_time || !end_time) {
      return of({ isValid: true, message: 'Room availability check skipped' });
    }

    return this.populateSchedules().pipe(
      map((schedules) => {
        const conflictingSchedule = this.findConflictingSchedule(
          schedules,
          (course) =>
            (course.schedule?.room_id === room_id ||
              course.room?.room_id === room_id) &&
            course.schedule?.day === day &&
            course.schedule.schedule_id !== schedule_id && // Exclude current schedule being edited
            this.isTimeOverlap(
              start_time,
              end_time,
              course.schedule?.start_time || '',
              course.schedule?.end_time || ''
            )
        );

        return conflictingSchedule
          ? {
              isValid: false,
              message: `Room ${conflictingSchedule.room?.room_code || 'Unknown Room'} is already booked for ${
                conflictingSchedule.course_code
              } 
                        (${conflictingSchedule.course_title}) on ${day} from 
                        ${this.formatTimeForDisplay(
                          conflictingSchedule.schedule?.start_time || ''
                        )} to ${this.formatTimeForDisplay(
                          conflictingSchedule.schedule?.end_time || ''
                        )}.`,
            }
          : { isValid: true, message: 'Room is available' };
      }),
      catchError(this.handleError('Failed to validate room availability'))
    );
  }

  /**
   * Searches through all schedules to find a schedule that conflicts with the
   * given condition, which could be for room, faculty, or section conflicts.
   */
  private findConflictingSchedule(
    schedules: PopulateSchedulesResponse,
    predicate: (course: CourseResponse) => boolean
  ): CourseResponse | undefined {
    for (const program of schedules.programs) {
      for (const yearLevel of program.year_levels) {
        for (const semester of yearLevel.semesters) {
          for (const section of semester.sections) {
            const conflictingCourse = section.courses.find(predicate);
            if (conflictingCourse) {
              return conflictingCourse;
            }
          }
        }
      }
    }
    return undefined;
  }

  /**
   * Checks for conflicting courses in the same program, year level, day, and time,
   * excluding the current schedule and excluding courses with the same course_id.
   */
  private findConflictingCourseInProgram(
    schedules: PopulateSchedulesResponse,
    program_id: number,
    year_level: number,
    day: string,
    start_time: string,
    end_time: string,
    currentScheduleId: number,
    currentCourseId: number // added currentCourseId
  ): CourseResponse | undefined {
    for (const program of schedules.programs) {
      if (program.program_id !== program_id) continue;
      for (const yl of program.year_levels) {
        if (yl.year_level !== year_level) continue;
        for (const semester of yl.semesters) {
          for (const section of semester.sections) {
            for (const course of section.courses) {
              if (course.schedule?.day !== day) continue;
              if (course.schedule?.schedule_id === currentScheduleId) continue;
              if (course.course_id === currentCourseId) continue; // Skip same course
              if (
                this.isTimeOverlap(
                  start_time,
                  end_time,
                  course.schedule?.start_time || '',
                  course.schedule?.end_time || ''
                )
              ) {
                return course;
              }
            }
          }
        }
      }
    }
    return undefined;
  }

  // =============================
  // Helper Methods
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
