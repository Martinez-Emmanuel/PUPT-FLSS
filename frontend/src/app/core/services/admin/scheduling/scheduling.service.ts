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
    room_id?: number
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

  private handleError(error: HttpErrorResponse): Observable<never> {

    let errorMessage = 'Something went wrong; please try again later.';
  
    // Check if the error message exists in the error response
    if (error.error?.message) {
      errorMessage = error.error.message;  // Use detailed backend error message
    } else if (error.message) {
      errorMessage = error.message;  // Use generic error message
    }
    return throwError(() => new Error(errorMessage));
  }
  
  /* Academic Year-related methods */

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

  /* Program-related methods */

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

  /* Schedule-related methods */

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

  // Assign schedule to faculty, room, and time
  assignSchedule(
    schedule_id: number,
    faculty_id: number | null,
    room_id: number | null,
    day: string | null,
    start_time: string | null,
    end_time: string | null
  ): Observable<any> {
    return this.validateSchedule(
      schedule_id, 
      faculty_id, 
      room_id, 
      day, 
      start_time, 
      end_time
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
          return this.http.post<any>(`${this.baseUrl}/assign-schedule`, payload);
        } else {
          return throwError(() => new Error(validationResult.message));
        }
      }),
      catchError(this.handleError)
    );
  }

  public validateSchedule(
    schedule_id: number,
    faculty_id: number | null,
    room_id: number | null,
    day: string | null,
    start_time: string | null,
    end_time: string | null
  ): Observable<{ isValid: boolean; message: string }> {
    return forkJoin([
      this.populateSchedules(),
      this.getAllRooms(),
      this.getFacultyDetails()
    ]).pipe(
      switchMap(([schedules, rooms, faculty]) => {
        const roomCheck = this.checkRoomAvailability(
          room_id, day, 
          start_time, 
          end_time, 
          schedules, 
          rooms
        );
        const facultyCheck = this.checkFacultyAvailability(
          faculty_id, 
          day, 
          start_time, 
          end_time, 
          schedules
        );
        const loadCheck = this.checkFacultyLoad(
          faculty_id, 
          schedule_id, 
          schedules, 
          faculty
        );
        const sectionCheck = this.checkProgramSectionSchedule(
          schedule_id, 
          day, 
          start_time, 
          end_time, 
          schedules
        );
        const timeCheck = this.validateTimeBlock(start_time, end_time);

        if (!roomCheck.isValid) return of(roomCheck);
        if (!facultyCheck.isValid) return of(facultyCheck);
        if (!loadCheck.isValid) return of(loadCheck);
        if (!sectionCheck.isValid) return of(sectionCheck);
        if (!timeCheck.isValid) return of(timeCheck);
        return of({ isValid: true, message: 'All validations passed' });
      })
    );
  }
  
  // Validates whether a room is available for the given day and time. It checks if the room is already booked by another course.
  private checkRoomAvailability(
    room_id: number | null,
    day: string | null,
    start_time: string | null,
    end_time: string | null,
    schedules: PopulateSchedulesResponse,
    rooms: { rooms: Room[] }
  ): { isValid: boolean; message: string } {
    if (!room_id || !day || !start_time || !end_time) {
      return { isValid: true, message: 'Room availability check skipped' };
    }
  
    const room = rooms.rooms.find(r => r.room_id === room_id);
    if (!room) {
      return { isValid: false, message: 'Invalid room selected' };
    }
  
    const conflictingSchedule = this.findConflictingSchedule(
      schedules, (course) => 
      (course.schedule?.room_id === room_id || course.room?.room_id === room_id) 
        && course.schedule?.day === day && this.isTimeOverlap(
          start_time, 
          end_time, 
          course.schedule?.start_time, 
          course.schedule?.end_time
        )
    );
  
    return conflictingSchedule
      ? { isValid: false, message: 
        `Room ${room.room_code} is already booked for 
        ${conflictingSchedule.course_code} (${conflictingSchedule.course_title}) 
        on ${day} from ${conflictingSchedule.schedule?.start_time} to 
        ${conflictingSchedule.schedule?.end_time}` }
      : { isValid: true, message: 'Room is available' };
  }
  
  // Checks if a professor is available for a specific day and time or if they are already teaching another course during that time.
  private checkFacultyAvailability(
    faculty_id: number | null,
    day: string | null,
    start_time: string | null,
    end_time: string | null,
    schedules: PopulateSchedulesResponse
  ): { isValid: boolean; message: string } {
    if (!faculty_id || !day || !start_time || !end_time) {
      return { isValid: true, message: 'Faculty availability check skipped' };
    }

    const conflictingSchedule = this.findConflictingSchedule(
      schedules, (course) => 
      course.faculty_id === faculty_id &&
      course.schedule?.day === day &&
      this.isTimeOverlap(
        start_time, end_time, 
        course.schedule.start_time, course.schedule.end_time
      )
    );

    return conflictingSchedule
    ? { 
        isValid: false, 
        message: 
        `Professor ${conflictingSchedule.professor}
         is already assigned to ${conflictingSchedule.course_code} 
         (${conflictingSchedule.course_title}) on ${day} from 
         ${conflictingSchedule.schedule?.start_time} to 
         ${conflictingSchedule.schedule?.end_time}.`
      }
    : { isValid: true, message: 'Faculty is available' };
  }

  // Verifies that assigning the new course to the professor does not exceed their allowed teaching load (in terms of units).
  private checkFacultyLoad(
    faculty_id: number | null,
    schedule_id: number,
    schedules: PopulateSchedulesResponse,
    facultyDetails: { faculty: Faculty[] }
  ): { isValid: boolean; message: string } {
    if (!faculty_id) {
      return { isValid: true, message: 'Faculty load check skipped' };
    }

    const faculty = facultyDetails.faculty.find(
      f => f.faculty_id === faculty_id
    );
    if (!faculty) {
      return { isValid: false, message: 'Invalid faculty selected' };
    }

    const assignedCourses = this.findAllCoursesForFaculty(
      schedules, faculty_id
    );
    const totalUnits = assignedCourses.reduce(
      (sum, course) => sum + course.units, 0
    );

    const newCourse = this.findCourseById(schedules, schedule_id);
    const newTotalUnits = totalUnits + (newCourse?.units || 0);

    return newTotalUnits <= faculty.faculty_units
      ? { isValid: true, message: 'Faculty load is within limits' }
      : { isValid: false, message: 
        `Faculty load (${newTotalUnits} units) exceeds the limit
         (${faculty.faculty_units} units)` 
        };
  }

  //Ensures that the new schedule does not overlap with any existing schedules for the same program section.
  private checkProgramSectionSchedule(
    schedule_id: number,
    day: string | null,
    start_time: string | null,
    end_time: string | null,
    schedules: PopulateSchedulesResponse
  ): { isValid: boolean; message: string } {
    if (!day || !start_time || !end_time) {
      return { isValid: true, message: 
        'Program section schedule check skipped'
      };
    }

    const course = this.findCourseById(schedules, schedule_id);
    if (!course) {
      return { isValid: false, message: 'Invalid course selected' };
    }

    const conflictingSchedule = this.findConflictingSchedule(
      schedules, (otherCourse) => 
      otherCourse.course_assignment_id !== schedule_id &&
      this.isSameSection(course, otherCourse) &&
      otherCourse.schedule?.day === day &&
      this.isTimeOverlap(
        start_time, end_time,
         otherCourse.schedule.start_time, otherCourse.schedule.end_time
        )
    );

    return conflictingSchedule
      ? { isValid: false, message: 'Program section has a scheduling conflict' }
      : { isValid: true, message: 'No conflicts in program section schedule' };
  }
  
  //Ensures that the time block for the class is valid 
  //(e.g., the start time is before the end time, and the duration is within a certain limit).
  private validateTimeBlock(
    start_time: string | null,
    end_time: string | null
  ): { isValid: boolean; message: string } {
    if (!start_time || !end_time) {
      return { isValid: true, message: 'Time block validation skipped' };
    }

    const start = new Date(`1970-01-01T${start_time}`);
    const end = new Date(`1970-01-01T${end_time}`);
    const duration = (end.getTime() - start.getTime()) / (1000 * 60 * 60); 

    if (start >= end) {
      return { isValid: false, message:
         'Start time must be earlier than end time'
        };
    }

    if (duration > 4) { // Assuming a maximum class duration of 4 hours
      return { isValid: false, message: 
        'Class duration exceeds the maximum allowed time'
      };
    }
    return { isValid: true, message: 'Time block is valid' };
  }

  // Checks if two time blocks overlap by comparing their start and end times.
  private isTimeOverlap(
    start1: string, 
    end1: string, 
    start2: string, 
    end2: string): boolean {
    const s1 = new Date(`1970-01-01T${start1}`);
    const e1 = new Date(`1970-01-01T${end1}`);
    const s2 = new Date(`1970-01-01T${start2}`);
    const e2 = new Date(`1970-01-01T${end2}`);

    // Add 10 minutes buffer
    s1.setMinutes(s1.getMinutes() - 10);
    e1.setMinutes(e1.getMinutes() + 10);

    return (s1 < e2 && e1 > s2);
  }

  //Searches through all schedules to find a schedule that conflicts with the given predicate 
  //(condition), which could be for room, faculty, or section conflicts.
  private findConflictingSchedule(
    schedules: PopulateSchedulesResponse, 
    predicate: (course: CourseResponse) => boolean): 
    CourseResponse | undefined {
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

  //Finds all courses assigned to a specific faculty member, which is useful for calculating their total teaching load.
  private findAllCoursesForFaculty(
    schedules: PopulateSchedulesResponse, 
    faculty_id: number): CourseResponse[] {
    const courses: CourseResponse[] = [];
    this.findConflictingSchedule(schedules, (course) => {
      if (course.faculty_id === faculty_id) {
        courses.push(course);
      }
      return false; 
    });
    return courses;
  }

  // Searches for a specific course by its assignment ID within the populated schedules.
  private findCourseById(
    schedules: PopulateSchedulesResponse, 
    course_assignment_id: number): CourseResponse | undefined {
    return this.findConflictingSchedule(
      schedules, (course) => course.course_assignment_id === course_assignment_id
    );
  }

  //Determines if two courses belong to the same program section. 
  //This is important for checking if multiple courses are scheduled at the same time for the same section.
  private isSameSection(course1: CourseResponse, course2: CourseResponse): boolean {
    // This is a simplification. You might need to adjust this based on how sections are actually identified in your data structure
    return course1.course_assignment_id.toString().slice(0, -3) === course2.course_assignment_id.toString().slice(0, -3);
  }

  getSubmittedPreferencesForActiveSemester(): Observable<SubmittedPrefResponse> {
    return this.http
      .get<SubmittedPrefResponse>(`${this.baseUrl}/view-preferences`)
      .pipe(catchError(this.handleError));
  }
}
