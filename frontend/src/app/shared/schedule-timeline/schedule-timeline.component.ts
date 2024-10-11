import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

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

@Component({
  selector: 'app-schedule-timeline',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './schedule-timeline.component.html',
  styleUrls: ['./schedule-timeline.component.scss'],
})
export class ScheduleTimelineComponent implements OnInit {
  @Input() scheduleData: any;

  days: string[] = [
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
    console.log('Schedule Data:', this.scheduleData);
    this.generateTimeSlots();
    this.processScheduleData();
    console.log('Processed Schedule Blocks:', this.scheduleBlocks);
  }

  private generateTimeSlots() {
    const startTime = 7 * 60;
    const endTime = 21 * 60;
    const interval = 30;

    for (let time = startTime; time <= endTime; time += interval) {
      const hours = Math.floor(time / 60);
      const minutes = time % 60;
      const ampm = hours >= 12 ? 'PM' : 'AM';
      const formattedHours = hours % 12 || 12;
      const formattedTime = `${formattedHours
        .toString()
        .padStart(2, '0')}:${minutes.toString().padStart(2, '0')} ${ampm}`;

      this.timeSlots.push({ time: formattedTime, minutes: time });
    }
  }

  private processScheduleData() {
    console.log('Processing schedule data:', this.scheduleData);
    if (Array.isArray(this.scheduleData) && this.scheduleData.length > 0) {
      this.scheduleData.forEach((schedule: any) => {
        const startTime = this.convertTimeToMinutes(schedule.start_time);
        const endTime = this.convertTimeToMinutes(schedule.end_time);
        const startSlot = this.findTimeSlotIndex(startTime);
        
        // Correctly calculate duration, adding an extra timeslot if there's a remainder
        const duration = Math.ceil((endTime - startTime) / 30);
  
        // Ensure that if endTime is perfectly divisible by 30 after startTime, we add an extra slot.
        const hasExtraSlot = (endTime - startTime) % 30 === 0 && endTime !== startTime;
        const adjustedDuration = hasExtraSlot ? duration + 1 : duration;
  
        this.scheduleBlocks.push({
          day: schedule.day,
          startSlot: startSlot,
          duration: adjustedDuration,
          courseCode: schedule.course_details.course_code,
          courseTitle: schedule.course_details.course_title,
          roomCode: schedule.room_code,
          program: schedule.program_code,
          yearLevel: schedule.year_level,
          section: schedule.section_name,
        });
      });
    } else {
      console.warn('No schedules found or invalid data structure:', this.scheduleData);
    }
  }  
  
  private convertTimeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  private findTimeSlotIndex(minutes: number): number {
    return this.timeSlots.findIndex(slot => slot.minutes >= minutes);
  }

  isScheduleBlockStart(day: string, slotIndex: number): boolean {
    return this.scheduleBlocks.some(
      b => b.day === day && slotIndex === b.startSlot
    );
  }
  
  getScheduleBlockHeight(day: string, slotIndex: number): number {
    const block = this.scheduleBlocks.find(
      b => b.day === day && slotIndex === b.startSlot
    );
    if (block) {
      // Calculate exact height based on cell height and duration
      return (block.duration * 32) - 2; // 32px is the cell height (2rem), subtract 2px for borders
    }
    return 0;
  }
  
  // Update the getScheduleBlockStyle method:
  getScheduleBlockStyle(day: string, slotIndex: number): any {
    const block = this.scheduleBlocks.find(
      b => b.day === day && slotIndex >= b.startSlot && slotIndex < b.startSlot + b.duration
    );
    if (block) {
      const baseStyle = {
        'background-color': 'var(--primary-fade)',
        'border-left': '1px solid var(--primary-one)',
        'border-right': '1px solid var(--primary-one)',
      };
  
      if (slotIndex === block.startSlot) {
        return {
          ...baseStyle,
          'border-top': '1px solid var(--primary-one)',
        };
      } else if (slotIndex === block.startSlot + block.duration - 1) {
        return {
          ...baseStyle,
          'border-bottom': '1px solid var(--primary-one)',
        };
      }
      return baseStyle;
    }
    return {};
  }
  
  getScheduleBlockContent(day: string, slotIndex: number): string {
    const block = this.scheduleBlocks.find(
      b => b.day === day && slotIndex >= b.startSlot && slotIndex < b.startSlot + b.duration
    );
    if (block && slotIndex === block.startSlot) {
      return `${block.courseCode} - ${block.courseTitle}\n${block.roomCode}\n${block.program} ${block.yearLevel}-${block.section}`;
    }
    return '';
  }
}