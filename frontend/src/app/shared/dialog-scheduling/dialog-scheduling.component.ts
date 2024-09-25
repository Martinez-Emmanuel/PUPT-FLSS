import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms'; // <-- Import ReactiveFormsModule
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDialogRef } from '@angular/material/dialog';
import { MatDialogModule } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input'; // Import for matInput usage
import { MatButtonModule } from '@angular/material/button'; // Import for mat-button and mat-raised-button
import { MatSymbolDirective } from '../../core/imports/mat-symbol.directive';
@Component({
  selector: 'app-dialog-scheduling',
  standalone: true,
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatDialogModule,
    MatIconModule,
    MatInputModule, // Include MatInputModule for input fields
    MatButtonModule, // Include MatButtonModule for buttons
    ReactiveFormsModule, // <-- Add this to the imports array
    MatSymbolDirective,
  ],
  templateUrl: './dialog-scheduling.component.html',
  styleUrls: ['./dialog-scheduling.component.scss'],
})
export class DialogSchedulingComponent {
  scheduleForm: FormGroup;
  suggestedFaculty = [
    { name: 'Mr. Steven Villarosa', time: '07:30 AM - 12:30 PM' },
    { name: 'Ms. Lady Modesto', time: '07:30 AM - 12:30 PM' },
  ];
  selectedCourse = 'BSIT-TG | COMP101 - Intro to Programming';

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<DialogSchedulingComponent>
  ) {
    this.scheduleForm = this.fb.group({
      day: [''],
      startTime: [''],
      endTime: [''],
      professor: [''],
      room: [''],
    });
  }

  onCancel() {
    this.dialogRef.close();
  }

  onAssign() {
    // Handle form submission logic here
    console.log(this.scheduleForm.value);
    this.dialogRef.close();
  }
}
