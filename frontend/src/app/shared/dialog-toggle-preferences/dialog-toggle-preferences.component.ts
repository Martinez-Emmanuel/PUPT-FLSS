import { Component, Inject, Injectable } from '@angular/core';
import { CommonModule, formatDate } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { of, Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';

import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSymbolDirective } from '../../core/imports/mat-symbol.directive';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule, DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE, NativeDateAdapter } from '@angular/material/core';

import { PreferencesService } from '../../core/services/faculty/preference/preferences.service';

export interface DialogTogglePreferencesData {
  type: 'all_preferences' | 'single_preferences';
  currentState: boolean;
  academicYear?: string;
  semester?: string;
  global_deadline?: Date | null;
  individual_deadline?: Date | null;
  global_start_date?: Date | null;
  individual_start_date?: Date | null;
  facultyName?: string;
  faculty_id?: number;
  hasIndividualDeadlines?: boolean;
  hasSecondaryText?: boolean;
}

@Injectable()
export class CustomDateAdapter extends NativeDateAdapter {
  override format(date: Date, displayFormat: Object): string {
    if (displayFormat === 'input') {
      const day = date.getDate();
      const month = date.toLocaleString('en-US', { month: 'long' });
      const year = date.getFullYear();
      return `${month} ${day}, ${year}`;
    }
    return date.toDateString();
  }
}

export const MY_DATE_FORMATS = {
  parse: {
    dateInput: 'MM/dd/yyyy',
  },
  display: {
    dateInput: 'input',
    monthYearLabel: 'MMMM yyyy',
    dateA11yLabel: 'MMMM d, yyyy',
    monthYearA11yLabel: 'MMMM yyyy',
  },
};

@Component({
  selector: 'app-dialog-toggle-preferences',
  imports: [
    MatDialogModule,
    MatButtonModule,
    MatCheckboxModule,
    MatProgressSpinnerModule,
    FormsModule,
    CommonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatFormFieldModule,
    MatInputModule,
    MatSymbolDirective,
  ],
  providers: [
    MatDatepickerModule,
    { provide: DateAdapter, useClass: CustomDateAdapter },
    { provide: MAT_DATE_LOCALE, useValue: 'en-US' },
    { provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMATS },
  ],
  templateUrl: './dialog-toggle-preferences.component.html',
  styleUrls: ['./dialog-toggle-preferences.component.scss'],
})
export class DialogTogglePreferencesComponent {
  private readonly SNACKBAR_DURATION = 5000;

  dialogTitle!: string;
  actionText!: string;
  facultyName: string = '';

  sendEmail = false;
  isProcessing = false;
  showEmailOption = false;
  isDeadlineToday = false;
  showDeadlinePicker = false;
  hasIndividualDeadlines = false;

  currentDate: Date = new Date();
  minDate: Date = new Date();
  submissionDeadline: Date | null = null;
  remainingDays: number = 0;

  startDate: Date | null = null;
  showStartDatePicker = false;
  isStartDateToday = false;
  remainingDaysStart: number = 0;

  isPreferencesScheduled = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: DialogTogglePreferencesData,
    private dialogRef: MatDialogRef<DialogTogglePreferencesComponent>,
    private snackBar: MatSnackBar,
    private preferencesService: PreferencesService
  ) {
    this.initializeDialogContent();

    if (this.data.type === 'all_preferences') {
      this.submissionDeadline = this.data.global_deadline || null;
      this.showDeadlinePicker = true;
      this.calculateRemainingDays();

      this.startDate = this.data.global_start_date || null;
      this.showStartDatePicker = true;
      this.calculateRemainingDaysStart();
    } else if (this.data.type === 'single_preferences') {
      this.submissionDeadline =
        this.data.individual_deadline || this.data.global_deadline || null;
      this.facultyName = this.data.facultyName || '';
      this.showDeadlinePicker = true;
      this.calculateRemainingDays();

      this.startDate =
        this.data.individual_start_date || this.data.global_start_date || null;
      this.showStartDatePicker = true;
      this.calculateRemainingDaysStart();
    }

    if (this.submissionDeadline) {
      this.calculateRemainingDays();
    }

    if (this.startDate) {
      this.calculateRemainingDaysStart();
    }

    this.hasIndividualDeadlines = this.data.hasIndividualDeadlines || false;

    this.isPreferencesScheduled =
      Boolean(this.data.global_start_date || this.data.individual_start_date) &&
      !this.data.currentState;
  }

  /**
   * Initializes dialog content based on the action type
   */
  private initializeDialogContent(): void {
    switch (this.data.type) {
      case 'all_preferences':
        this.dialogTitle = 'Faculty Preferences Submission';
        this.actionText = this.data.currentState ? 'Disable' : 'Enable';
        this.showEmailOption = !this.data.currentState;
        break;

      case 'single_preferences':
        this.dialogTitle = `Faculty Preferences Submission`;
        this.actionText = this.data.currentState ? 'Disable' : 'Enable';
        this.showEmailOption = !this.data.currentState;
        this.showDeadlinePicker = true;
        break;
    }
  }

  /**
   * Handles the confirmation action based on dialog type
   */
  confirmAction(): void {
    // Check if both startDate and submissionDeadline are filled out
    if (this.showStartDatePicker && !this.startDate) {
      this.snackBar.open('Please select a start date.', 'Close', {
        duration: this.SNACKBAR_DURATION,
      });
      return;
    }

    if (this.showDeadlinePicker && !this.submissionDeadline) {
      this.snackBar.open('Please select a submission deadline.', 'Close', {
        duration: this.SNACKBAR_DURATION,
      });
      return;
    }

    this.isProcessing = true;
    let operation$: Observable<any>;

    switch (this.data.type) {
      case 'all_preferences':
        operation$ = this.handleAllPreferencesOperation();
        break;
      case 'single_preferences':
        operation$ = this.handleSinglePreferenceOperation();
        break;
      default:
        operation$ = of(null);
    }

    operation$
      .pipe(
        finalize(() => {
          this.isProcessing = false;
        })
      )
      .subscribe({
        next: () => {
          const successMessage = this.getSuccessMessage();
          this.snackBar.open(successMessage, 'Close', {
            duration: this.SNACKBAR_DURATION,
          });
          this.dialogRef.close(true);
        },
        error: (error) => {
          console.error('Operation failed:', error);
          const errorMessage = this.getErrorMessage();
          this.snackBar.open(errorMessage, 'Close', {
            duration: this.SNACKBAR_DURATION,
          });
          this.dialogRef.close(false);
        },
      });
  }

  /**
   * Closes the dialog if not processing
   */
  closeDialog(): void {
    if (!this.isProcessing) {
      this.dialogRef.close(false);
    }
  }

  /**
   * Calculates remaining days between today and start date
   * and determines if the start date is today
   */
  public calculateRemainingDaysStart(): void {
    if (this.startDate) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const startDate = new Date(this.startDate);
      startDate.setHours(0, 0, 0, 0);

      const diffTime = startDate.getTime() - today.getTime();
      this.remainingDaysStart = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      this.isStartDateToday = this.remainingDaysStart <= 0;
    }
  }

  /**
   * Handles start date change
   */
  public onStartDateChange(event: any): void {
    this.startDate = event.value;
    this.calculateRemainingDaysStart();
    this.minDate = this.startDate!;

    if (this.submissionDeadline && this.startDate! > this.submissionDeadline!) {
      this.submissionDeadline = null;
      this.calculateRemainingDays();
    } else {
      this.calculateRemainingDays();
    }
  }

  /**
   * Calculates remaining days between start date and submission deadline
   * and determines if the deadline is today
   */
  public calculateRemainingDays(): void {
    if (this.submissionDeadline && this.startDate) {
      const startDate = new Date(this.startDate);
      startDate.setHours(0, 0, 0, 0);

      const deadline = new Date(this.submissionDeadline);
      deadline.setHours(0, 0, 0, 0);

      const diffTime = deadline.getTime() - startDate.getTime();
      this.remainingDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      this.isDeadlineToday = this.remainingDays === 0;
    }
  }

  /**
   * Handles deadline date change
   */
  public onDeadlineChange(event: any): void {
    this.submissionDeadline = event.value;
    this.calculateRemainingDays();
  }

  /**
   * Placeholder method for canceling scheduled submission
   */
  public cancelScheduledSubmission(): void {
    this.isProcessing = true;

    let operation$: Observable<any>;
    let successMessage = '';

    if (this.data.type === 'all_preferences') {
      operation$ = this.preferencesService.toggleAllPreferences(
        false,
        null,
        null,
        false
      );
      successMessage = 'Scheduled submission canceled successfully.';
    } else if (this.data.type === 'single_preferences') {
      operation$ = this.preferencesService.toggleSingleFacultyPreferences(
        this.data.faculty_id!,
        false,
        null,
        null,
        false
      );
      successMessage = `Scheduled submission for ${this.data.facultyName} canceled successfully.`;
    } else {
      operation$ = of(null);
    }

    operation$
      .pipe(
        finalize(() => {
          this.isProcessing = false;
        })
      )
      .subscribe({
        next: () => {
          this.snackBar.open(successMessage, 'Close', {
            duration: this.SNACKBAR_DURATION,
          });
          this.dialogRef.close(true);
        },
        error: (error) => {
          console.error('Operation failed:', error);
          const errorMessage = 'Failed to cancel scheduled submission.';
          this.snackBar.open(errorMessage, 'Close', {
            duration: this.SNACKBAR_DURATION,
          });
          this.dialogRef.close(false);
        },
      });
  }

  /**
   * Handles the confirmation action based on dialog type
   */
  private handleAllPreferencesOperation(): Observable<any> {
    const newStatus = !this.data.currentState;

    let formattedStartDate: string | null = null;
    if (newStatus && this.startDate) {
      const date = new Date(this.startDate);
      date.setHours(0, 0, 0, 0);
      formattedStartDate = formatDate(date, 'yyyy-MM-dd HH:mm:ss', 'en-US');
    }

    let formattedDeadline: string | null = null;
    if (newStatus && this.submissionDeadline) {
      const date = new Date(this.submissionDeadline);
      date.setHours(23, 59, 59, 999);
      formattedDeadline = formatDate(date, 'yyyy-MM-dd HH:mm:ss', 'en-US');
    }

    return this.preferencesService.toggleAllPreferences(
      newStatus,
      formattedDeadline,
      formattedStartDate,
      this.sendEmail
    );
  }

  private handleSinglePreferenceOperation(): Observable<any> {
    const newStatus = !this.data.currentState;

    let formattedStartDate: string | null = null;
    if (newStatus && this.startDate) {
      const date = new Date(this.startDate);
      date.setHours(0, 0, 0, 0);
      formattedStartDate = formatDate(date, 'yyyy-MM-dd HH:mm:ss', 'en-US');
    }

    let formattedDeadline: string | null = null;
    if (newStatus && this.submissionDeadline) {
      const date = new Date(this.submissionDeadline);
      date.setHours(23, 59, 59, 999);
      formattedDeadline = formatDate(date, 'yyyy-MM-dd HH:mm:ss', 'en-US');
    }

    return this.preferencesService.toggleSingleFacultyPreferences(
      this.data.faculty_id!,
      newStatus,
      formattedDeadline,
      formattedStartDate,
      this.sendEmail
    );
  }

  /**
   * Handles the Start Date Field Mat Hint Description
   */
  public getStartDateDescription(): string {
    if (!this.startDate) return 'in 0 days';

    if (this.isStartDateToday) {
      return 'today, immediately';
    }

    if (this.remainingDaysStart === 1) {
      return 'tomorrow';
    }

    return `in ${this.remainingDaysStart} days`;
  }

  /**
   * Handles the Deadline Field Mat Hint Description
   */
  public getDeadlineDescription(): string {
    if (!this.submissionDeadline) return '';

    if (this.isDeadlineToday) {
      return 'today at 11:59 PM';
    }

    if (this.remainingDays === 1) {
      return 'tomorrow at 11:59 PM';
    }

    return `in ${this.remainingDays} days`;
  }

  /**
   * Gets success message based on the action type
   */
  private getSuccessMessage(): string {
    switch (this.data.type) {
      case 'all_preferences':
        return `Preferences submission for all faculty ${
          !this.data.currentState ? 'updated' : 'disabled'
        } successfully.${this.sendEmail ? ' Email sent.' : ''}`;
      case 'single_preferences':
        return `Preferences submission for ${this.facultyName} ${
          !this.data.currentState ? 'updated' : 'disabled'
        } successfully.${this.sendEmail ? ' Email sent.' : ''}`;
      default:
        return 'Operation completed successfully.';
    }
  }

  /**
   * Gets error message based on the action type
   */
  private getErrorMessage(): string {
    switch (this.data.type) {
      case 'all_preferences':
        return `Failed to ${
          !this.data.currentState ? 'enable' : 'disable'
        } preferences for all faculty.`;
      case 'single_preferences':
        return `Failed to ${
          !this.data.currentState ? 'enable' : 'disable'
        } preferences for ${this.facultyName}.`;
      default:
        return 'Operation failed.';
    }
  }
}
