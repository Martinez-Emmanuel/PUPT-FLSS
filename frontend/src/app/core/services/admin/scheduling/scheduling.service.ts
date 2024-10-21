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

interface ConflictingCourseDetail {
  course: CourseResponse;
  sectionName: string;
}

interface ConflictingScheduleDetail {
  course: CourseResponse;
  programCode: string;
  yearLevel: number;
  sectionName: string;
}

@Injectable({
  providedIn: 'root',
})
export class SchedulingService {
  private baseUrl = environment.apiUrl;

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

  // =============================
  // Academic Year-related methods
  // =============================

  // Fetch academic years from the backend
  getAcademicYears(): Observable<any[]> {
    return this.http
      .get<any[]>(`${this.baseUrl}/get-academic-years`)
      .pipe(catchError(this.handleError));
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
      .pipe(catchError(this.handleError));
  }

  // Delete academic year
  deleteAcademicYear(academicYearId: number): Observable<any> {
    return this.http
      .request('DELETE', `${this.baseUrl}/delete-ay`, {
        body: { academic_year_id: academicYearId },
      })
      .pipe(catchError(this.handleError));
  }

  // Add new academic year
  addAcademicYear(yearStart: string, yearEnd: string): Observable<any> {
    return this.http
      .post<any>(`${this.baseUrl}/add-academic-year`, {
        year_start: yearStart,
        year_end: yearEnd,
      })
      .pipe(catchError(this.handleError));
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
      .pipe(catchError(this.handleError));
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
      .pipe(catchError(this.handleError));
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
      .pipe(catchError(this.handleError));
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
      .pipe(catchError(this.handleError));
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
      .pipe(catchError(this.handleError));
  }

  // Fetch sections by program and year level
  getSections(program: string, year: number): Observable<string[]> {
    return this.http
      .get<string[]>(
        `${this.baseUrl}/programs/${program}/year/${year}/sections`
      )
      .pipe(catchError(this.handleError));
  }

  // Fetch active year levels and curricula for programs
  getProgramsFromYearLevels(): Observable<any[]> {
    return this.http
      .get<any[]>(`${this.baseUrl}/active-year-levels-curricula`)
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
      .pipe(catchError(this.handleError));
  }

  // Populate schedules
  populateSchedules(): Observable<PopulateSchedulesResponse> {
    return this.http
      .get<PopulateSchedulesResponse>(`${this.baseUrl}/populate-schedules`)
      .pipe(catchError(this.handleError));
  }

  // Get all available rooms
  getAllRooms(): Observable<{ rooms: Room[] }> {
    return this.http
      .get<{ rooms: Room[] }>(`${this.baseUrl}/get-rooms`)
      .pipe(catchError(this.handleError));
  }

  // Get faculty details
  getFacultyDetails(): Observable<{ faculty: Faculty[] }> {
    return this.http
      .get<{ faculty: Faculty[] }>(`${this.baseUrl}/get-faculty`)
      .pipe(catchError(this.handleError));
  }

  getSubmittedPreferencesForActiveSemester(): Observable<SubmittedPrefResponse> {
    return this.http
      .get<SubmittedPrefResponse>(`${this.baseUrl}/view-preferences`)
      .pipe(catchError(this.handleError));
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
          return this.http.post<any>(
            `${this.baseUrl}/assign-schedule`,
            payload
          );
        } else {
          return throwError(() => new Error(validationResult.message));
        }
      }),
      catchError(this.handleError)
    );
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
