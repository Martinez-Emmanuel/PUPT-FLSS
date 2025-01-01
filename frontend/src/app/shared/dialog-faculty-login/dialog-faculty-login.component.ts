import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';

import { MatButtonModule } from '@angular/material/button';
import { MatRippleModule } from '@angular/material/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSymbolDirective } from '../../core/imports/mat-symbol.directive';

import { AuthService } from '../../core/services/auth/auth.service';
import { RoleService } from '../../core/services/role/role.service';

@Component({
  selector: 'app-dialog-faculty-login',
  templateUrl: './dialog-faculty-login.component.html',
  styleUrls: ['./dialog-faculty-login.component.scss'],
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatRippleModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatSymbolDirective,
    CommonModule,
  ],
  standalone: true,
})
export class DialogFacultyLoginComponent implements OnInit {
  loginForm!: FormGroup;
  showPassword = false;
  passwordHasValue = false;
  isLoading = false;

  constructor(
    public dialogRef: MatDialogRef<DialogFacultyLoginComponent>,
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private roleService: RoleService,
    private snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit(): void {
    this.initForm();
  }

  private initForm(): void {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: [
        '',
        [
          Validators.required,
          Validators.minLength(8),
          Validators.maxLength(40),
        ],
      ],
    });

    this.loginForm.get('password')?.valueChanges.subscribe((value) => {
      this.passwordHasValue = !!value;
    });
  }

  get email() {
    return this.loginForm.get('email');
  }

  get password() {
    return this.loginForm.get('password');
  }

  public togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  public onCloseClick(): void {
    this.dialogRef.close();
  }

  // Simplified onSubmitClick() to directly use FLSS login
  public onSubmitClick(): void {
    if (this.loginForm.valid) {
      this.isLoading = true;
      const { email, password } = this.loginForm.value;

      // Directly call FLSS login since HRIS is assumed to be down
      this.fallbackToFlssLogin(email, password);
    }
  }

  // Removed tryHrisLogin() as it's not needed

  private fallbackToFlssLogin(email: string, password: string): void {
    this.authService.flssLogin(email, password).subscribe({
      next: (response) => this.handleLoginSuccess(response),
      error: (error) => this.handleLoginError(error),
    });
  }

  private handleLoginSuccess(response: any): void {
    console.log('Login successful', response);

    // Role Check for Faculty Login
    if (response.user.role !== 'faculty') {
      this.handleLoginError({
        status: 403,
        error: {
          message: 'Access forbidden. You are not authorized as faculty.',
        },
      });
      return;
    }

    // Set expiry date for cookies
    const expiryDate = new Date(response.expires_at);

    // Set token and user info
    this.authService.setSanctumToken(response.token, response.expires_at);
    this.authService.setUserInfo(response.user, response.expires_at);

    // Set auto logout timer
    const expirationTime = expiryDate.getTime() - Date.now();
    setTimeout(() => this.onAutoLogout(), expirationTime);

    // Close dialog and navigate
    this.dialogRef.close();
    this.router.navigateByUrl('/faculty/home', { replaceUrl: true });
  }

  private handleLogoutSuccess(message?: string): void {
    this.authService.clearCookies();
    this.dialogRef.close();
    if (message) {
      alert(message);
    }
    this.router.navigate(['/login']);
  }

  private onAutoLogout(): void {
    if (this.authService.getToken()) {
      this.authService.logout().subscribe({
        next: () =>
          this.handleLogoutSuccess('Session expired. Please log in again.'),
        error: () =>
          this.handleLogoutSuccess('Session expired. Please log in again.'),
      });
    } else {
      this.handleLogoutSuccess('Session expired. Please log in again.');
    }
  }

  // =======================
  // Error handling methods
  // =======================
  private handleLoginError(error: any): void {
    console.error('Login failed', error);
    const errorMessage = this.getErrorMessage(error);
    this.showErrorSnackbar(errorMessage);
    this.isLoading = false;
  }

  private showErrorSnackbar(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
    });
  }

  private getErrorMessage(error: any): string {
    if (error.status === 401 || error.status === 403) {
      return 'Invalid credentials. Please check your email and password.';
    } else if (error.status === 0) {
      return 'Unable to connect to the server. Please try again later.';
    } else {
      return (
        error.error?.message ||
        'An unexpected error occurred. Please try again later.'
      );
    }
  }
}
