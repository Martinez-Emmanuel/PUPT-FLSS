import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Angular Material Imports
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { MatSymbolDirective } from '../../core/imports/mat-symbol.directive';

@Component({
  selector: 'app-dialog-time',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatSelectModule,
    MatOptionModule,
    MatButtonModule,
    MatIconModule,
    MatSymbolDirective
  ],
  templateUrl: './dialog-time.component.html',
  styleUrls: ['./dialog-time.component.scss'],
})
export class DialogTimeComponent {
  // Updated class name
  startTime: string = '';
  endTime: string = '';
  timeOptions: string[] = [];
  endTimeOptions: string[] = [];

  constructor(
    public dialogRef: MatDialogRef<DialogTimeComponent>,
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
