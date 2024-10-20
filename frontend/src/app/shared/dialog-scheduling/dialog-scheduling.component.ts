import { Component, Inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';

import { Observable, Subject, forkJoin, of } from 'rxjs';
import { map, startWith, takeUntil, debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';

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
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { SchedulingService, Faculty, Room } from '../../core/services/admin/scheduling/scheduling.service';

import { cardEntranceSide } from '../../core/animations/animations';

interface DialogData {
  dayOptions: string[];
  timeOptions: string[];
  endTimeOptions: string[];
  selectedProgramInfo: string;
  selectedProgramId: number;
  selectedCourseInfo: string;
  suggestedFaculty: { name: string; type: string; day: string; time: string }[];
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
  year_level: number;
  section_id: number;
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
    MatProgressSpinnerModule,
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
  isLoading = false;
  conflictMessage: string = '';

  private destroy$ = new Subject<void>();

  selectedFaculty: {
    name: string;
    type: string;
    day: string;
    time: string;
  } | null = null;

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
    this.setupConflictDetection();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setupConflictDetection(): void {
    this.scheduleForm.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(
          (prev, curr) => JSON.stringify(prev) === JSON.stringify(curr)
        ),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.detectConflicts();
      });
  }

  private conflictPriorities: { [key: string]: number } = {
    program: 1,
    faculty: 2,
    room: 3,
  };

  private detectConflicts(): void {
    const formValues = this.scheduleForm.value;
    const { day, startTime, endTime, professor, room } = formValues;

    const selectedFaculty = this.data.facultyOptions.find(
      (f) => f.name === professor
    );
    const selectedRoom = this.data.roomOptionsList.find(
      (r) => r.room_code === room
    );

    const faculty_id = selectedFaculty ? selectedFaculty.faculty_id : null;
    const room_id = selectedRoom ? selectedRoom.room_id : null;
    const program_id = this.data.selectedProgramId;
    const year_level = this.data.year_level;

    const validationObservables: {
      type: string;
      observable: Observable<{ isValid: boolean; message: string }>;
    }[] = [];
    const conflictMessages: { type: string; message: string }[] = [];

    const formattedStartTime = this.formatTimeToBackend(startTime);
    const formattedEndTime = this.formatTimeToBackend(endTime);

    // Check for program conflicts
    if (day && startTime && endTime && program_id && year_level) {
      validationObservables.push({
        type: 'program',
        observable: this.schedulingService.validateProgramOverlap(
          this.data.schedule_id,
          program_id,
          year_level,
          day,
          formattedStartTime,
          formattedEndTime
        ),
      });
    }

    // Check for faculty conflicts
    if (day && startTime && endTime && faculty_id) {
      validationObservables.push({
        type: 'faculty',
        observable: this.schedulingService.validateFacultyAvailability(
          this.data.schedule_id,
          faculty_id,
          day,
          formattedStartTime,
          formattedEndTime,
          program_id,
          year_level,
          this.data.section_id
        ),
      });
    }

    // Check for room conflicts
    if (day && startTime && endTime && room_id) {
      validationObservables.push({
        type: 'room',
        observable: this.schedulingService.validateRoomAvailability(
          this.data.schedule_id,
          room_id,
          day,
          formattedStartTime,
          formattedEndTime,
          program_id,
          year_level,
          this.data.section_id
        ),
      });
    }

    if (validationObservables.length === 0) {
      // Not enough fields to perform any conflict check
      this.conflictMessage = '';
      this.hasConflicts = false;
      return;
    }

    // Execute all validations in parallel
    forkJoin(
      validationObservables.map((vo) =>
        vo.observable.pipe(map((result) => ({ type: vo.type, ...result })))
      )
    )
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (results) => {
          results.forEach((result) => {
            if (!result.isValid) {
              conflictMessages.push({
                type: result.type,
                message: result.message,
              });
            }
          });

          if (conflictMessages.length > 0) {
            // Sort conflict messages based on priority
            conflictMessages.sort(
              (a, b) =>
                this.conflictPriorities[a.type] -
                this.conflictPriorities[b.type]
            );

            // Pick the highest priority conflict message
            const highestPriorityConflict = conflictMessages[0];
            this.conflictMessage = highestPriorityConflict.message;
            this.hasConflicts = true;
          } else {
            this.conflictMessage = '';
            this.hasConflicts = false;
          }
        },
        error: (error) => {
          this.conflictMessage =
            'An error occurred during validation. Please try again.';
          this.hasConflicts = true;
        },
      });
  }

  /*** Form Setup ***/
  private initForm(): void {
    this.scheduleForm = this.fb.group({
      day: [''],
      startTime: [''],
      endTime: [''],
      professor: [''],
      room: [''],
    });
  }

  private populateExistingSchedule(): void {
    if (!this.data.existingSchedule) return;

    const { day, time, professor, room } = this.data.existingSchedule;
    const [startTime, endTime] = time.split(' - ').map((time) => time.trim());

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
    if (this.hasConflicts) {
      this.snackBar.open(
        'There is a scheduling conflict. Please resolve it before proceeding.',
        'Close',
        {
          duration: 3000,
        }
      );
      return;
    }

    const formValues = this.scheduleForm.value;
    const { day, startTime, endTime, professor, room } = formValues;

    const formattedStartTime = this.formatTimeToBackend(startTime);
    const formattedEndTime = this.formatTimeToBackend(endTime);

    // Debug log
    console.log('Formatted times:', {
      formattedStartTime,
      formattedEndTime,
    });

    const selectedFaculty = this.data.facultyOptions.find(
      (f) => f.name === professor
    );
    const selectedRoom = this.data.roomOptionsList.find(
      (r) => r.room_code === room
    );

    if (!selectedFaculty || !selectedRoom) {
      this.snackBar.open('Please select a valid faculty and room.', 'Close', {
        duration: 3000,
      });
      return;
    }

    // Proceed with assigning schedule after conflict check
    this.isLoading = true;
    this.schedulingService
      .assignSchedule(
        this.data.schedule_id,
        selectedFaculty.faculty_id,
        selectedRoom.room_id,
        day,
        formattedStartTime,
        formattedEndTime,
        this.data.selectedProgramId,
        this.data.year_level,
        this.data.section_id
      )
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.isLoading = false;
          this.dialogRef.close(true);
        },
        error: (error) => {
          this.isLoading = false;
          this.handleAssignmentError(error);
        },
      });
  }

  private handleAssignmentError(error: any): void {
    console.error('Failed to assign schedule:', error);

    let errorMessage = 'Failed to assign schedule.';

    if (error?.message) {
      errorMessage = error.message;
    }

    this.conflictMessage = errorMessage;
    this.hasConflicts = true;

    this.snackBar.open(errorMessage, 'Close', {
      duration: 5000,
    });
  }

  public onFacultyClick(faculty: {
    name: string;
    type: string;
    day: string;
    time: string;
  }): void {
    this.selectedFaculty = faculty;

    const day = faculty.day;

    const [startTime, endTime] = faculty.time
      .split(' - ')
      .map((time) => time.trim());

    this.scheduleForm.patchValue({
      day: day,
      startTime: startTime,
      endTime: endTime,
      professor: faculty.name,
    });

    this.scheduleForm.markAllAsTouched();
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

  private filterOptions(value: string | null, options: string[]): string[] {
    const filterValue = (value || '').toLowerCase();
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

  public isFacultySelected(faculty: {
    name: string;
    type: string;
    day: string;
    time: string;
  }): boolean {
    return this.selectedFaculty === faculty;
  }
}
