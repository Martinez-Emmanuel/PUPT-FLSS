import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSymbolDirective } from '../../core/imports/mat-symbol.directive';

import { AuthService } from '../../core/services/auth/auth.service';

@Component({
  selector: 'app-request-password-reset',
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
  templateUrl: './request-password-reset.component.html',
  styleUrls: ['./request-password-reset.component.scss'],
})
export class RequestPasswordResetComponent {
  resetForm: FormGroup;
  isLoading = false;
  isEmailSent = false;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar,
  ) {
    this.resetForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }

  get email() {
    return this.resetForm.get('email');
  }

  onSubmit() {
    if (this.resetForm.valid) {
      this.isLoading = true;
      this.authService
        .sendPasswordResetEmail(this.resetForm.value.email)
        .subscribe({
          next: () => {
            this.isLoading = false;
            this.isEmailSent = true;
          },
          error: () => {
            this.snackBar.open(
              'An error occurred while processing your request. Please try again.',
              'Close',
              { duration: 5000 },
            );
            this.isLoading = false;
          },
        });
    }
  }

  resendEmail() {
    this.isEmailSent = false;
    this.resetForm.enable();
  }

  onCancel() {
    this.router.navigate(['/login']);
  }
}
