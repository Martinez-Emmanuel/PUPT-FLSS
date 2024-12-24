import { Injectable } from '@angular/core';

import {
  PopulateSchedulesResponse,
  CourseResponse,
  Room,
  ConflictingCourseDetail,
  ConflictingScheduleDetail,
} from '../../../models/scheduling.model';

@Injectable({
  providedIn: 'root',
})
export class ScheduleValidationService {
  constructor() {}

  /**
   * Validates schedule conflicts based on provided parameters.
   * @returns An object indicating whether conflicts exist and the messages.
   */
  public validateScheduleConflicts(
    schedules: PopulateSchedulesResponse,
    rooms: { rooms: Room[] },
    params: {
      schedule_id: number;
      program_id: number;
      year_level: number;
      day: string;
      start_time: string;
      end_time: string;
      section_id: number;
      faculty_id: number | null;
      room_id: number | null;
    }
  ): { hasConflicts: boolean; messages: string[] } {
    const conflicts: string[] = [];

    // Check program overlap
    const programOverlap = this.checkProgramTimeOverlap(
      schedules,
      params.program_id,
      params.year_level,
      params.day,
      params.start_time,
      params.end_time,
      params.schedule_id,
      params.section_id
    );
    if (!programOverlap.isValid) conflicts.push(programOverlap.message);

    // Check faculty availability
    if (params.faculty_id) {
      const facultyAvailability = this.checkFacultyAvailability(
        params.faculty_id,
        params.day,
        params.start_time,
        params.end_time,
        schedules,
        params.schedule_id
      );
      if (!facultyAvailability.isValid)
        conflicts.push(facultyAvailability.message);
    }

    // Check room availability
    if (params.room_id) {
      const roomAvailability = this.checkRoomAvailability(
        params.room_id,
        params.day,
        params.start_time,
        params.end_time,
        schedules,
        rooms,
        params.schedule_id
      );
      if (!roomAvailability.isValid) conflicts.push(roomAvailability.message);
    }

    return { hasConflicts: conflicts.length > 0, messages: conflicts };
  }

  /**
   * Checks for time overlaps within a program.
   * @returns An object indicating whether a program time is valid and a message.
   */
  private checkProgramTimeOverlap(
    schedules: PopulateSchedulesResponse,
    program_id: number,
    year_level: number,
    day: string,
    start_time: string,
    end_time: string,
    currentScheduleId: number,
    section_id: number
  ): { isValid: boolean; message: string } {
    if (!program_id || !year_level || !day || !start_time || !end_time) {
      return { isValid: true, message: 'Program overlap check skipped' };
    }

    const conflictingDetail = this.findConflictingCourseWithinProgram(
      schedules,
      program_id,
      year_level,
      day,
      start_time,
      end_time,
      currentScheduleId,
      section_id
    );

    if (conflictingDetail) {
      const { course, sectionName } = conflictingDetail;
      const program = schedules.programs.find(
        (p) => p.program_id === program_id
      );
      const programCode = program?.program_code || 'Unknown Program';
      return {
        isValid: false,
        message: `${programCode} ${year_level}-${sectionName} is already scheduled for ${
          course.course_code
        } (${course.course_title}) on ${day} from ${this.formatTimeForDisplay(
          course.schedule?.start_time || ''
        )} to ${this.formatTimeForDisplay(course.schedule?.end_time || '')}.`,
      };
    }

    return { isValid: true, message: 'No program overlap detected' };
  }

  /**
   * Checks the availability of a faculty member.
   * @returns An object indicating whether a faculty is available and a message.
   */
  private checkFacultyAvailability(
    faculty_id: number,
    day: string,
    start_time: string,
    end_time: string,
    schedules: PopulateSchedulesResponse,
    currentScheduleId: number
  ): { isValid: boolean; message: string } {
    if (!faculty_id || !day || !start_time || !end_time) {
      return { isValid: true, message: 'Faculty availability check skipped' };
    }

    const conflictingDetail = this.findConflictingScheduleForPredicate(
      schedules,
      (course) =>
        course.faculty_id === faculty_id &&
        course.schedule?.day === day &&
        course.schedule.schedule_id !== currentScheduleId &&
        this.doTimesOverlap(
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
   * Checks the availability of a room.
   * @returns An object indicating whether a room is available and a message.
   */
  private checkRoomAvailability(
    room_id: number,
    day: string,
    start_time: string,
    end_time: string,
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

    const conflictingDetail = this.findConflictingScheduleForPredicate(
      schedules,
      (course) =>
        (course.schedule?.room_id === room_id ||
          course.room?.room_id === room_id) &&
        course.schedule?.day === day &&
        course.schedule.schedule_id !== currentScheduleId &&
        this.doTimesOverlap(
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
   * Finds conflicting courses within a program based on specified criteria.
   * @returns A ConflictingCourseDetail object if a conflict is found,
   * otherwise undefined.
   */
  private findConflictingCourseWithinProgram(
    schedules: PopulateSchedulesResponse,
    program_id: number,
    year_level: number,
    day: string,
    start_time: string,
    end_time: string,
    currentScheduleId: number,
    section_id: number
  ): ConflictingCourseDetail | undefined {
    const program = schedules.programs.find((p) => p.program_id === program_id);
    if (!program) return undefined;

    const yearLevel = program.year_levels.find(
      (y) => y.year_level === year_level
    );
    if (!yearLevel) return undefined;

    for (const semester of yearLevel.semesters) {
      for (const section of semester.sections) {
        if (section.section_per_program_year_id !== section_id) continue;
        for (const course of section.courses) {
          if (
            course.schedule?.day !== day ||
            course.schedule?.schedule_id === currentScheduleId
          )
            continue;
          if (
            this.doTimesOverlap(
              start_time,
              end_time,
              course.schedule?.start_time,
              course.schedule?.end_time
            )
          ) {
            return { course, sectionName: section.section_name };
          }
        }
        return undefined;
      }
    }
    return undefined;
  }

  /**
   * Finds conflicting schedules based on a provided predicate function.
   * @returns A ConflictingScheduleDetail object if a conflict is found,
   * otherwise undefined.
   */
  private findConflictingScheduleForPredicate(
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

  /**
   * Formats a time string for display.
   * @returns A formatted time string.
   */
  public formatTimeForDisplay(time: string): string {
    if (!time) return '';
    const [hours, minutes] = time.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  }

  /**
   * Converts a time string to minutes.
   * @returns The time in minutes.
   */
  private timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  /**
   * Checks if two time ranges overlap.
   * @returns True if the time ranges overlap, false otherwise.
   */
  private doTimesOverlap(
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

    return start1Minutes < end2Minutes && end1Minutes > start2Minutes;
  }
}
