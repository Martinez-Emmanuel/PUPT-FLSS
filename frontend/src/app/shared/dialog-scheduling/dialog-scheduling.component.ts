import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';

import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';

import { MatSymbolDirective } from '../../core/imports/mat-symbol.directive';

@Component({
  selector: 'app-dialog-scheduling',
  standalone: true,
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatDialogModule,
    MatIconModule,
    MatInputModule,
    MatButtonModule,
    ReactiveFormsModule,
    MatSelectModule,
    MatSymbolDirective,
  ],
  templateUrl: './dialog-scheduling.component.html',
  styleUrls: ['./dialog-scheduling.component.scss'],
})
export class DialogSchedulingComponent {
  scheduleForm: FormGroup;
  dayOptions: string[];
  timeOptions: string[];
  endTimeOptions: string[];
  selectedProgramInfo: string;
  selectedCourseInfo: string;
  suggestedFaculty: { name: string; time: string }[];

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<DialogSchedulingComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.dayOptions = data.dayOptions;
    this.timeOptions = data.timeOptions;
    this.endTimeOptions = data.endTimeOptions || [];
    this.selectedProgramInfo = data.selectedProgramInfo;
    this.selectedCourseInfo = data.selectedCourseInfo;
    this.suggestedFaculty = data.suggestedFaculty;

    this.scheduleForm = this.fb.group({
      day: ['', Validators.required],
      startTime: ['', Validators.required],
      endTime: ['', Validators.required],
      professor: ['', Validators.required],
      room: ['', Validators.required],
    });
  }

  onCancel() {
    this.dialogRef.close();
  }

  onAssign() {
    if (this.scheduleForm.valid) {
      console.log(this.scheduleForm.value);
      this.dialogRef.close(this.scheduleForm.value);
    } else {
      this.scheduleForm.markAllAsTouched();
    }
  }
}
