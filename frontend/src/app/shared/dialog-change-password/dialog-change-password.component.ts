import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';

import { Subject, takeUntil } from 'rxjs';

import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSymbolDirective } from '../../core/imports/mat-symbol.directive';

import { AuthService } from '../../core/services/auth/auth.service';
import { fadeAnimation } from '../../core/animations/animations';

@Component({
  selector: 'app-dialog-change-password',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatSymbolDirective,
    MatProgressSpinnerModule,
  ],
  templateUrl: './dialog-change-password.component.html',
  styleUrls: ['./dialog-change-password.component.scss'],
  animations: [fadeAnimation],
})
export class DialogChangePasswordComponent implements OnInit, OnDestroy {
  passwordForm!: FormGroup;
  isLoading = false;
  hideCurrentPassword = true;
  hideNewPassword = true;
  hideConfirmPassword = true;
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<DialogChangePasswordComponent>,
    private authService: AuthService,
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.setupFormValidation();
    this.setupServerErrorClearing();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeForm(): void {
    this.passwordForm = this.fb.group({
      currentPassword: ['', [Validators.required]],
      newPassword: [
        '',
        [
          Validators.required,
          Validators.minLength(8),
          Validators.maxLength(128),
        ],
      ],
      confirmPassword: [
        '',
        [Validators.required, this.createPasswordMatchValidator()],
      ],
    });
  }

  private createPasswordMatchValidator() {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      if (!this.passwordForm) return null;

      const newPassword = this.passwordForm.get('newPassword')?.value;
      const confirmPassword = control.value;

      return newPassword === confirmPassword
        ? null
        : { passwordMismatch: true };
    };
  }

  private setupFormValidation(): void {
    // Update confirm password validation when new password changes
    this.passwordForm
      .get('newPassword')
      ?.valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.passwordForm.get('confirmPassword')?.updateValueAndValidity();
      });
  }

  private setupServerErrorClearing(): void {
    const controlNames = ['currentPassword', 'newPassword', 'confirmPassword'];

    controlNames.forEach((controlName) => {
      this.passwordForm
        .get(controlName)
        ?.valueChanges.pipe(takeUntil(this.destroy$))
        .subscribe(() => {
          const control = this.passwordForm.get(controlName);
          if (control?.hasError('serverError')) {
            control.setErrors(null);
            control.updateValueAndValidity();
          }
        });
    });
  }

  private handleServerErrors(error: any): void {
    if (
      error.error?.errors?.current_password ||
      error.error?.errors?.currentPassword
    ) {
      this.passwordForm.get('currentPassword')?.setErrors({
        serverError: 'Current password is incorrect',
      });
    }

    if (error.error?.errors) {
      Object.entries(error.error.errors).forEach(([key, value]) => {
        if (key !== 'current_password' && key !== 'currentPassword') {
          const control = this.passwordForm.get(key);
          if (control && Array.isArray(value)) {
            control.setErrors({ serverError: value[0] });
          }
        }
      });
    }
  }

  onSubmit(): void {
    if (this.passwordForm.valid && !this.isLoading) {
      this.isLoading = true;
      const { currentPassword, newPassword, confirmPassword } =
        this.passwordForm.value;

      this.authService
        .changePassword(currentPassword, newPassword, confirmPassword)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => this.dialogRef.close(response),
          error: (error) => {
            this.handleServerErrors(error);
            this.isLoading = false;
          },
          complete: () => (this.isLoading = false),
        });
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
