import { Component, Inject, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

import { Observable, Subject, of } from 'rxjs';
import { map, takeUntil, debounceTime, distinctUntilChanged, switchMap, shareReplay, catchError, tap, filter, startWith } from 'rxjs/operators';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatRippleModule } from '@angular/material/core';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSymbolDirective } from '../../core/imports/mat-symbol.directive';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { SchedulingService } from '../../core/services/admin/scheduling/scheduling.service';
import { ScheduleValidationService } from '../../core/services/admin/scheduling/schedule-validation.service';
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
    return validOptions.includes(control.value)
      ? null
      : { invalidOption: true };
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
  program: {
    id: number;
    info: string;
  };
  academic: {
    year_level: number;
    section_id: number;
  };
  options: {
    dayOptions: string[];
    timeOptions: string[];
    endTimeOptions: string[];
    professorOptions: string[];
    roomOptions: string[];
  };
  facultyOptions: Faculty[];
  roomOptionsList: Room[];
  selectedProgramInfo: string;
  selectedCourseInfo: string;
  suggestedFaculty: SuggestedFaculty[];
  existingSchedule?: {
    day: string;
    time: string;
    professor: string;
    room: string;
  };
  schedule_id: number;
  course_id: number;
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
  scheduleForm: FormGroup;

  filteredProfessors$!: Observable<ProfessorOption[]>;
  filteredRooms$!: Observable<string[]>;

  dayButtons: { name: string; shortName: string }[] = [];
  selectedDay: string = '';
  originalDay: string = '';

  selectedFaculty: SuggestedFaculty | null = null;

  hasConflicts = false;
  conflictMessage: string = '';

  isLoading = false;

  private destroy$ = new Subject<void>();

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private dialogRef: MatDialogRef<DialogSchedulingComponent>,
    private fb: FormBuilder,
    private schedulingService: SchedulingService,
    private scheduleValidationService: ScheduleValidationService,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef
  ) {
    this.scheduleForm = this.fb.group({
      day: [''],
      startTime: [''],
      endTime: [''],
      professor: [''],
      room: [''],
    });
  }

  ngOnInit(): void {
    this.setupDayButtons();
    this.setupCustomValidators();
    this.populateExistingSchedule();
    this.data.suggestedFaculty.forEach(
      (faculty) => (faculty.animating = false)
    );

    queueMicrotask(() => {
      requestAnimationFrame(() => {
        this.setupAutocomplete();
        this.subscribeToStartTimeChanges();
        this.setupConflictDetection();
        this.cdr.markForCheck();
      });
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setupDayButtons(): void {
    const dayShortNames: Record<string, string> = {
      Monday: 'Mon',
      Tuesday: 'Tue',
      Wednesday: 'Wed',
      Thursday: 'Thu',
      Friday: 'Fri',
      Saturday: 'Sat',
      Sunday: 'Sun',
    };
    this.dayButtons = this.data.options.dayOptions.map((day) => ({
      name: day,
      shortName: dayShortNames[day] || day.substring(0, 3),
    }));
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

    this.selectedDay = this.scheduleForm.get('day')?.value || '';
    this.originalDay = this.selectedDay;

    if (startTime && startTime !== 'Not set') {
      this.updateEndTimeOptions(startTime);
    }
    this.cdr.markForCheck();
  }

  private setupAutocomplete(): void {
    const professorOptions: ProfessorOption[] =
      this.data.options.professorOptions.map((name, index) => ({
        id: index,
        name: name,
      }));

    this.filteredProfessors$ = this.scheduleForm
      .get('professor')!
      .valueChanges.pipe(
        startWith(''),
        map((value) => this.filterProfessorOptions(value, professorOptions)),
        shareReplay(1)
      );

    this.filteredRooms$ = this.scheduleForm.get('room')!.valueChanges.pipe(
      startWith(''),
      map((value) =>
        this.filterRoomOptions(value, this.data.options.roomOptions)
      ),
      shareReplay(1)
    );
  }

  private filterProfessorOptions(
    value: string | null,
    options: ProfessorOption[]
  ): ProfessorOption[] {
    const filterValue = (value || '').toLowerCase();
    return options.filter((option) =>
      option.name.toLowerCase().includes(filterValue)
    );
  }

  private filterRoomOptions(value: string | null, options: string[]): string[] {
    const filterValue = (value || '').toLowerCase();
    return options.filter((option) =>
      option.toLowerCase().includes(filterValue)
    );
  }

  private subscribeToStartTimeChanges(): void {
    this.scheduleForm
      .get('startTime')!
      .valueChanges.pipe(
        filter((startTime) => !!startTime),
        takeUntil(this.destroy$)
      )
      .subscribe((startTime) => this.updateEndTimeOptions(startTime));
  }

  private updateEndTimeOptions(startTime: string): void {
    const startIndex = this.data.options.timeOptions.indexOf(startTime);
    if (startIndex === -1) {
      this.scheduleForm.patchValue({ endTime: '' });
      this.data.options.endTimeOptions = [];
      return;
    }

    this.data.options.endTimeOptions = this.data.options.timeOptions.slice(
      startIndex + 1
    );
    const currentEndTime = this.scheduleForm.get('endTime')?.value;
    if (!this.data.options.endTimeOptions.includes(currentEndTime)) {
      this.scheduleForm.patchValue({ endTime: '' });
    }
    this.cdr.markForCheck();
  }

  public selectDay(dayName: string): void {
    this.selectedDay = dayName;
    this.scheduleForm.patchValue({ day: dayName });
    this.cdr.markForCheck();
  }

  private setupCustomValidators(): void {
    this.scheduleForm
      .get('professor')
      ?.setValidators(mustMatchOption(this.data.options.professorOptions));
    this.scheduleForm
      .get('room')
      ?.setValidators(mustMatchOption(this.data.options.roomOptions));
    this.scheduleForm.get('professor')?.updateValueAndValidity();
    this.scheduleForm.get('room')?.updateValueAndValidity();
  }

  private setupConflictDetection(): void {
    this.scheduleForm.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(
          (prev, curr) => JSON.stringify(prev) === JSON.stringify(curr)
        ),
        switchMap(() => this.initiateConflictValidation()),
        takeUntil(this.destroy$)
      )
      .subscribe();
  }

  private initiateConflictValidation(): Observable<void> {
    const formValues = this.scheduleForm.value;
    const { day, startTime, endTime, professor, room } = formValues;
    const formattedStartTime = this.convertTimeToBackendFormat(startTime);
    const formattedEndTime = this.convertTimeToBackendFormat(endTime);

    const selectedFaculty = this.data.facultyOptions.find(
      (f) => f.name === professor
    );
    const selectedRoom = this.data.roomOptionsList.find(
      (r) => r.room_code === room
    );

    const facultyId = selectedFaculty?.faculty_id || null;
    const roomId = selectedRoom?.room_id || null;

    // Call the centralized conflict detection method
    return this.schedulingService
      .checkForScheduleConflicts(
        this.data.schedule_id,
        this.data.program.id,
        this.data.academic.year_level,
        day,
        formattedStartTime || '',
        formattedEndTime || '',
        this.data.academic.section_id,
        facultyId,
        roomId
      )
      .pipe(
        tap((conflictResult) => {
          this.hasConflicts = conflictResult.hasConflicts;
          this.conflictMessage = this.hasConflicts
            ? conflictResult.messages[0]
            : '';
          this.cdr.markForCheck();
        }),
        catchError((error) => {
          this.conflictMessage =
            'An error occurred during validation. Please try again.';
          this.hasConflicts = true;
          this.cdr.markForCheck();
          return of(undefined);
        }),
        map(() => undefined)
      );
  }

  public assignValidatedSchedule(): void {
    if (this.hasConflicts) {
      this.snackBar.open(
        'There is a scheduling conflict. Please resolve it before proceeding.',
        'Close',
        { duration: 3000 }
      );
      return;
    }

    const formValues = this.scheduleForm.value;
    const formattedStartTime = this.convertTimeToBackendFormat(
      formValues.startTime
    );
    const formattedEndTime = this.convertTimeToBackendFormat(
      formValues.endTime
    );
    const selectedFaculty = this.data.facultyOptions.find(
      (f) => f.name === formValues.professor
    );
    const selectedRoom = this.data.roomOptionsList.find(
      (r) => r.room_code === formValues.room
    );

    this.isLoading = true;
    this.cdr.markForCheck();

    this.schedulingService
      .assignSchedule(
        this.data.schedule_id,
        selectedFaculty?.faculty_id ?? null,
        selectedRoom?.room_id ?? null,
        formValues.day ?? null,
        formattedStartTime,
        formattedEndTime,
        this.data.program.id,
        this.data.academic.year_level,
        this.data.academic.section_id
      )
      .pipe(
        tap(() => {
          this.isLoading = false;
          this.originalDay = this.selectedDay;
          this.dialogRef.close(true);
        }),
        catchError((error) => {
          this.isLoading = false;
          this.handleAssignmentError(error);
          return of(null);
        }),
        takeUntil(this.destroy$)
      )
      .subscribe();
  }

  private handleAssignmentError(error: any): void {
    this.conflictMessage = error?.message || 'Failed to assign schedule.';
    this.hasConflicts = true;
    this.snackBar.open(this.conflictMessage, 'Close', { duration: 5000 });
    this.cdr.markForCheck();
  }

  public populateFormWithFacultyPreference(
    faculty: SuggestedFaculty,
    preference: Preference
  ): void {
    this.selectedFaculty = faculty;
    const [startTime, endTime] = preference.time
      .split(' - ')
      .map((t) => t.trim());

    this.scheduleForm.patchValue({
      day: preference.day,
      startTime,
      endTime,
      professor: faculty.name,
    });

    this.selectedDay = preference.day;
    this.scheduleForm.markAllAsTouched();
    this.cdr.markForCheck();
  }

  public showNextFacultyPreference(faculty: SuggestedFaculty): void {
    if (faculty.animating) return;

    requestAnimationFrame(() => {
      faculty.animating = true;
      faculty.prefIndex = (faculty.prefIndex + 1) % faculty.preferences.length;

      setTimeout(() => {
        faculty.animating = false;
        this.cdr.detectChanges();
      }, 500);
    });
  }

  public showPreviousFacultyPreference(faculty: SuggestedFaculty): void {
    if (faculty.animating) return;

    requestAnimationFrame(() => {
      faculty.animating = true;
      faculty.prefIndex =
        (faculty.prefIndex - 1 + faculty.preferences.length) %
        faculty.preferences.length;

      setTimeout(() => {
        faculty.animating = false;
        this.cdr.detectChanges();
      }, 500);
    });
  }

  public doesPreferenceMatchForm(preference: Preference): boolean {
    const formValues = this.scheduleForm.value;
    return (
      formValues.day === preference.day &&
      `${formValues.startTime} - ${formValues.endTime}` === preference.time
    );
  }

  public resetForm(): void {
    this.scheduleForm.reset();
    this.data.options.endTimeOptions = [...this.data.options.timeOptions];
    this.selectedDay = '';
    this.originalDay = '';
    this.selectedFaculty = null;
    this.cdr.markForCheck();
  }

  public cancelDialog(): void {
    this.scheduleForm.patchValue({ day: this.originalDay });
    this.selectedDay = this.originalDay;
    this.dialogRef.close();
  }

  private convertTimeToBackendFormat(time: string | null): string | null {
    if (!time) return null;
    const [timePart, period] = time.split(' ');
    let [hours, minutes] = timePart.split(':').map(Number);
    if (period === 'PM' && hours !== 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;
    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:00`;
  }

  public formatTimeForDisplay(time: string): string {
    return this.scheduleValidationService.formatTimeForDisplay(time);
  }

  public getFacultyTypeClass(facultyType: string): Record<string, boolean> {
    const type = facultyType.toLowerCase();
    return {
      'full-time': type.includes('full-time'),
      designee: type.includes('designee'),
      'part-time': type.includes('part-time'),
      temporary: type.includes('temporary'),
    };
  }
}
