import { Component, Inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { of, Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSymbolDirective } from '../../core/imports/mat-symbol.directive';

import { OverviewService } from '../../core/services/admin/overview/overview.service';

export interface DialogActionData {
  type: 'preferences' | 'publish';
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

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: DialogActionData,
    private dialogRef: MatDialogRef<DialogActionComponent>,
    private overviewService: OverviewService,
    private snackBar: MatSnackBar
  ) {
    this.initializeDialogContent();
  }

  private initializeDialogContent(): void {
    if (this.data.type === 'preferences') {
      this.dialogTitle = 'Faculty Preferences Submission';
      this.actionText = this.data.currentState ? 'Disable' : 'Enable';
      this.navigationLink = '/admin/faculty-preferences';
      this.linkText = 'Faculty Preferences';
    } else {
      this.dialogTitle = 'Faculty Load and Schedule';
      this.actionText = this.data.currentState ? 'Unpublish' : 'Publish';
      this.navigationLink = '/admin/reports/faculty';
      this.linkText = 'Faculty Official Reports';
    }

    // Show email option only when enabling preferences or publishing schedules
    this.showEmailOption = !this.data.currentState;
  }

  closeDialog(): void {
    if (!this.isProcessing) {
      this.dialogRef.close(false);
    }
  }

  confirmAction(): void {
    this.isProcessing = true;

    let operation$: Observable<any>;

    if (this.data.type === 'preferences') {
      const newStatus = !this.data.currentState;
      operation$ = this.overviewService
        .togglePreferencesSettings(newStatus)
        .pipe(
          // If sendEmail is checked and enabling, send the email
          switchMap(() => {
            if (this.sendEmail && newStatus) {
              return this.overviewService.sendPrefEmail();
            }
            return of(null);
          })
        );
    } else {
      const newStatus = !this.data.currentState;
      operation$ = this.overviewService.toggleAllSchedules(newStatus).pipe(
        // If sendEmail is checked and publishing, send the email
        switchMap(() => {
          if (this.sendEmail && newStatus) {
            return this.overviewService.sendScheduleEmail();
          }
          return of(null);
        })
      );
    }

    operation$.subscribe({
      next: () => {
        this.isProcessing = false;
        const successMessage =
          this.data.type === 'preferences'
            ? `Faculty Preferences Submission ${
                !this.data.currentState ? 'enabled' : 'disabled'
              } successfully.${
                this.sendEmail ? ' Email notifications sent.' : ''
              }`
            : `Faculty Load and Schedule ${
                !this.data.currentState ? 'unpublished' : 'published'
              } successfully.${
                this.sendEmail ? ' Email notifications sent.' : ''
              }`;
        this.snackBar.open(successMessage, 'Close', { duration: 3000 });
        this.dialogRef.close(true);
      },
      error: (error) => {
        console.error('Operation failed:', error);
        const errorMessage =
          this.data.type === 'preferences'
            ? `Failed to ${
                !this.data.currentState ? 'enable' : 'disable'
              } Faculty Preferences Submission. Please try again.`
            : `Failed to ${
                !this.data.currentState ? 'unpublish' : 'publish'
              } Faculty Load and Schedule. Please try again.`;
        this.snackBar.open(errorMessage, 'Close', { duration: 3000 });
        this.isProcessing = false;
      },
    });
  }
}
