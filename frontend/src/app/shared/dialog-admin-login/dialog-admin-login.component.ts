import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { MatButtonModule } from '@angular/material/button';
import { MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSymbolDirective } from '../../core/imports/mat-symbol.directive';

import { AuthService, LoginError } from '../../core/services/auth/auth.service';
import { RoleService } from '../../core/services/role/role.service';

@Component({
  selector: 'app-dialog-admin-login',
  templateUrl: './dialog-admin-login.component.html',
  styleUrls: ['./dialog-admin-login.component.scss'],
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatSymbolDirective,
    MatFormFieldModule,
    MatInputModule,
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
  ) {}

  ngOnInit(): void {
    this.initForm();
  }

  initForm(): void {
    this.loginForm = this.formBuilder.group({
      email: [
        '',
        [Validators.required, Validators.email, Validators.maxLength(254)],
      ],
      password: [
        '',
        [
          Validators.required,
          Validators.minLength(8),
          Validators.maxLength(128),
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

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.isLoading = true;
      const { email, password } = this.loginForm.value;

      this.authService
        .handleLogin(email, password, ['admin', 'superadmin'])
        .subscribe({
          next: (response) => {
            const expiryDate = new Date(response.expires_at);
            this.authService.setSanctumToken(
              response.token,
              response.expires_at,
            );
            this.authService.setUserInfo(response.user, response.expires_at);
            const expirationTime = expiryDate.getTime() - Date.now();
            setTimeout(() => this.onAutoLogout(), expirationTime);
            const redirectUrl = this.roleService.getHomeUrlForRole(
              response.user.role,
            );
            this.dialogRef.close();
            this.router.navigateByUrl(redirectUrl, { replaceUrl: true });
          },
          error: (error: LoginError) => {
            this.showErrorSnackbar(error.message);
            this.isLoading = false;
          },
        });
    }
  }

  onCloseClick(): void {
    this.dialogRef.close();
  }

  private showErrorSnackbar(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 5000,
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
}
