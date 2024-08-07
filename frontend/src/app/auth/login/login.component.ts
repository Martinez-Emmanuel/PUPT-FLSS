import {
  Component,
  OnInit,
  OnDestroy,
  Renderer2,
  ElementRef,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';

import { SlideshowComponent } from '../../shared/slideshow/slideshow.component';
import { MaterialComponents } from '../../core/imports/material.component';
import { ThemeService } from '../../core/services/theme/theme.service';
import { AuthService } from '../../core/services/auth/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    SlideshowComponent,
    MaterialComponents,
    ReactiveFormsModule,
  ],

  providers: [AuthService],
})
export class LoginComponent implements OnInit, OnDestroy {
  backgroundImages: string[] = [
    'assets/images/pup_img_2.jpg',
    'assets/images/pup_img_4.jpg',
    'assets/images/pup_img_5.jpg',
  ];

  slideshowImages: string[] = [
    'assets/images/slideshow/pup_img_2.jpg',
    'assets/images/slideshow/pup_img_4.jpg',
    'assets/images/slideshow/pup_img_5.jpg',
  ];

  private intervalId: any;
  currentBackgroundIndex = 0;
  isDarkTheme$: Observable<boolean>;
  isLoading = false;
  loginForm: FormGroup;

  constructor(
    private renderer: Renderer2,
    private elementRef: ElementRef,
    private themeService: ThemeService,
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.isDarkTheme$ = this.themeService.isDarkTheme$;
    this.loginForm = this.formBuilder.group({
      username: [
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

  errorMessage: string = '';

  ngOnInit() {
    this.startBackgroundSlideshow();
  }

  ngOnDestroy() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  toggleTheme() {
    this.themeService.toggleTheme();
  }

  startBackgroundSlideshow() {
    this.intervalId = setInterval(() => {
      this.currentBackgroundIndex =
        (this.currentBackgroundIndex + 1) % this.backgroundImages.length;
      this.updateBackgroundImage();
    }, 5000);
  }

  getBackgroundImage(): string {
    return `url(${this.backgroundImages[this.currentBackgroundIndex]})`;
  }

  updateBackgroundImage() {
    const backgroundImage = this.getBackgroundImage();
    const loginContainer =
      this.elementRef.nativeElement.querySelector('.login-container');
    if (loginContainer) {
      this.renderer.setStyle(
        loginContainer,
        'background-image',
        backgroundImage
      );
    }
  }

  get username() {
    return this.loginForm.get('username');
  }
  get password() {
    return this.loginForm.get('password');
  }

  onSubmit() {
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.authService
        .login(this.loginForm.value.username, this.loginForm.value.password)
        .subscribe(
          (response) => {
            console.log('Login successful', response);
            sessionStorage.setItem(
              'faculty_code',
              response.faculty.faculty_code
            );
            sessionStorage.setItem(
              'faculty_name',
              response.faculty.faculty_name
            );
            sessionStorage.setItem(
              'faculty_type',
              response.faculty.faculty_type
            );
            sessionStorage.setItem(
              'faculty_email',
              response.faculty.faculty_email
            );
            sessionStorage.setItem('token', response.token);
            sessionStorage.setItem('expires_at', response.expires_at);

            const expirationTime =
              new Date(response.expires_at).getTime() - new Date().getTime();
            setTimeout(() => {
              this.onAutoLogout();
            }, expirationTime);

            this.isLoading = false;
            this.router.navigate(['/faculty']);
          },
          (error) => {
            console.error('Login failed', error);
            this.isLoading = false;

            if (
              error.status === 401 &&
              error.error.message === 'Invalid Credentials'
            ) {
              this.showErrorSnackbar(
                'Invalid username or password. Please try again.'
              );
            } else if (error.status === 0) {
              this.showErrorSnackbar(
                'Unable to connect to the server. Please check your internet connection.'
              );
            } else {
              this.showErrorSnackbar(
                'An error occurred during login. Please try again later.'
              );
            }
          }
        );
    }
  }

  showErrorSnackbar(message: string) {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
    });
  }

  onAutoLogout() {
    // Check if the token is present
    if (sessionStorage.getItem('token')) {
      this.authService.logout().subscribe(
        (response) => {
          console.log('Logout successful', response);
          sessionStorage.clear();

          // Show alert message
          alert('Session expired. Please log in again.');
        },
        (error) => {
          console.error('Logout failed', error);
          // Clear session storage and show alert message even if logout request fails
          sessionStorage.clear();
          alert('Session expired. Please log in again.');
          this.router.navigate(['/login']); // Redirect to login page
        }
      );
    } else {
      // If no token is present, clear session storage and show alert message
      sessionStorage.clear();
      alert('Session expired. Please log in again.');
    }
  }

  onLogout() {
    this.authService.logout().subscribe(
      (response) => {
        console.log('Logout successful', response);
        sessionStorage.clear();

        // Redirect to login page
        this.router.navigate(['/login']);
      },
      (error) => {
        console.error('Logout failed', error);
        // Handle logout error (e.g., show an error message)
      }
    );
  }
}
