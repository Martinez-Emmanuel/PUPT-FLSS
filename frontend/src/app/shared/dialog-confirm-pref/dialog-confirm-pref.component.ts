import { Component, Inject, ViewChild, EventEmitter, Output, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatStepperModule, MatStepper } from '@angular/material/stepper';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSymbolDirective } from '../../core/imports/mat-symbol.directive';

@Component({
    selector: 'app-dialog-confirm-pref',
    imports: [
        CommonModule,
        MatDialogModule,
        MatStepperModule,
        MatButtonModule,
        MatIconModule,
        MatProgressSpinnerModule,
        MatSymbolDirective,
    ],
    templateUrl: './dialog-confirm-pref.component.html',
    styleUrls: ['./dialog-confirm-pref.component.scss']
})
export class DialogConfirmPrefComponent {
  @ViewChild('stepper') stepper!: MatStepper;
  @Output() confirmSubmission = new EventEmitter<void>();
  isConfirmStepCompleted = false;
  isSubmitting = false; 

  constructor(
    public dialogRef: MatDialogRef<DialogConfirmPrefComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private cdr: ChangeDetectorRef
  ) {}

  onReview(): void {
    this.dialogRef.close('review');
  }

  onConfirmSubmission(): void {
    if (this.isSubmitting) return;
    this.isSubmitting = true;
    this.confirmSubmission.emit();
  }

  onSubmissionComplete(success: boolean): void {
    this.isSubmitting = false;
    if (success) {
      this.isConfirmStepCompleted = true;
      this.cdr.detectChanges();
      this.stepper.next();
    }
  }

  onClose(): void {
    this.dialogRef.close();
  }
}

