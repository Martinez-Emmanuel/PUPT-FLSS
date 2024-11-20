import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRippleModule } from '@angular/material/core';

interface DayButton {
  name: string;
  shortName: string;
  selected: boolean;
}

@Component({
    selector: 'app-dialog-time',
    imports: [
        CommonModule,
        FormsModule,
        MatDialogModule,
        MatFormFieldModule,
        MatSelectModule,
        MatOptionModule,
        MatButtonModule,
        MatIconModule,
        MatCheckboxModule,
        MatRippleModule,
    ],
    templateUrl: './dialog-day-time.component.html',
    styleUrls: ['./dialog-day-time.component.scss']
})
export class DialogDayTimeComponent {
  selectedDay: string = '';
  originalDay: string = '';
  startTime: string = '';
  endTime: string = '';
  courseCode: string = '';
  courseTitle: string = '';
  isWholeDay: boolean = false;
  timeOptions: string[] = [];
  endTimeOptions: string[] = [];

  dayButtons: DayButton[] = [
    { name: 'Monday', shortName: 'Mon', selected: false },
    { name: 'Tuesday', shortName: 'Tue', selected: false },
    { name: 'Wednesday', shortName: 'Wed', selected: false },
    { name: 'Thursday', shortName: 'Thu', selected: false },
    { name: 'Friday', shortName: 'Fri', selected: false },
    { name: 'Saturday', shortName: 'Sat', selected: false },
    { name: 'Sunday', shortName: 'Sun', selected: false },
  ];

  constructor(
    public dialogRef: MatDialogRef<DialogDayTimeComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    dialogRef.disableClose = true;
    this.generateTimeOptions();

    if (data.selectedDay) {
      this.originalDay = data.selectedDay;
      this.selectedDay = data.selectedDay;
    }

    if (data.selectedTime) {
      if (data.selectedTime === '07:00 AM - 09:00 PM') {
        this.isWholeDay = true;
        this.startTime = '07:00 AM';
        this.endTime = '09:00 PM';
      } else {
        const [start, end] = data.selectedTime.split(' - ');
        this.startTime = start.trim();
        this.endTime = end.trim();
      }
    }

    if (data.courseCode) {
      this.courseCode = data.courseCode;
    }

    if (data.courseTitle) {
      this.courseTitle = data.courseTitle;
    }
  }

  selectDay(day: string): void {
    this.selectedDay = day;
  }

  generateTimeOptions() {
    this.timeOptions = [];
    for (let hour = 7; hour <= 21; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        if (hour === 21 && minute === 30) break;
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const hour12 = hour % 12 || 12;
        const time = `${hour12.toString().padStart(2, '0')}:${minute
          .toString()
          .padStart(2, '0')} ${ampm}`;
        this.timeOptions.push(time);
      }
    }
    this.endTimeOptions = [...this.timeOptions];
  }

  onStartTimeChange() {
    const startIndex = this.timeOptions.indexOf(this.startTime);
    if (startIndex !== -1) {
      this.endTimeOptions = this.timeOptions.slice(startIndex + 1);
      if (!this.isEndTimeValid()) {
        this.endTime = '';
      }
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onConfirm(): void {
    if (this.isWholeDay) {
      this.dialogRef.close({
        day: this.selectedDay,
        time: '07:00 AM - 09:00 PM',
      });
    } else if (this.selectedDay && this.startTime && this.endTime) {
      this.dialogRef.close({
        day: this.selectedDay,
        time: `${this.startTime} - ${this.endTime}`,
      });
    }
  }

  isEndTimeValid(): boolean {
    if (!this.startTime || !this.endTime) {
      return false;
    }
    const startIndex = this.timeOptions.indexOf(this.startTime);
    const endIndex = this.timeOptions.indexOf(this.endTime);
    return startIndex !== -1 && endIndex !== -1 && endIndex > startIndex;
  }

  onWholeDayChange(): void {
    if (this.isWholeDay) {
      this.startTime = '07:00 AM';
      this.endTime = '09:00 PM';
    } else {
      this.startTime = '';
      this.endTime = '';
    }
  }
}
