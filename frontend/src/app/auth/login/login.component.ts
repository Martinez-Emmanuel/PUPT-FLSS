import { Component, OnInit, OnDestroy, Renderer2, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Observable, Subscription, timer } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { SlideshowComponent } from '../../shared/slideshow/slideshow.component';
import { MaterialComponents } from '../../core/imports/material.component';
import { ThemeService } from '../../core/services/theme/theme.service';
import { AuthService } from '../../core/services/auth/auth.service';
import { RoleService } from '../../core/services/role/role.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSymbolDirective } from '../../core/imports/mat-symbol.directive';

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
    MaterialComponents,
  ],
  providers: [AuthService],
})
export class LoginComponent implements OnInit, OnDestroy {
  readonly backgroundImages = [
    'assets/images/pup_img_2.jpg',
    'assets/images/pup_img_4.jpg',
    'assets/images/pup_img_5.jpg',
  ];

  readonly slideshowImages = this.backgroundImages.map(
    (img) => `assets/images/slideshow/${img.split('/').pop()}`
  );

  currentBackgroundIndex = 0;
  isDarkTheme$: Observable<boolean>;
  isLoading = false;
  loginForm: FormGroup;
  errorMessage = '';

  private backgroundInterval: Subscription | null = null;

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

  ngOnInit() {
    this.startBackgroundSlideshow();
  }

  ngOnDestroy() {
    this.backgroundInterval?.unsubscribe();
  }

  toggleTheme() {
    this.themeService.toggleTheme();
  }

  startBackgroundSlideshow() {
    this.backgroundInterval = timer(0, 5000)
      .pipe(takeUntil(this.loginForm.statusChanges))
      .subscribe(() => {
        this.currentBackgroundIndex =
          (this.currentBackgroundIndex + 1) % this.backgroundImages.length;
        this.updateBackgroundImage();
      });
  }

  getBackgroundImage(): string {
    return `url(${this.backgroundImages[this.currentBackgroundIndex]})`;
  }

  updateBackgroundImage() {
    const loginContainer =
      this.elementRef.nativeElement.querySelector('.login-container');
    if (loginContainer) {
      this.renderer.setStyle(
        loginContainer,
        'background-image',
        this.getBackgroundImage()
      );
    }
  }

  get code() {
    return this.loginForm.get('code');
  }

  get password() {
    return this.loginForm.get('password');
  }

  onSubmit() {
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

  private handleLoginSuccess(response: any) {
    console.log('Login successful', response);
    this.authService.setToken(response.token, response.expires_at);
    this.authService.setUserInfo(response.user, response.expires_at);

    const expirationTime = new Date(response.expires_at).getTime() - Date.now();
    setTimeout(() => this.onAutoLogout(), expirationTime);

    const redirectUrl = this.roleService.getHomeUrlForRole(response.user.role);
    this.router.navigateByUrl(redirectUrl, { replaceUrl: true });
  }

  private handleLoginError(error: any) {
    console.error('Login failed', error);
    this.errorMessage =
      error.status === 401 && error.error.message === 'Invalid Credentials'
        ? 'Invalid username or password. Please try again.'
        : 'An error occurred during login. Please try again later.';
    this.showErrorSnackbar(this.errorMessage);
  }

  showErrorSnackbar(message: string) {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
    });
  }

  onAutoLogout() {
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

  onLogout() {
    this.authService.logout().subscribe({
      next: () => this.handleLogoutSuccess(),
      error: (error) => console.error('Logout failed', error),
    });
  }

  private handleLogoutSuccess(message?: string) {
    this.authService.clearCookies();
    if (message) {
      alert(message);
    }
    this.router.navigate(['/login']);
  }
}