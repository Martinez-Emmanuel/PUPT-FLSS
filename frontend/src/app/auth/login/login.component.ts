import { Component, OnInit, OnDestroy, Renderer2, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { Subject, Observable, takeUntil } from 'rxjs';

import { MatIcon } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatButton } from '@angular/material/button';
import { MatProgressSpinner } from '@angular/material/progress-spinner';

import { SlideshowComponent } from '../../shared/slideshow/slideshow.component';
import { MatSymbolDirective } from '../../core/imports/mat-symbol.directive';

import { ThemeService } from '../../core/services/theme/theme.service';
import { AuthService } from '../../core/services/auth/auth.service';
import { RoleService } from '../../core/services/role/role.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    SlideshowComponent,
    ReactiveFormsModule,
    MatSymbolDirective,
    MatIcon,
    MatButton,
    MatProgressSpinner,
  ],
  providers: [AuthService],
})
export class LoginComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  readonly backgroundImages = [
    'assets/images/pupt_img_1.webp',
    'assets/images/pupt_img_2.webp',
    'assets/images/pupt_img_3.webp',
    'assets/images/pupt_img_4.webp',
    'assets/images/pupt_img_5.webp',
  ];

  readonly slideshowImages = this.backgroundImages.map(
    (img) => `assets/images/${img.split('/').pop()}`
  );

  currentBackgroundImage: string;

  isDarkTheme$: Observable<boolean>;
  isLoading = false;
  loginForm!: FormGroup;
  errorMessage = '';
  showPassword = false;

  constructor(
    private renderer: Renderer2,
    private elementRef: ElementRef,
    private themeService: ThemeService,
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private roleService: RoleService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.isDarkTheme$ = this.themeService.isDarkTheme$;
    this.currentBackgroundImage = `url(${this.backgroundImages[0]})`;
    this.initForm();
  }

  ngOnInit(): void {
    this.updateBackgroundImage(0);
    this.isDarkTheme$.pipe(takeUntil(this.destroy$)).subscribe();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initForm(): void {
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

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  onSlideChange(index: number): void {
    this.updateBackgroundImage(index);
  }

  onEnterPressed(): void {
    if (this.loginForm.valid && !this.isLoading) {
      this.onSubmit();
    }
  }

  private updateBackgroundImage(index: number): void {
    this.currentBackgroundImage = `url(${this.backgroundImages[index]})`;
    const loginContainer =
      this.elementRef.nativeElement.querySelector('.login-container');
    if (loginContainer) {
      this.renderer.setStyle(
        loginContainer,
        'background-image',
        this.currentBackgroundImage
      );
    }
  }

  get code() {
    return this.loginForm.get('code');
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
      const { code, password } = this.loginForm.value;
      this.authService.login(code, password).subscribe({
        next: (response) => this.handleLoginSuccess(response),
        error: (error) => this.handleLoginError(error),
        complete: () => (this.isLoading = false),
      });
    }
  }

  private handleLoginSuccess(response: any): void {
    console.log('Login successful', response);
    this.authService.setToken(response.token, response.expires_at);
    this.authService.setUserInfo(response.user, response.expires_at);

    const expirationTime = new Date(response.expires_at).getTime() - Date.now();
    setTimeout(() => this.onAutoLogout(), expirationTime);

    const redirectUrl = this.roleService.getHomeUrlForRole(response.user.role);
    this.router.navigateByUrl(redirectUrl, { replaceUrl: true });
  }

  private handleLoginError(error: any): void {
    console.error('Login failed', error);
    const errorMessage = this.getErrorMessage(error);
    this.showErrorSnackbar(errorMessage);
    this.isLoading = false;
  }

  private getErrorMessage(error: any): string {
    if (error.status === 401) {
      return error.error.message === 'Invalid Credentials'
        ? 'Invalid username or password. Please try again.'
        : 'Unauthorized access. Please check your credentials.';
    } else if (error.status === 403) {
      return 'Access forbidden. You may not have the necessary permissions.';
    } else if (error.status === 404) {
      return 'User not found. Please check your username.';
    } else if (error.status === 0) {
      return 'Unable to connect to the server. Please check your internet connection.';
    } else {
      return 'An unexpected error occurred. Please try again later.';
    }
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

  onLogout(): void {
    this.authService.logout().subscribe({
      next: () => this.handleLogoutSuccess(),
      error: (error) => console.error('Logout failed', error),
    });
  }

  private handleLogoutSuccess(message?: string): void {
    this.authService.clearCookies();
    if (message) {
      alert(message);
    }
    this.router.navigate(['/login']);
  }
}