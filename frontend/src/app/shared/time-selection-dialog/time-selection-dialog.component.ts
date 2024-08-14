import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MaterialComponents } from '../../core/imports/material.component';
import { MatSymbolDirective } from '../../core/imports/mat-symbol.directive';

@Component({
  selector: 'app-time-selection-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, MaterialComponents,MatSymbolDirective],
  templateUrl: './time-selection-dialog.component.html',
  styleUrls: ['./time-selection-dialog.component.scss'],
})
export class TimeSelectionDialogComponent {
  startTime: string = '';
  endTime: string = '';
  timeOptions: string[] = [];
  endTimeOptions: string[] = [];

  constructor(
    public dialogRef: MatDialogRef<TimeSelectionDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    dialogRef.disableClose = true;
    this.generateTimeOptions();
    if (this.data.startTime && this.data.endTime) {
      this.startTime = this.data.startTime;
      this.endTime = this.data.endTime;
      this.onStartTimeChange();
    }
  }

  generateTimeOptions() {
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
    if (this.startTime && this.endTime) {
      this.dialogRef.close(`${this.startTime} - ${this.endTime}`);
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
}
