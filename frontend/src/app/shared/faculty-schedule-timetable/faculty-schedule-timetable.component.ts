import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { fadeAnimation } from '../../core/animations/animations';

interface TimeSlot {
  time: string;
  minutes: number;
}

interface ScheduleBlock {
  day: string;
  startSlot: number;
  duration: number;
  courseCode: string;
  courseTitle: string;
  roomCode: string;
  program: string;
  yearLevel: number;
  section: string;
}

type Day =
  | 'Monday'
  | 'Tuesday'
  | 'Wednesday'
  | 'Thursday'
  | 'Friday'
  | 'Saturday'
  | 'Sunday';

@Component({
    selector: 'app-faculty-schedule-timetable',
    imports: [CommonModule],
    templateUrl: './faculty-schedule-timetable.component.html',
    styleUrls: ['./faculty-schedule-timetable.component.scss'],
    animations: [fadeAnimation]
})
export class FacultyScheduleTimetableComponent implements OnInit {
  @Input() facultySchedule: any;

  days: Day[] = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday',
  ];
  timeSlots: TimeSlot[] = [];
  scheduleBlocks: ScheduleBlock[] = [];

  ngOnInit() {
    this.generateTimeSlots();
    this.processScheduleData();
  }

  private generateTimeSlots() {
    const startTime = 7 * 60;
    const endTime = 21 * 60;
    const interval = 30;

    for (let time = startTime; time <= endTime; time += interval) {
      const formattedTime = this.formatMinutesTo12Hour(time);
      this.timeSlots.push({ time: formattedTime, minutes: time });
    }
  }

  private processScheduleData() {
    if (this.facultySchedule && this.facultySchedule.schedules) {
      this.scheduleBlocks = this.facultySchedule.schedules.map(
        (schedule: any) => {
          const startTime = this.convertTimeToMinutes(schedule.start_time);
          const endTime = this.convertTimeToMinutes(schedule.end_time);
          const startSlot = this.findTimeSlotIndex(startTime);
          const duration = Math.ceil((endTime - startTime) / 30);
          const adjustedDuration =
            (endTime - startTime) % 30 === 0 ? duration + 1 : duration;

          return {
            day: schedule.day,
            startSlot: startSlot,
            duration: adjustedDuration,
            courseCode: schedule.course_details.course_code,
            courseTitle: schedule.course_details.course_title,
            roomCode: schedule.room_code,
            program: schedule.program_code,
            yearLevel: schedule.year_level,
            section: schedule.section_name,
          };
        }
      );
    } else {
      console.warn(
        'No schedules found or invalid data structure:',
        this.facultySchedule
      );
    }
  }

  private convertTimeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  private findTimeSlotIndex(minutes: number): number {
    return this.timeSlots.findIndex((slot) => slot.minutes >= minutes);
  }

  isScheduleBlockStart(day: string, slotIndex: number): boolean {
    return this.scheduleBlocks.some(
      (b) => b.day === day && slotIndex === b.startSlot
    );
  }

  getScheduleBlockHeight(day: string, slotIndex: number): number {
    const block = this.getScheduleBlock(day, slotIndex);
    return block ? block.duration * 26 - 2 : 0;
  }

  getScheduleBlockStyle(day: string, slotIndex: number): any {
    const block = this.getScheduleBlock(day, slotIndex);
    if (block) {
      const { backgroundColor, borderColor } = this.getBlockColors(day as Day);
      const baseStyle = {
        'background-color': backgroundColor,
        'border-left': `1px solid ${borderColor}`,
        'border-right': `1px solid ${borderColor}`,
      };

      if (slotIndex === block.startSlot) {
        return { ...baseStyle, 'border-top': `1px solid ${borderColor}` };
      } else if (slotIndex === block.startSlot + block.duration - 1) {
        return { ...baseStyle, 'border-bottom': `1px solid ${borderColor}` };
      }
      return baseStyle;
    }
    return {};
  }

  getDayClass(day: string): string {
    return `schedule-${day.toLowerCase()}`;
  }

  getBlockProperty(
    day: string,
    slotIndex: number,
    property: keyof ScheduleBlock
  ): any {
    const block = this.getScheduleBlock(day, slotIndex);
    return block ? block[property] : null;
  }

  getFormattedTime(day: string, slotIndex: number): string {
    const block = this.getScheduleBlock(day, slotIndex);
    if (block) {
      const schedule = this.facultySchedule.schedules.find(
        (s: any) =>
          s.day === day &&
          this.convertTimeToMinutes(s.start_time) ===
            this.timeSlots[slotIndex].minutes
      );
      if (schedule) {
        return `${this.formatTimeTo12Hour(
          schedule.start_time
        )} - ${this.formatTimeTo12Hour(schedule.end_time)}`;
      }
    }
    return '';
  }

  private getBlockColors(day: Day) {
    const dayColors: Record<
      Day,
      { backgroundColor: string; borderColor: string }
    > = {
      Monday: {
        backgroundColor: 'var(--primary-fade)',
        borderColor: 'var(--primary-text)',
      },
      Tuesday: {
        backgroundColor: 'var(--secondary-fade)',
        borderColor: 'var(--secondary-text)',
      },
      Wednesday: {
        backgroundColor: 'var(--blue-fade)',
        borderColor: 'var(--blue-primary)',
      },
      Thursday: {
        backgroundColor: 'var(--aqua-fade)',
        borderColor: 'var(--aqua-primary)',
      },
      Friday: {
        backgroundColor: 'var(--purple-fade)',
        borderColor: 'var(--purple-primary)',
      },
      Saturday: {
        backgroundColor: 'var(--green-fade)',
        borderColor: 'var(--green-primary)',
      },
      Sunday: {
        backgroundColor: 'var(--primary-fade)',
        borderColor: 'var(--primary-text)',
      },
    };
    return dayColors[day];
  }

  private formatMinutesTo12Hour(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 || 12;
    return `${formattedHours}:${mins.toString().padStart(2, '0')} ${ampm}`;
  }

  private formatTimeTo12Hour(time: string): string {
    let [hours, minutes] = time.split(':').map(Number);
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    return `${hours}:${minutes.toString().padStart(2, '0')} ${ampm}`;
  }

  private getScheduleBlock(
    day: string,
    slotIndex: number
  ): ScheduleBlock | undefined {
    return this.scheduleBlocks.find(
      (b) =>
        b.day === day &&
        slotIndex >= b.startSlot &&
        slotIndex < b.startSlot + b.duration
    );
  }
}
