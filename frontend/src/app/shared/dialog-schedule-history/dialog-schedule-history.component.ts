import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatSymbolDirective } from '../../core/imports/mat-symbol.directive';

import { FacultyScheduleTimetableComponent } from '../faculty-schedule-timetable/faculty-schedule-timetable.component';

@Component({
  selector: 'app-dialog-schedule-history',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    MatSymbolDirective,
    FormsModule,
    FacultyScheduleTimetableComponent,
  ],
  templateUrl: './dialog-schedule-history.component.html',
  styleUrls: ['./dialog-schedule-history.component.scss']
})
export class DialogScheduleHistoryComponent {
  selectedYear: string = '';
  selectedSemester: string = '';
  
  academicYears = [
    '2023-2024',
    '2022-2023',
    '2021-2022'
  ];

  semesters = [
    { value: '1', viewValue: '1st Semester' },
    { value: '2', viewValue: '2nd Semester' },
    { value: '3', viewValue: 'Summer Term' }
  ];

  constructor(private dialogRef: MatDialogRef<DialogScheduleHistoryComponent>) {}

  closeDialog(): void {
    this.dialogRef.close();
  }
}