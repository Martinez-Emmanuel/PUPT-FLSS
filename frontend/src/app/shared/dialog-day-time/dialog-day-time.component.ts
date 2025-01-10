import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatRippleModule } from '@angular/material/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { PreferencesService } from '../../core/services/faculty/preference/preferences.service';
import { showHideFieldsAnimation } from '../../core/animations/animations';

interface DayButton {
  name: string;
  shortName: string;
  selected: boolean;
  startTime: string;
  endTime: string;
  endTimeOptions: string[];
}

interface DialogData {
  selectedDays: Array<{ day: string; start_time: string; end_time: string }>;
  courseCode: string;
  courseTitle: string;
  facultyId: string;
  activeSemesterId: number;
  courseAssignmentId: number;
  allSelectedCourses: any[];
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
    MatRippleModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './dialog-day-time.component.html',
  styleUrls: ['./dialog-day-time.component.scss'],
  animations: [showHideFieldsAnimation],
})
export class DialogDayTimeComponent implements OnInit {
  courseCode = '';
  courseTitle = '';
  timeOptions: string[] = [];
  dayButtons: DayButton[] = [];
  isSaving = false;

  private readonly daysOfWeek = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday',
  ];

  constructor(
    public dialogRef: MatDialogRef<DialogDayTimeComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private preferencesService: PreferencesService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.initializeDialog();
  }

  // ===========================
  // Initialization Methods
  // ===========================

  private initializeDialog(): void {
    this.courseCode = this.data.courseCode || '';
    this.courseTitle = this.data.courseTitle || '';
    this.timeOptions = this.generateTimeOptions();
    this.dayButtons = this.createDayButtons();

    if (this.data.selectedDays && this.data.selectedDays.length > 0) {
      this.setSelectedDays(this.data.selectedDays);
    }
  }

  private createDayButtons(): DayButton[] {
    return this.daysOfWeek.map((day) => ({
      name: day,
      shortName: day.substring(0, 3),
      selected: false,
      startTime: '',
      endTime: '',
      endTimeOptions: [...this.timeOptions],
    }));
  }

  private generateTimeOptions(): string[] {
    const options = [];
    for (let hour = 7; hour <= 21; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        if (hour === 21 && minute === 30) break;
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const hour12 = hour % 12 || 12;
        options.push(
          `${hour12.toString().padStart(2, '0')}:${minute
            .toString()
            .padStart(2, '0')} ${ampm}`
        );
      }
    }
    return options;
  }

  // ===========================
  // Data Manipulation Methods
  // ===========================

  private setSelectedDays(
    selectedDays: Array<{ day: string; start_time: string; end_time: string }>
  ): void {
    if (!selectedDays) return;
    selectedDays.forEach((selectedDay) => {
      const dayButton = this.dayButtons.find((d) => d.name === selectedDay.day);
      if (dayButton) {
        if (selectedDay.start_time && selectedDay.end_time) {
          dayButton.selected = true;
          dayButton.startTime = this.convertTo12HourFormat(
            selectedDay.start_time
          );
          dayButton.endTime = this.convertTo12HourFormat(selectedDay.end_time);
          this.updateEndTimeOptions(dayButton);
        } else {
          dayButton.selected = false;
          dayButton.startTime = '';
          dayButton.endTime = '';
        }
      }
    });
  }

  private convertTo12HourFormat(time24: string): string {
    if (!time24 || time24.includes('AM') || time24.includes('PM'))
      return time24;

    const [hours, minutes] = time24.split(':').map(Number);
    const hour12 = hours % 12 || 12;
    const ampm = hours < 12 || hours === 24 ? 'AM' : 'PM';
    return `${hour12.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')} ${ampm}`;
  }

  private updateEndTimeOptions(day: DayButton): void {
    const startIndex = this.timeOptions.indexOf(day.startTime);
    day.endTimeOptions =
      startIndex !== -1
        ? this.timeOptions.slice(startIndex + 1)
        : [...this.timeOptions];
  }

  // ===========================
  // Event Handlers
  // ===========================

  toggleDay(day: DayButton): void {
    day.selected = !day.selected;
    if (!day.selected) {
      day.startTime = '';
      day.endTime = '';
    }
  }

  onStartTimeChange(day: DayButton): void {
    this.updateEndTimeOptions(day);
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onConfirm(): void {
    this.isSaving = true;
    const selectedDays = this.dayButtons
      .filter((day) => day.selected && day.startTime && day.endTime)
      .map((day) => ({
        day: day.name,
        start_time: String(this.convertTo24HourFormat(day.startTime)),
        end_time: String(this.convertTo24HourFormat(day.endTime)),
      }));

    const preferenceData = {
      faculty_id: parseInt(this.data.facultyId),
      active_semester_id: this.data.activeSemesterId,
      course_assignment_id: this.data.courseAssignmentId,
      preferred_days: selectedDays,
    };

    this.preferencesService.submitSinglePreference(preferenceData).subscribe({
      next: () => {
        this.snackBar.open(
          'Your preferences has been saved successfully.',
          'Close',
          {
            duration: 3000,
          }
        );
        this.isSaving = false;
        this.dialogRef.close({ days: selectedDays });
      },
      error: (error) => {
        const message =
          error.status === 403 && error.error && error.error.message
            ? error.error.message
            : 'Error submitting preference.';
        this.snackBar.open(message, 'Close', {
          duration: 5000,
        });
        this.isSaving = false;
      },
    });
  }

  convertTo24HourFormat(time12: string): string {
    const [time, modifier] = time12.split(' ');
    let [hours, minutes] = time.split(':').map(Number);

    if (hours === 12) {
      hours = 0;
    }

    if (modifier === 'PM') {
      hours += 12;
    }

    // Format time to HH:mm:ss with leading zeros
    const formattedHours = hours.toString().padStart(2, '0');
    const formattedMinutes = minutes.toString().padStart(2, '0');
    const formattedSeconds = '00';

    return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
  }

  // ===========================
  // Utility Methods (Updated)
  // ===========================

  isAnyDaySelected(): boolean {
    const anyDaySelected = this.dayButtons.some((day) => day.selected);
    if (!anyDaySelected) {
      return false;
    }
    return this.dayButtons
      .filter((day) => day.selected)
      .every((day) => day.startTime !== '' && day.endTime !== '');
  }
}
