import { Component, Inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { of, Observable, delay } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSymbolDirective } from '../../core/imports/mat-symbol.directive';

import { OverviewService } from '../../core/services/admin/overview/overview.service';

export interface DialogActionData {
  type: 'preferences' | 'publish' | 'reports';
  academicYear: string;
  semester: string;
  currentState: boolean;
}

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
    MatSymbolDirective,
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

  // Report-specific properties
  showReportOptions = false;
  reportOptions = {
    faculty: false,
    programs: false,
    rooms: false,
  };

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: DialogActionData,
    private dialogRef: MatDialogRef<DialogActionComponent>,
    private overviewService: OverviewService,
    private snackBar: MatSnackBar
  ) {
    this.initializeDialogContent();
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
        this.actionText = ''; // Not needed for reports
        this.navigationLink = '/admin/reports';
        this.linkText = 'Official Reports';
        this.showEmailOption = false;
        this.showReportOptions = true;
        break;
    }
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
   * Checks if at least one report option is selected
   */
  isReportSelectionValid(): boolean {
    return Object.values(this.reportOptions).some((value) => value);
  }

  /**
   * Handles the confirmation action based on dialog type
   */
  confirmAction(): void {
    // For reports, validate selection before proceeding
    if (this.data.type === 'reports' && !this.isReportSelectionValid()) {
      this.snackBar.open(
        'Please select at least one report to generate.',
        'Close',
        { duration: 3000 }
      );
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
      case 'reports':
        operation$ = this.handleReportsOperation();
        break;
      default:
        operation$ = of(null);
    }

    operation$.subscribe({
      next: () => {
        this.isProcessing = false;
        const successMessage = this.getSuccessMessage();
        this.snackBar.open(successMessage, 'Close', { duration: 3000 });
        this.dialogRef.close(true);
      },
      error: (error) => {
        console.error('Operation failed:', error);
        const errorMessage = this.getErrorMessage();
        this.snackBar.open(errorMessage, 'Close', { duration: 3000 });
        this.isProcessing = false;
      },
    });
  }

  /**
   * Handles preferences toggle operation
   */
  private handlePreferencesOperation(): Observable<any> {
    const newStatus = !this.data.currentState;
    return this.overviewService.togglePreferencesSettings(newStatus).pipe(
      switchMap(() => {
        if (this.sendEmail && newStatus) {
          return this.overviewService.sendPrefEmail();
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
   * Handles report generation operation
   * Currently mocked - to be implemented with actual report generation logic
   */
  private handleReportsOperation(): Observable<any> {
    // This is where you'll implement the actual report generation logic later
    return of(null).pipe(
      delay(1000) // Simulate processing time
    );
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