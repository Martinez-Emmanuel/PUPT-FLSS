import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';

import { Observable, of } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatAutocompleteModule } from '@angular/material/autocomplete';

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
    MatAutocompleteModule,
    MatSymbolDirective,
  ],
  templateUrl: './dialog-scheduling.component.html',
  styleUrls: ['./dialog-scheduling.component.scss'],
})
export class DialogSchedulingComponent implements OnInit {
  scheduleForm: FormGroup;
  dayOptions: string[];
  timeOptions: string[];
  endTimeOptions: string[];
  selectedProgramInfo: string;
  selectedCourseInfo: string;
  suggestedFaculty: { name: string; day: string; time: string }[];
  hasConflicts: boolean = false;

  filteredProfessors: Observable<string[]>;
  filteredRooms: Observable<string[]>;

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

    this.filteredProfessors = of([]);
    this.filteredRooms = of([]);
  }

  ngOnInit() {
    this.filteredProfessors = this.scheduleForm
      .get('professor')!
      .valueChanges.pipe(
        startWith(''),
        map((value) => this._filter(value || '', this.data.professorOptions))
      );

    this.filteredRooms = this.scheduleForm.get('room')!.valueChanges.pipe(
      startWith(''),
      map((value) => this._filter(value || '', this.data.roomOptions))
    );
  }

  private _filter(value: string, options: string[]): string[] {
    const filterValue = value.toLowerCase();
    return options.filter((option) =>
      option.toLowerCase().includes(filterValue)
    );
  }

  onCancel() {
    this.dialogRef.close();
  }

  onAssign() {
    if (this.scheduleForm.valid) {
      this.dialogRef.close(this.scheduleForm.value);
    } else {
      this.scheduleForm.markAllAsTouched();
    }
  }

  onClearAll() {
    this.scheduleForm.reset();
  }
}
