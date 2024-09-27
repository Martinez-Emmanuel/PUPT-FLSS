import { Component, Inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';

import { Observable, Subject } from 'rxjs';
import { map, startWith, takeUntil } from 'rxjs/operators';

import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatRippleModule } from '@angular/material/core';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatSymbolDirective } from '../../core/imports/mat-symbol.directive';

import { SchedulingService, Faculty, Room } from '../../core/services/admin/scheduling/scheduling.service';

import { cardEntranceSide } from '../../core/animations/animations';

interface DialogData {
  dayOptions: string[];
  timeOptions: string[];
  endTimeOptions: string[];
  selectedProgramInfo: string;
  selectedCourseInfo: string;
  suggestedFaculty: { name: string; day: string; time: string }[];
  professorOptions: string[];
  roomOptions: string[];
  facultyOptions: Faculty[];
  roomOptionsList: Room[];
  existingSchedule?: {
    day: string;
    time: string;
    professor: string;
    room: string;
  };
  schedule_id: number;
}

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
    MatRippleModule,
    MatSnackBarModule,
    MatSymbolDirective,
  ],
  templateUrl: './dialog-scheduling.component.html',
  styleUrls: ['./dialog-scheduling.component.scss'],
  animations: [cardEntranceSide],
})
export class DialogSchedulingComponent implements OnInit, OnDestroy {
  scheduleForm!: FormGroup;
  filteredProfessors$!: Observable<string[]>;
  filteredRooms$!: Observable<string[]>;
  hasConflicts = false;

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<DialogSchedulingComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private schedulingService: SchedulingService,
    private snackBar: MatSnackBar
  ) {
    this.initForm();
  }

  ngOnInit(): void {
    this.setupAutocomplete();
    this.handleStartTimeChanges();
    this.populateExistingSchedule();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /*** Form Setup ***/

  private initForm(): void {
    this.scheduleForm = this.fb.group({
      day: ['', Validators.required],
      startTime: ['', Validators.required],
      endTime: ['', Validators.required],
      professor: ['', Validators.required],
      room: ['', Validators.required],
    });
  }

  private populateExistingSchedule(): void {
    if (!this.data.existingSchedule) return;

    const { day, time, professor, room } = this.data.existingSchedule;
    const [startTime, endTime] = time.split(' - ');

    this.scheduleForm.patchValue({
      day: day !== 'Not set' ? day : '',
      startTime: startTime !== 'Not set' ? startTime : '',
      endTime: endTime !== 'Not set' ? endTime : '',
      professor: professor !== 'Not set' ? professor : '',
      room: room !== 'Not set' ? room : '',
    });

    if (startTime && startTime !== 'Not set') {
      this.updateEndTimeOptions(startTime);
    }
  }

  /*** Form Actions ***/

  public onCancel(): void {
    this.dialogRef.close();
  }

  public onClearAll(): void {
    this.scheduleForm.reset();
    this.data.endTimeOptions = [...this.data.timeOptions];
  }

  public onAssign(): void {
    if (this.scheduleForm.valid) {
      const formValues = this.scheduleForm.value;
      const { day, startTime, endTime, professor, room } = formValues;
  
      const selectedFaculty = this.data.facultyOptions.find(
        (f) => f.name === professor
      );
      if (!selectedFaculty) {
        this.snackBar.open('Selected professor does not exist.', 'Close', {
          duration: 3000,
        });
        return;
      }
  
      const selectedRoom = this.data.roomOptionsList.find(
        (r) => r.room_code === room
      );
      if (!selectedRoom) {
        this.snackBar.open('Selected room does not exist.', 'Close', {
          duration: 3000,
        });
        return;
      }
  
      const faculty_id = selectedFaculty.faculty_id;
      const room_id = selectedRoom.room_id;
  
      const formattedStartTime = this.formatTimeToBackend(startTime);
      const formattedEndTime = this.formatTimeToBackend(endTime);
  
      this.schedulingService
        .assignSchedule(
          this.data.schedule_id,
          faculty_id,
          room_id,
          day,
          formattedStartTime,
          formattedEndTime
        )
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            // Remove the snackbar here
            this.dialogRef.close(true); // Indicate success
          },
          error: (error) => {
            this.handleError('Failed to assign schedule')(error);
          },
        });
    } else {
      this.scheduleForm.markAllAsTouched();
    }
  }  

  /*** Autocomplete and Filtering ***/

  private setupAutocomplete(): void {
    this.filteredProfessors$ = this.setupFilter(
      'professor',
      this.data.professorOptions
    );
    this.filteredRooms$ = this.setupFilter('room', this.data.roomOptions);
  }

  private setupFilter(
    controlName: string,
    options: string[]
  ): Observable<string[]> {
    return this.scheduleForm.get(controlName)!.valueChanges.pipe(
      startWith(''),
      map((value) => this.filterOptions(value, options))
    );
  }

  private filterOptions(value: string, options: string[]): string[] {
    const filterValue = value.toLowerCase();
    return options.filter((option) =>
      option.toLowerCase().includes(filterValue)
    );
  }

  /*** Time Selection Handling ***/

  private handleStartTimeChanges(): void {
    this.scheduleForm
      .get('startTime')!
      .valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe((startTime) => this.updateEndTimeOptions(startTime));
  }

  private updateEndTimeOptions(startTime: string): void {
    if (!startTime) {
      this.data.endTimeOptions = [];
      return;
    }

    const startIndex = this.data.timeOptions.indexOf(startTime);
    if (startIndex === -1) {
      this.data.endTimeOptions = [];
      return;
    }

    this.data.endTimeOptions = this.data.timeOptions.slice(startIndex + 1);
    const currentEndTime = this.scheduleForm.get('endTime')!.value;
    if (!this.data.endTimeOptions.includes(currentEndTime)) {
      this.scheduleForm.patchValue({ endTime: '' });
    }
  }

  /*** Utility Methods ***/

  private formatTimeToBackend(time: string): string {
    const [timePart, period] = time.split(' ');
    let [hours, minutes] = timePart.split(':').map(Number);
    if (period === 'PM' && hours !== 12) {
      hours += 12;
    }
    if (period === 'AM' && hours === 12) {
      hours = 0;
    }
    const formattedHours = hours.toString().padStart(2, '0');
    const formattedMinutes = minutes.toString().padStart(2, '0');
    return `${formattedHours}:${formattedMinutes}:00`;
  }

  private handleError(message: string) {
    return (error: any): void => {
      console.error(`${message}:`, error);
      this.snackBar.open(`${message}. Please try again.`, 'Close', {
        duration: 3000,
      });
    };
  }
}
