import { Component, Inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule, formatDate } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { of, Observable } from 'rxjs';
import { switchMap, finalize } from 'rxjs/operators';

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
import { OverviewService } from '../../core/services/admin/overview/overview.service';

export interface DialogActionData {
  type: 'preferences' | 'publish' | 'reports';
  currentState: boolean;
  academicYear: string;
  semester: string;
  hasSecondaryText?: boolean;
  global_deadline?: Date | null;
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
  standalone: true,
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
  dialogTitle!: string;
  actionText!: string;
  navigationLink!: string;
  linkText!: string;
  sendEmail = false;
  isProcessing = false;
  showEmailOption = false;

  submissionDeadline: Date | null = null;
  remainingDays: number = 0;
  minDate: Date = new Date();

  showReportOptions = false;
  reportOptions = {
    faculty: false,
    programs: false,
    rooms: false,
  };

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: DialogActionData,
    private dialogRef: MatDialogRef<DialogActionComponent>,
    private snackBar: MatSnackBar,
    private overviewService: OverviewService,
    private preferencesService: PreferencesService,
    private reportGenerationService: ReportGenerationService
  ) {
    this.initializeDialogContent();
    this.submissionDeadline = this.data.global_deadline || null;
    if (this.submissionDeadline) {
      this.calculateRemainingDays();
    }
  }

  /**
   * Initializes dialog content based on the action type
   */
  private initializeDialogContent(): void {
    switch (this.data.type) {
      case 'preferences':
        this.dialogTitle = 'Faculty Preferences Submission';
        this.actionText = this.data.currentState ? 'Disable' : 'Enable';
        this.navigationLink = '/admin/faculty-preferences';
        this.linkText = 'Faculty Preferences';
        this.showEmailOption = !this.data.currentState;
        this.showReportOptions = false;
        break;

      case 'publish':
        this.dialogTitle = 'Faculty Load and Schedule';
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

    this.isProcessing = true;
    let operation$: Observable<any>;

    switch (this.data.type) {
      case 'preferences':
        operation$ = this.handlePreferencesOperation();
        break;
      case 'publish':
        operation$ = this.handlePublishOperation();
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
          this.snackBar.open(successMessage, 'Close', { duration: 3000 });
          this.dialogRef.close(true);
        },
        error: (error) => {
          console.error('Operation failed:', error);
          const errorMessage = this.getErrorMessage();
          this.snackBar.open(errorMessage, 'Close', { duration: 3000 });
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
   * Calculates remaining days between today and submission deadline
   */
  public calculateRemainingDays(): void {
    if (this.submissionDeadline) {
      const today = new Date();
      const deadline = new Date(this.submissionDeadline);
      const diffTime = deadline.getTime() - today.getTime();
      this.remainingDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
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
   * Handles preferences toggle operation with proper date handling
   */
  private handlePreferencesOperation(): Observable<any> {
    const newStatus = !this.data.currentState;

    let formattedDate: string | null = null;
    if (this.submissionDeadline) {
      const date = new Date(this.submissionDeadline);
      date.setHours(23, 59, 59, 999);
      formattedDate = formatDate(date, 'yyyy-MM-dd HH:mm:ss', 'en-US');
      console.log('Sending date to backend:', formattedDate);
    }

    return this.preferencesService
      .toggleAllPreferences(newStatus, formattedDate)
      .pipe(
        switchMap(() => {
          if (this.sendEmail && newStatus) {
            return this.preferencesService.sendPrefEmail();
          }
          return of(null);
        })
      );
  }

  /**
   * Handles publish/unpublish operation
   */
  private handlePublishOperation(): Observable<any> {
    const newStatus = !this.data.currentState;
    // Assuming toggleAllSchedules remains in OverviewService
    return this.overviewService.toggleAllSchedules(newStatus).pipe(
      switchMap(() => {
        if (this.sendEmail && newStatus) {
          return this.overviewService.sendScheduleEmail();
        }
        return of(null);
      })
    );
  }

  /**
   * Checks if at least one report option is selected
   */
  public isReportSelectionValid(): boolean {
    return Object.values(this.reportOptions).some((value) => value);
  }

  /**
   * Handles report generation
   */
  private handleReportsGeneration(): void {
    if (!this.isReportSelectionValid()) {
      this.snackBar.open(
        'Please select at least one report to generate.',
        'Close',
        { duration: 3000 }
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
              duration: 3000,
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
            { duration: 3000 }
          );

          this.dialogRef.close(true);
        },
        error: (error) => {
          console.error('Error generating reports:', error);
          this.snackBar.open(
            'Failed to generate reports. Please try again later.',
            'Close',
            { duration: 3000 }
          );
        },
      });
  }

  /**
   * Gets the appropriate success message based on the action type
   */
  private getSuccessMessage(): string {
    switch (this.data.type) {
      case 'reports':
        return 'Reports generated successfully.';
      case 'preferences':
        return `Faculty Preferences Submission ${
          !this.data.currentState ? 'enabled' : 'disabled'
        } successfully.${this.sendEmail ? ' Email notifications sent.' : ''}`;
      case 'publish':
        return `Faculty Load and Schedule ${
          !this.data.currentState ? 'published' : 'unpublished'
        } successfully.${this.sendEmail ? ' Email notifications sent.' : ''}`;
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
        return 'Failed to generate reports. Please try again.';
      case 'preferences':
        return `Failed to ${
          !this.data.currentState ? 'enable' : 'disable'
        } Faculty Preferences Submission. Please try again.`;
      case 'publish':
        return `Failed to ${
          !this.data.currentState ? 'publish' : 'unpublish'
        } Faculty Load and Schedule. Please try again.`;
      default:
        return 'Operation failed. Please try again.';
    }
  }
}
