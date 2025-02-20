import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSymbolDirective } from '../../core/imports/mat-symbol.directive';

import { AuthService } from '../../core/services/auth/auth.service';

@Component({
  selector: 'app-reset-password',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSymbolDirective,
  ],
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss'],
})
export class ResetPasswordComponent implements OnInit {
  resetForm: FormGroup;
  isLoading = false;
  showPassword = false;
  showConfirmPassword = false;
  token: string | null = null;
  email: string | null = null;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar,
  ) {
    this.resetForm = this.formBuilder.group({
      password: ['', [Validators.required, Validators.minLength(8)]],
      password_confirmation: ['', [
        Validators.required,
        (control: AbstractControl): ValidationErrors | null => {
          if (!control.value) return null;
          const password = this.resetForm?.get('password')?.value;
          return password === control.value ? null : { passwordMismatch: true };
        }
      ]],
    });

    this.resetForm.get('password')?.valueChanges.subscribe(() => {
      this.resetForm.get('password_confirmation')?.updateValueAndValidity();
    });
  }

  ngOnInit() {
    // Get token and email from URL
    this.token = this.route.snapshot.paramMap.get('token');
    this.email = this.route.snapshot.queryParamMap.get('email');

    if (!this.token || !this.email) {
      this.snackBar.open('Invalid password reset link.', 'Close', {
        duration: 5000,
      });
      this.router.navigate(['/login']);
      return;
    }

    // Verify token
    this.authService.verifyResetToken(this.token, this.email).subscribe({
      error: () => {
        this.snackBar.open(
          'This password reset link has expired or is invalid.',
          'Close',
          { duration: 5000 },
        );
        this.router.navigate(['/login']);
      },
    });
  }

  get password() {
    return this.resetForm.get('password');
  }

  get passwordConfirmation() {
    return this.resetForm.get('password_confirmation');
  }

  get passwordHasValue() {
    return this.password?.value?.length > 0;
  }

  get confirmPasswordHasValue() {
    return this.passwordConfirmation?.value?.length > 0;
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  onSubmit() {
    if (this.resetForm.valid && this.token && this.email) {
      this.isLoading = true;
      const { password, password_confirmation } = this.resetForm.value;

      this.authService
        .resetPassword(this.token, this.email, password, password_confirmation)
        .subscribe({
          next: () => {
            this.snackBar.open(
              'Your password has been reset successfully.',
              'Close',
              { duration: 5000 },
            );
            this.router.navigate(['/login']);
          },
          error: (error) => {
            this.snackBar.open(
              error.error.message ||
                'An error occurred while resetting your password.',
              'Close',
              { duration: 5000 },
            );
            this.isLoading = false;
          },
        });
    }
  }

  onCancel() {
    this.router.navigate(['/login']);
  }
}
