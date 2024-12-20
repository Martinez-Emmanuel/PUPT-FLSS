import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSymbolDirective } from '../../core/imports/mat-symbol.directive';

import { PreferencesService } from '../../core/services/faculty/preference/preferences.service';

interface DialogRequestAccessData {
  has_request: boolean;
  facultyId: string;
}

@Component({
  selector: 'app-dialog-request-access',
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatSymbolDirective,
  ],
  templateUrl: './dialog-request-access.component.html',
  styleUrls: ['./dialog-request-access.component.scss'],
})
export class DialogRequestAccessComponent {
  hasRequest: boolean;
  isLoading: boolean = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: DialogRequestAccessData,
    private dialogRef: MatDialogRef<DialogRequestAccessComponent>,
    private preferencesService: PreferencesService,
    private snackBar: MatSnackBar
  ) {
    this.hasRequest = data.has_request;
  }

  closeDialog(): void {
    this.dialogRef.close();
  }

  requestAccess(): void {
    this.isLoading = true;
    this.preferencesService.requestAccess(this.data.facultyId).subscribe({
      next: () => {
        this.snackBar.open(
          'Request for submission access successfully sent to administrator.',
          'Close',
          { duration: 3000 }
        );
        // Return true to indicate successful request
        this.dialogRef.close(true);
      },
      error: () => {
        this.snackBar.open(
          'Failed to submit request for access to administrator. Try again.',
          'Close',
          { duration: 3000 }
        );
        this.isLoading = false;
      },
    });
  }

  cancelRequestAccess(): void {
    this.isLoading = true;
    this.preferencesService.cancelRequestAccess(this.data.facultyId).subscribe({
      next: () => {
        this.snackBar.open(
          'Request for submission access has been canceled.',
          'Close',
          { duration: 3000 }
        );
        // Return false to indicate request cancellation
        this.dialogRef.close(false);
      },
      error: () => {
        this.snackBar.open(
          'Request for submission access cancellation has failed. Please try again.',
          'Close',
          { duration: 3000 }
        );
        this.isLoading = false;
      },
    });
  }
}
