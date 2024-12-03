import { Component, Inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule, formatDate } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { forkJoin, of, Observable } from 'rxjs';
import { switchMap, finalize, tap } from 'rxjs/operators';

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

import { ReportGenerationService } from '../../core/services/admin/report-generation/report-generation.service';
import { PreferencesService } from '../../core/services/faculty/preference/preferences.service';
import { ReportsService } from '../../core/services/admin/reports/reports.service';

export interface DialogActionData {
  type:
    | 'all_preferences'
    | 'single_preferences'
    | 'all_publish'
    | 'single_publish'
    | 'reports';
  currentState: boolean;
  academicYear?: string;
  semester?: string;
  hasSecondaryText?: boolean;
  global_deadline?: Date | null;
  individual_deadline?: Date | null;
  global_start_date?: Date | null;
  individual_start_date?: Date | null;
  facultyName?: string;
  faculty_id?: number;
  hasIndividualDeadlines?: boolean;
}

export const MY_DATE_FORMATS = {
  parse: {
    dateInput: 'MM/DD/YYYY',
  },
  display: {
    dateInput: 'MM/DD/YYYY',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

@Component({
  selector: 'app-dialog-action',
  imports: [
    RouterLink,
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
    { provide: DateAdapter, useClass: NativeDateAdapter },
    { provide: MAT_DATE_LOCALE, useValue: 'en-US' },
    { provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMATS },
  ],
  templateUrl: './dialog-action.component.html',
  styleUrls: ['./dialog-action.component.scss'],
})
export class DialogActionComponent {
  private readonly SNACKBAR_DURATION = 5000;

  dialogTitle!: string;
  actionText!: string;
  navigationLink!: string;
  linkText!: string;
  facultyName: string = '';

  sendEmail = false;
  isProcessing = false;
  showEmailOption = false;
  isDeadlineToday = false;
  showReportOptions = false;
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

  reportOptions = {
    faculty: false,
    programs: false,
    rooms: false,
  };

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: DialogActionData,
    private dialogRef: MatDialogRef<DialogActionComponent>,
    private snackBar: MatSnackBar,
    private preferencesService: PreferencesService,
    private reportsService: ReportsService,
    private reportGenerationService: ReportGenerationService
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
        this.navigationLink = '/admin/faculty-preferences';
        this.linkText = 'Faculty Preferences';
        this.showEmailOption = !this.data.currentState;
        this.showReportOptions = false;
        break;

      case 'all_publish':
        this.dialogTitle = 'Faculty Load & Schedule';
        this.actionText = this.data.currentState ? 'Unpublish' : 'Publish';
        this.navigationLink = '/admin/reports/faculty';
        this.linkText = 'Faculty Official Reports';
        this.showEmailOption = !this.data.currentState;
        this.showReportOptions = false;
        break;

      case 'single_publish':
        this.dialogTitle = `Faculty Load & Schedule`;
        this.actionText = this.data.currentState ? 'Unpublish' : 'Publish';
        this.navigationLink = '/admin/reports/faculty';
        this.linkText = 'Faculty Official Reports';
        this.showEmailOption = !this.data.currentState;
        this.showReportOptions = false;
        break;

      case 'reports':
        this.dialogTitle = 'Generate Schedule Reports';
        this.actionText = '';
        this.navigationLink = '/admin/reports';
        this.linkText = 'Official Reports';
        this.showEmailOption = false;
        this.showReportOptions = true;
        break;

      case 'single_preferences':
        this.dialogTitle = `Faculty Preferences Submission`;
        this.actionText = this.data.currentState ? 'Disable' : 'Enable';
        this.navigationLink = '/admin/faculty-preferences';
        this.linkText = 'Faculty Preferences';
        this.showEmailOption = !this.data.currentState;
        this.showReportOptions = false;
        this.showDeadlinePicker = true;
        break;
    }
  }

  /**
   * Handles the confirmation action based on dialog type
   */
  confirmAction(): void {
    if (this.data.type === 'reports') {
      this.handleReportsGeneration();
      return;
    }

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
      case 'all_publish':
        operation$ = this.handleAllPublishOperation();
        break;
      case 'single_publish':
        operation$ = this.handleSinglePublishOperation();
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

      this.isStartDateToday =
        this.remainingDaysStart <= 0 && this.remainingDaysStart >= -1;
    }
  }

  /**
   * Returns formatted start date text based on whether start date is today
   */
  public getStartDateText(isCurrentStartDate: boolean = false): string {
    if (!this.startDate) return '';

    if (this.isStartDateToday) {
      if (isCurrentStartDate) {
        return 'Today';
      } else {
        return 'today, immediately';
      }
    }

    if (isCurrentStartDate) {
      return `${formatDate(this.startDate, 'longDate', 'en-US')} (${
        this.remainingDaysStart
      } days left)`;
    } else {
      return `${this.remainingDaysStart} day(s)`;
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
   * Calculates remaining days between today and submission deadline
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
   * Returns formatted deadline text based on whether deadline is today
   */
  public getDeadlineText(isCurrentDeadline: boolean = false): string {
    if (!this.submissionDeadline) return '';

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const deadline = new Date(this.submissionDeadline);
    deadline.setHours(0, 0, 0, 0);

    const isActuallyToday = today.getTime() === deadline.getTime();

    if (isActuallyToday) {
      if (isCurrentDeadline) {
        return 'Today at 11:59 PM';
      } else {
        return 'today at 11:59 PM';
      }
    }

    if (isCurrentDeadline) {
      return `${formatDate(this.submissionDeadline, 'longDate', 'en-US')} (${
        this.remainingDays
      } day(s) left)`;
    } else {
      // return `${this.remainingDays} day(s)`;
      return `at 11:59 PM on this day`;
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
   * Returns the formatted scheduled start date
   */
  public getScheduledStartDate(): string {
    const startDate =
      this.data.individual_start_date || this.data.global_start_date;
    return startDate ? formatDate(startDate, 'medium', 'en-US') : '';
  }

  /**
   * Returns the formatted scheduled deadline date
   */
  public getScheduledDeadlineDate(): string {
    const deadline = this.data.individual_deadline || this.data.global_deadline;
    return deadline ? formatDate(deadline, 'medium', 'en-US') : '';
  }

  /**
   * Placeholder method for canceling scheduled submission
   * This will be implemented later as per your requirement
   */
  public cancelScheduledSubmission(): void {
    this.isProcessing = true;

    let operation$: Observable<any>;

    if (this.data.type === 'all_preferences') {
      operation$ = this.preferencesService.toggleAllPreferences(
        false,
        null,
        null
      );
    } else if (this.data.type === 'single_preferences') {
      operation$ = this.preferencesService.toggleSingleFacultyPreferences(
        this.data.faculty_id!,
        false,
        null,
        null
      );
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
          const successMessage = 'Scheduled submission canceled successfully.';
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
   * Handles the single preference toggle operation
   */
  private handleSinglePreferenceOperation(): Observable<any> {
    const newStatus = !this.data.currentState;

    let formattedStartDate: string | null = null;
    if (newStatus && this.startDate) {
      const date = new Date(this.startDate);
      date.setHours(0, 0, 0, 0);
      formattedStartDate = formatDate(date, 'yyyy-MM-dd HH:mm:ss', 'en-US');
    }

    let formattedDate: string | null = null;
    if (newStatus && this.submissionDeadline) {
      const date = new Date(this.submissionDeadline);
      date.setHours(23, 59, 59, 999);
      formattedDate = formatDate(date, 'yyyy-MM-dd HH:mm:ss', 'en-US');
    }

    return this.preferencesService
      .toggleSingleFacultyPreferences(
        this.data.faculty_id!,
        newStatus,
        formattedDate,
        formattedStartDate
      )
      .pipe(
        switchMap(() => {
          if (this.sendEmail) {
            return this.preferencesService
              .sendPreferencesEmailToFaculty(this.data.faculty_id!)
              .pipe(
                tap(() => {
                  this.snackBar.open(
                    `Email sent to ${this.data.facultyName}`,
                    'Close',
                    { duration: this.SNACKBAR_DURATION }
                  );
                })
              );
          }
          return of(null);
        })
      );
  }

  /**
   * Handles preferences toggle operation with proper date handling
   */
  private handleAllPreferencesOperation(): Observable<any> {
    const newStatus = !this.data.currentState;

    let formattedStartDate: string | null = null;
    if (newStatus && this.startDate) {
      const date = new Date(this.startDate);
      date.setHours(0, 0, 0, 0);
      formattedStartDate = formatDate(date, 'yyyy-MM-dd HH:mm:ss', 'en-US');
    }

    let formattedDate: string | null = null;
    if (newStatus && this.submissionDeadline) {
      const date = new Date(this.submissionDeadline);
      date.setHours(23, 59, 59, 999);
      formattedDate = formatDate(date, 'yyyy-MM-dd HH:mm:ss', 'en-US');
    }

    const togglePreferences$ = this.preferencesService.toggleAllPreferences(
      newStatus,
      formattedDate,
      formattedStartDate
    );

    const emailNotification$ =
      this.sendEmail && newStatus
        ? this.preferencesService.sendPreferencesEmailToAll()
        : of(null);

    return forkJoin([togglePreferences$, emailNotification$]);
  }

  /**
   * Handles publish/unpublish operation using ReportsService
   */
  private handleAllPublishOperation(): Observable<any> {
    const newStatus = !this.data.currentState;
    const isPublished = newStatus ? 1 : 0;
    return this.reportsService.togglePublishAllSchedules(isPublished).pipe(
      switchMap(() => {
        if (this.sendEmail && isPublished === 1) {
          return this.reportsService.sendAllSchedulesEmail();
        }
        return of(null);
      })
    );
  }

  /**
   * Handles publish/unpublish operation for a single faculty using ReportsService
   */
  private handleSinglePublishOperation(): Observable<any> {
    const newStatus = !this.data.currentState;
    const isPublished = newStatus ? 1 : 0;
    const facultyId = this.data.faculty_id!;

    let publish$ = this.reportsService.togglePublishSingleSchedule(
      facultyId,
      isPublished
    );

    if (this.sendEmail && isPublished === 1) {
      publish$ = publish$.pipe(
        switchMap(() =>
          this.reportsService.sendSingleFacultyScheduleEmail(facultyId)
        )
      );
    }

    return publish$;
  }

  /**
   * Handles report generation
   */
  private handleReportsGeneration(): void {
    if (!this.isReportSelectionValid()) {
      this.snackBar.open(
        'Please select at least one report to generate.',
        'Close',
        { duration: this.SNACKBAR_DURATION }
      );
      return;
    }

    this.isProcessing = true;

    const selections = {
      faculty: this.reportOptions.faculty,
      programs: this.reportOptions.programs,
      rooms: this.reportOptions.rooms,
    };

    this.reportGenerationService
      .generateSelectedReports(selections)
      .pipe(
        finalize(() => {
          this.isProcessing = false;
        })
      )
      .subscribe({
        next: (reports) => {
          if (reports.length === 0) {
            this.snackBar.open('No reports selected.', 'Close', {
              duration: this.SNACKBAR_DURATION,
            });
            return;
          }

          reports.forEach((report) => {
            const fileNameMap: { [key: string]: string } = {
              faculty: 'Faculty_Schedule_Report.pdf',
              programs: 'Programs_Schedule_Report.pdf',
              rooms: 'Rooms_Schedule_Report.pdf',
            };

            const fileName =
              fileNameMap[report.type as keyof typeof fileNameMap] ||
              'Schedule_Report.pdf';

            const blobUrl = URL.createObjectURL(report.blob);
            const a = document.createElement('a');
            a.href = blobUrl;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(blobUrl);
          });

          this.snackBar.open(
            'Selected reports have been generated and downloaded successfully.',
            'Close',
            { duration: this.SNACKBAR_DURATION }
          );

          this.dialogRef.close(true);
        },
        error: (error) => {
          console.error('Error generating reports:', error);
          this.snackBar.open(
            'Failed to generate reports. Please try again later.',
            'Close',
            { duration: this.SNACKBAR_DURATION }
          );
          this.dialogRef.close(false);
        },
      });
  }

  /**
   * Checks if at least one report option is selected
   */
  public isReportSelectionValid(): boolean {
    return Object.values(this.reportOptions).some((value) => value);
  }

  /**
   * Gets the appropriate success message based on the action type
   */
  private getSuccessMessage(): string {
    switch (this.data.type) {
      case 'reports':
        return 'Reports generated successfully.';
      case 'all_preferences':
        return `Preferences submission for all faculty ${
          !this.data.currentState ? 'updated' : 'disabled'
        } successfully.${this.sendEmail ? ' Email sent.' : ''}`;
      case 'all_publish':
        return `Schedules for all faculty ${
          !this.data.currentState ? 'published' : 'unpublished'
        } successfully.${this.sendEmail ? ' Email sent.' : ''}`;
      case 'single_publish':
        return `Schedule for ${this.data.facultyName} ${
          !this.data.currentState ? 'published' : 'unpublished'
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
   * Gets the appropriate error message based on the action type
   */
  private getErrorMessage(): string {
    switch (this.data.type) {
      case 'reports':
        return 'Failed to generate reports.';
      case 'all_preferences':
        return `Failed to ${
          !this.data.currentState ? 'enable' : 'disable'
        } preferences for all faculty.`;
      case 'all_publish':
        return `Failed to ${
          !this.data.currentState ? 'publish' : 'unpublish'
        } schedules for all faculty.`;
      case 'single_publish':
        return `Failed to ${
          !this.data.currentState ? 'publish' : 'unpublish'
        } schedule for ${this.data.facultyName}.`;
      case 'single_preferences':
        return `Failed to ${
          !this.data.currentState ? 'enable' : 'disable'
        } preferences for ${this.facultyName}.`;
      default:
        return 'Operation failed.';
    }
  }
}
