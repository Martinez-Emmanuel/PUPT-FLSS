import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
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
  selector: 'app-dialog-admin-login',
  templateUrl: './dialog-admin-login.component.html',
  styleUrls: ['./dialog-admin-login.component.scss'],
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
})
export class DialogAdminLoginComponent implements OnInit {
  loginForm!: FormGroup;
  showPassword = false;
  passwordHasValue = false;
  isLoading = false;

  constructor(
    public dialogRef: MatDialogRef<DialogAdminLoginComponent>,
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private roleService: RoleService,
    private snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loginForm.get('password')!.valueChanges.subscribe((value) => {
      this.passwordHasValue = !!value;
      if (!value) {
        this.showPassword = false;
      }
    });
  }

  initForm(): void {
    this.loginForm = this.formBuilder.group({
      code: [
        '',
        [
          Validators.required,
          Validators.minLength(12),
          Validators.maxLength(12),
        ],
      ],
      password: [
        '',
        [
          Validators.required,
          Validators.minLength(8),
          Validators.maxLength(40),
        ],
      ],
    });
  }

  get code() {
    return this.loginForm.get('code');
  }

  get password() {
    return this.loginForm.get('password');
  }

  togglePasswordVisibility(): void {
    if (this.passwordHasValue) {
      this.showPassword = !this.showPassword;
    }
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.isLoading = true;
      const { code, password } = this.loginForm.value;
      this.authService.login(code, password).subscribe({
        next: (response) => {
          this.handleLoginSuccess(response);
        },
        error: (error) => {
          this.handleLoginError(error);
        },
        complete: () => {
          this.isLoading = false;
        },
      });
    }
  }

  onCloseClick(): void {
    this.dialogRef.close();
  }

  private handleLoginSuccess(response: any): void {
    console.log('Login successful', response);

    // Role Check for Admin Login
    if (response.user.role !== 'admin' && response.user.role !== 'superadmin') {
      this.handleLoginError({
        status: 403,
        error: {
          message: 'Access forbidden. You are not authorized as admin.',
        },
      });
      return;
    }

    this.authService.setToken(response.token, response.expires_at);
    this.authService.setUserInfo(response.user, response.expires_at);

    const expirationTime = new Date(response.expires_at).getTime() - Date.now();
    setTimeout(() => this.onAutoLogout(), expirationTime);

    const redirectUrl = this.roleService.getHomeUrlForRole(response.user.role);
    this.dialogRef.close();
    this.router.navigateByUrl(redirectUrl, { replaceUrl: true });
  }

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
  onAutoLogout(): void {
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

  private handleLogoutSuccess(message?: string): void {
    this.authService.clearCookies();
    this.dialogRef.close();
    if (message) {
      alert(message);
    }
    this.router.navigate(['/login']);
  }

  private getErrorMessage(error: any): string {
    if (error.status === 401 || error.status === 403) {
      return 'Invalid credentials. Please check your admin code and password.';
    } else if (error.status === 0) {
      return 'Unable to connect to the server. Please check your internet connection.';
    } else {
      return 'An unexpected error occurred. Please try again later.';
    }
  }
}
