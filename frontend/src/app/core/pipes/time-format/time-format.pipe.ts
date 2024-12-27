/* ABOUT:
  This pipe is used to transform time format display in AM/PM.
  Currently used in Set Preferences table in core/faculty/preferences component.
*/
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'timeFormat',
})
export class TimeFormatPipe implements PipeTransform {
  transform(value: string): string {
    if (!value) return '';

    const [start, end] = value.split(' - ');
    return `${this.formatTime(start)} - ${this.formatTime(end)}`;
  }

  private formatTime(time: string): string {
    const [hours, minutesAndPeriod] = time.split(':');
    const [minutes, period] = minutesAndPeriod.split(' ');
    const hour = parseInt(hours, 10);

    if (isNaN(hour)) return time;

    const hour12 = hour % 12 || 12;
    return `${hour12.toString().padStart(2, '0')}:${minutes} ${
      period || (hour >= 12 ? 'PM' : 'AM')
    }`;
  }
}
