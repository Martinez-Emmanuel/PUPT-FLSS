import { Component, Inject, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, AbstractControl, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';

import { Observable, Subject, forkJoin, of } from 'rxjs';
import { map, startWith, takeUntil, debounceTime, distinctUntilChanged, switchMap, shareReplay, catchError } from 'rxjs/operators';

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

import { SchedulingService } from '../../core/services/admin/scheduling/scheduling.service';
import { Faculty, Room } from '../../core/models/scheduling.model';

import { cardEntranceSide, cardSwipeAnimation } from '../../core/animations/animations';

/**
 * Validator to ensure the control's value matches one of the valid options.
 * @param validOptions Array of valid string options.
 * @returns Validator function.
 */
function mustMatchOption(validOptions: string[]): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) return null;
    const isValid = validOptions.includes(control.value);
    return isValid ? null : { invalidOption: true };
  };
}

interface Preference {
  day: string;
  time: string;
}

interface SuggestedFaculty {
  faculty_id: number;
  name: string;
  type: string;
  preferences: Preference[];
  prefIndex: number;
  animating: boolean;
}
interface ProfessorOption {
  id: number;
  name: string;
}

interface DialogData {
  dayOptions: string[];
  timeOptions: string[];
  endTimeOptions: string[];
  selectedProgramInfo: string;
  selectedProgramId: number;
  selectedCourseInfo: string;
  suggestedFaculty: SuggestedFaculty[];
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
  course_id: number;
  preferences: any[];
}

@Component({
  selector: 'app-dialog-scheduling',
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
  animations: [cardEntranceSide, cardSwipeAnimation],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DialogSchedulingComponent implements OnInit, OnDestroy {
  /** Reactive form group for scheduling */
  scheduleForm!: FormGroup;

  /** Observable for filtered professors based on user input */
  filteredProfessors$!: Observable<ProfessorOption[]>;

  /** Observable for filtered rooms based on user input */
  filteredRooms$!: Observable<string[]>;

  /** Array of day buttons with names and short names */
  dayButtons: { name: string; shortName: string }[] = [];

  /** Currently selected day */
  selectedDay: string = '';

  /** Original day before any changes */
  originalDay: string = '';

  /** Currently selected faculty */
  selectedFaculty: SuggestedFaculty | null = null;

  // ---------------------------------------------------------------------------
  // Validation and Conflict Properties
  // ---------------------------------------------------------------------------

  /** Flag indicating if there are scheduling conflicts */
  hasConflicts = false;

  /** Message detailing any conflicts detected */
  conflictMessage: string = '';

  // ---------------------------------------------------------------------------
  // Loading and State Properties
  // ---------------------------------------------------------------------------

  /** Flag indicating if a loading operation is in progress */
  isLoading = false;

  /** Subject to manage unsubscription and prevent memory leaks */
  private destroy$ = new Subject<void>();

  // ---------------------------------------------------------------------------
  // Constructor and Lifecycle Hooks
  // ---------------------------------------------------------------------------

  /**
   * Constructor for DialogSchedulingComponent.
   * @param data Injected dialog data.
   * @param dialogRef Reference to the MatDialog.
   * @param fb FormBuilder instance.
   * @param schedulingService Service for scheduling operations.
   * @param snackBar Service for displaying snack bar messages.
   * @param cdr ChangeDetectorRef for manual change detection.
   */
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private dialogRef: MatDialogRef<DialogSchedulingComponent>,
    private fb: FormBuilder,
    private schedulingService: SchedulingService,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef
  ) {
    this.initForm();
  }

  ngOnInit(): void {
    this.initializeDayButtons();
    this.setupAutocomplete();
    this.handleStartTimeChanges();
    this.populateExistingSchedule();
    this.setupConflictDetection();
    this.setupCustomValidators();

    this.data.suggestedFaculty.forEach(
      (faculty) => (faculty.animating = false)
    );

    this.cdr.markForCheck();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ---------------------------------------------------------------------------
  // Form Initialization and Setup
  // ---------------------------------------------------------------------------

  /** Initializes the scheduling form with necessary controls. */
  private initForm(): void {
    this.scheduleForm = this.fb.group({
      day: [''],
      startTime: [''],
      endTime: [''],
      professor: [''],
      room: [''],
    });
  }

  /** Initializes day buttons with short names. */
  private initializeDayButtons(): void {
    const dayShortNames: { [key: string]: string } = {
      Monday: 'Mon',
      Tuesday: 'Tue',
      Wednesday: 'Wed',
      Thursday: 'Thu',
      Friday: 'Fri',
      Saturday: 'Sat',
      Sunday: 'Sun',
    };
    this.dayButtons = this.data.dayOptions.map((day) => ({
      name: day,
      shortName: dayShortNames[day] || day.substring(0, 3),
    }));
  }

  /** Populates the form with existing schedule data if available. */
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

    this.selectedDay = this.scheduleForm.get('day')!.value || '';
    this.originalDay = this.selectedDay;

    if (startTime && startTime !== 'Not set') {
      this.updateEndTimeOptions(startTime);
    }

    this.cdr.markForCheck();
  }

  // ---------------------------------------------------------------------------
  // Autocomplete and Filtering
  // ---------------------------------------------------------------------------

  /** Sets up autocomplete observables for professor and room inputs. */
  private setupAutocomplete(): void {
    const professorOptions: ProfessorOption[] = this.data.professorOptions.map(
      (name, index) => ({
        id: index,
        name: name,
      })
    );

    this.filteredProfessors$ = this.setupFilter('professor', professorOptions);
    this.filteredRooms$ = this.setupFilter('room', this.data.roomOptions);
  }

  /**
   * Sets up filtering logic for autocomplete inputs.
   * @param controlName Name of the form control.
   * @param options Array of string or ProfessorOption for filtering.
   * @returns Observable emitting filtered options.
   */
  private setupFilter(
    controlName: string,
    options: string[] | ProfessorOption[]
  ): Observable<any> {
    return this.scheduleForm.get(controlName)!.valueChanges.pipe(
      startWith(''),
      map((value) =>
        Array.isArray(options) && typeof options[0] === 'string'
          ? this.filterOptions(value, options as string[])
          : this.filterProfessorOptions(value, options as ProfessorOption[])
      ),
      shareReplay(1)
    );
  }

  /**
   * Filters professor options based on user input.
   * @param value User input value.
   * @param options Array of ProfessorOption.
   * @returns Filtered array of ProfessorOption.
   */
  private filterProfessorOptions(
    value: string | null,
    options: ProfessorOption[]
  ): ProfessorOption[] {
    const filterValue = (value || '').toLowerCase();
    return options.filter((option) =>
      option.name.toLowerCase().includes(filterValue)
    );
  }

  /**
   * Filters string options based on user input.
   * @param value User input value.
   * @param options Array of string options.
   * @returns Filtered array of strings.
   */
  private filterOptions(value: string | null, options: string[]): string[] {
    const filterValue = (value || '').toLowerCase();
    return options.filter((option) =>
      option.toLowerCase().includes(filterValue)
    );
  }

  // ---------------------------------------------------------------------------
  // Time and Day Handling
  // ---------------------------------------------------------------------------

  /** Handles changes in the start time to update end time options. */
  private handleStartTimeChanges(): void {
    this.scheduleForm
      .get('startTime')!
      .valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe((startTime) => this.updateEndTimeOptions(startTime));
  }

  /**
   * Updates end time options based on selected start time.
   * @param startTime Selected start time.
   */
  private updateEndTimeOptions(startTime: string): void {
    if (!startTime) {
      this.data.endTimeOptions = [];
      this.scheduleForm.patchValue({ endTime: '' });
      return;
    }

    const startIndex = this.data.timeOptions.indexOf(startTime);
    if (startIndex === -1) {
      this.data.endTimeOptions = [];
      this.scheduleForm.patchValue({ endTime: '' });
      return;
    }

    this.data.endTimeOptions = this.data.timeOptions.slice(startIndex + 1);
    const currentEndTime = this.scheduleForm.get('endTime')!.value;
    if (!this.data.endTimeOptions.includes(currentEndTime)) {
      this.scheduleForm.patchValue({ endTime: '' });
    }

    this.cdr.markForCheck();
  }

  /**
   * Selects a day from the day buttons.
   * @param dayName Name of the day to select.
   */
  public selectDay(dayName: string): void {
    this.selectedDay = dayName;
    this.scheduleForm.patchValue({ day: dayName });

    this.cdr.markForCheck();
  }

  // ---------------------------------------------------------------------------
  // Validation and Conflict Detection
  // ---------------------------------------------------------------------------

  /** Sets up custom validators for the form controls. */
  private setupCustomValidators(): void {
    this.scheduleForm.get('startTime')?.setValidators([Validators.required]);
    this.scheduleForm.get('endTime')?.setValidators([Validators.required]);
    this.scheduleForm
      .get('professor')
      ?.setValidators([mustMatchOption(this.data.professorOptions)]);
    this.scheduleForm
      .get('room')
      ?.setValidators([mustMatchOption(this.data.roomOptions)]);

    this.scheduleForm.get('professor')?.updateValueAndValidity();
    this.scheduleForm.get('room')?.updateValueAndValidity();
    this.scheduleForm.get('startTime')?.updateValueAndValidity();
    this.scheduleForm.get('endTime')?.updateValueAndValidity();
  }

  /** Sets up conflict detection by subscribing to form value changes. */
  private setupConflictDetection(): void {
    this.scheduleForm.valueChanges
      .pipe(
        debounceTime(150),
        distinctUntilChanged(
          (prev, curr) => JSON.stringify(prev) === JSON.stringify(curr)
        ),
        switchMap(() => this.detectConflicts()),
        takeUntil(this.destroy$)
      )
      .subscribe();
  }

  /**
   * Detects scheduling conflicts based on form values.
   * @returns Observable<void>
   */
  private detectConflicts(): Observable<void> {
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
      this.conflictMessage = '';
      this.hasConflicts = false;
      this.cdr.markForCheck();
      return of();
    }

    return forkJoin(
      validationObservables.map((vo) =>
        vo.observable.pipe(map((result) => ({ type: vo.type, ...result })))
      )
    ).pipe(
      map((results) => {
        results.forEach((result) => {
          if (!result.isValid) {
            conflictMessages.push({
              type: result.type,
              message: result.message,
            });
          }
        });

        if (conflictMessages.length > 0) {
          const conflictPriorities: { [key: string]: number } = {
            program: 1,
            faculty: 2,
            room: 3,
          };

          conflictMessages.sort(
            (a, b) => conflictPriorities[a.type] - conflictPriorities[b.type]
          );

          const highestPriorityConflict = conflictMessages[0];
          this.conflictMessage = highestPriorityConflict.message;
          this.hasConflicts = true;
        } else {
          this.conflictMessage = '';
          this.hasConflicts = false;
        }

        this.cdr.markForCheck();
      }),
      catchError((error) => {
        this.conflictMessage =
          'An error occurred during validation. Please try again.';
        this.hasConflicts = true;
        this.cdr.markForCheck();
        return of();
      })
    );
  }

  // ---------------------------------------------------------------------------
  // Schedule Assignment and Error Handling
  // ---------------------------------------------------------------------------

  /** Assigns the schedule after performing validations. */
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

    if (this.scheduleForm.invalid) {
      this.scheduleForm.markAllAsTouched();
      this.snackBar.open(
        'Both Start Time and End Time are required.',
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

    const selectedFaculty = this.data.facultyOptions.find(
      (f) => f.name === professor
    );
    const selectedRoom = this.data.roomOptionsList.find(
      (r) => r.room_code === room
    );

    this.isLoading = true;
    this.cdr.markForCheck();

    this.schedulingService
      .assignSchedule(
        this.data.schedule_id,
        selectedFaculty?.faculty_id ?? null,
        selectedRoom?.room_id ?? null,
        day ?? null,
        formattedStartTime ?? null,
        formattedEndTime ?? null,
        this.data.selectedProgramId,
        this.data.year_level,
        this.data.section_id
      )
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.isLoading = false;
          this.originalDay = this.selectedDay;
          this.dialogRef.close(true);
        },
        error: (error) => {
          this.isLoading = false;
          this.handleAssignmentError(error);
        },
      });
  }

  /**
   * Handles errors that occur during schedule assignment.
   * @param error Error object.
   */
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
    this.cdr.markForCheck();
  }

  // ---------------------------------------------------------------------------
  // Faculty Preference Handling
  // ---------------------------------------------------------------------------

  /**
   * Handles click events on a faculty card to select preferences.
   * @param faculty Selected faculty.
   * @param preference Selected preference.
   */
  public onFacultyClick(
    faculty: SuggestedFaculty,
    preference: Preference
  ): void {
    this.selectedFaculty = faculty;

    const day = preference.day;
    const time = preference.time;
    const [startTime, endTime] = time.split(' - ').map((t) => t.trim());

    this.scheduleForm.patchValue({
      day: day,
      startTime: startTime,
      endTime: endTime,
      professor: faculty.name,
    });

    this.selectedDay = day;
    this.originalDay = day;
    this.scheduleForm.markAllAsTouched();

    this.cdr.markForCheck();
  }

  /**
   * Navigates to the next preference for a faculty.
   * @param faculty Faculty whose preference is to be navigated.
   */
  public nextPreference(faculty: SuggestedFaculty): void {
    if (faculty.animating) return;

    faculty.animating = true;
    faculty.prefIndex = (faculty.prefIndex + 1) % faculty.preferences.length;

    setTimeout(() => {
      faculty.animating = false;
      this.cdr.markForCheck();
    }, 600);
  }

  /**
   * Navigates to the previous preference for a faculty.
   * @param faculty Faculty whose preference is to be navigated.
   */
  public previousPreference(faculty: SuggestedFaculty): void {
    if (faculty.animating) return;

    faculty.animating = true;
    faculty.prefIndex =
      (faculty.prefIndex - 1 + faculty.preferences.length) %
      faculty.preferences.length;

    setTimeout(() => {
      faculty.animating = false;
      this.cdr.markForCheck();
    }, 600);
  }

  /**
   * Determines if a given preference is currently selected.
   * @param preference Preference to check.
   * @returns True if selected, false otherwise.
   */
  public isPreferenceSelected(preference: Preference): boolean {
    return (
      this.scheduleForm.get('day')?.value === preference.day &&
      `${this.scheduleForm.get('startTime')?.value} - ${
        this.scheduleForm.get('endTime')?.value
      }` === preference.time
    );
  }

  // ---------------------------------------------------------------------------
  // Form Actions and Utility Methods
  // ---------------------------------------------------------------------------

  /** Clears all form fields and resets state. */
  public onClearAll(): void {
    this.scheduleForm.reset();
    this.data.endTimeOptions = [...this.data.timeOptions];
    this.selectedDay = '';
    this.originalDay = '';
    this.selectedFaculty = null;

    this.cdr.markForCheck();
  }

  /** Cancels the dialog and reverts any changes. */
  public onCancel(): void {
    this.scheduleForm.patchValue({ day: this.originalDay });
    this.selectedDay = this.originalDay;
    this.dialogRef.close();
  }

  /**
   * Formats time string to backend format.
   * @param time Time string in 'HH:MM AM/PM' format.
   * @returns Time string in 'HH:MM:SS' 24-hour format or null.
   */
  private formatTimeToBackend(time: string | null): string | null {
    if (!time) {
      return null;
    }

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

  /**
   * Formats time string for display purposes.
   * @param time Time string in 'HH:MM:SS' format.
   * @returns Formatted time string in 'HH:MM AM/PM' format.
   */
  public formatTimeForDisplay(time: string): string {
    if (!time) return '';
    const [hours, minutes, seconds] = time.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  }
}
