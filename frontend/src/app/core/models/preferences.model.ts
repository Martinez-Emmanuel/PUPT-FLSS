export interface PreferredDay {
  day: string;
  start_time: string;
  end_time: string;
}

export interface Course {
  course_assignment_id: number;
  course_id: number;
  course_code: string;
  pre_req: string;
  co_req: string;
  course_title: string;
  lec_hours: number;
  lab_hours: number;
  units: number;
  tuition_hours: number;
  preferred_days?: PreferredDay[];
}
export interface ActiveSemester {
  active_semester_id: number;
  academic_year_id: number;
  academic_year: string;
  semester_id: number;
  semester_label: string;
  courses: Course[];
  global_deadline?: Date | null;
  individual_deadline?: Date | null;
  global_start_date?: Date | null;
  individual_start_date?: Date | null;
}

export interface SemesterDetails {
  semester: number;
  courses: Course[];
}

export interface YearLevel {
  year_level: number;
  curriculum_id: number;
  curriculum_year: string;
  semester: SemesterDetails;
}

export interface Program {
  program_id: number;
  program_code: string;
  program_title: string;
  year_levels: YearLevel[];
}

export interface AssignedCoursesResponse {
  active_semester_id: number;
  academic_year_id: number;
  semester_id: number;
  programs: Program[];
}
