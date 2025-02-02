import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { MatButtonModule } from '@angular/material/button';
import { MatRippleModule } from '@angular/material/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSymbolDirective } from '../../core/imports/mat-symbol.directive';

import { AuthService, LoginError } from '../../core/services/auth/auth.service';

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
    MatFormFieldModule,
    MatInputModule,
    CommonModule,
  ],
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
    private snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: any,
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

  public onSubmit(): void {
    if (this.loginForm.valid) {
      this.isLoading = true;
      const { email, password } = this.loginForm.value;

      this.authService.handleLogin(email, password, ['faculty']).subscribe({
        next: (response) => {
          const expiryDate = new Date(response.expires_at);

          this.authService.setSanctumToken(response.token, response.expires_at);
          this.authService.setUserInfo(response.user, response.expires_at);

          const expirationTime = expiryDate.getTime() - Date.now();
          setTimeout(() => this.onAutoLogout(), expirationTime);

          this.dialogRef.close();
          this.router.navigateByUrl('/faculty/home', { replaceUrl: true });
        },
        error: (error: LoginError) => {
          this.showErrorSnackbar(error.message);
          this.isLoading = false;
        },
      });
    }
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

  private handleLogoutSuccess(message?: string): void {
    this.authService.clearCookies();
    this.dialogRef.close();
    if (message) {
      alert(message);
    }
    this.router.navigate(['/login']);
  }

  private showErrorSnackbar(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 5000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
      panelClass: ['error-snackbar'],
    });
  }
}
