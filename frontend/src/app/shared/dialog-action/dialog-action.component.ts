import { Component, Inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { of } from 'rxjs';
import { finalize, switchMap } from 'rxjs/operators';

import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSymbolDirective } from '../../core/imports/mat-symbol.directive';

import { ReportGenerationService } from '../../core/services/admin/report-generation/report-generation.service';
import { ReportsService } from '../../core/services/admin/reports/reports.service';

export interface DialogActionData {
  type: 'all_publish' | 'single_publish' | 'reports';
  currentState: boolean;
  academicYear?: string;
  semester?: string;
  hasSecondaryText?: boolean;
  facultyName?: string;
  faculty_id?: number;
}

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
    MatSymbolDirective,
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

  sendEmail = false;
  isProcessing = false;
  showEmailOption = false;
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
    private reportsService: ReportsService,
    private reportGenerationService: ReportGenerationService
  ) {
    this.initializeDialogContent();
  }

  /**
   * Initializes dialog content based on the action type
   */
  private initializeDialogContent(): void {
    switch (this.data.type) {
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
    const operation$ =
      this.data.type === 'all_publish'
        ? this.handleAllPublishOperation()
        : this.handleSinglePublishOperation();

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
   * Handles publish/unpublish for all schedules
   */
  private handleAllPublishOperation() {
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
   * Handles publish/unpublish for a single faculty schedule
   */
  private handleSinglePublishOperation() {
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
   * Gets success message based on the action type
   */
  private getSuccessMessage(): string {
    switch (this.data.type) {
      case 'reports':
        return 'Reports generated successfully.';
      case 'all_publish':
        return `Schedules for all faculty ${
          !this.data.currentState ? 'published' : 'unpublished'
        } successfully.${this.sendEmail ? ' Email sent.' : ''}`;
      case 'single_publish':
        return `Schedule for ${this.data.facultyName} ${
          !this.data.currentState ? 'published' : 'unpublished'
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
      case 'reports':
        return 'Failed to generate reports.';
      case 'all_publish':
        return `Failed to ${
          !this.data.currentState ? 'publish' : 'unpublish'
        } schedules for all faculty.`;
      case 'single_publish':
        return `Failed to ${
          !this.data.currentState ? 'publish' : 'unpublish'
        } schedule for ${this.data.facultyName}.`;
      default:
        return 'Operation failed.';
    }
  }
}