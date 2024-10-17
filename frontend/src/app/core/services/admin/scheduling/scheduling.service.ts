import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
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
    console.error('An error occurred:', error);
    return throwError(
      () => new Error('Something went wrong; please try again later.')
    );
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
      .pipe(catchError(this.handleError));
  }

  getSubmittedPreferencesForActiveSemester(): Observable<SubmittedPrefResponse> {
    return this.http
      .get<SubmittedPrefResponse>(`${this.baseUrl}/view-preferences`)
      .pipe(catchError(this.handleError));
  }
}
