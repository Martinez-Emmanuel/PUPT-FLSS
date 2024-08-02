import { Component, OnInit, OnDestroy, Renderer2 } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SlideshowComponent } from '../../shared/slideshow/slideshow.component';
import { MaterialComponent } from '../../core/imports/material.component';
import { ThemeService } from '../../core/services/theme/theme.service';
import { Observable } from 'rxjs';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    SlideshowComponent,
    MaterialComponent,
    ReactiveFormsModule,
  ],

  providers: [AuthService] 

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
  loginForm: FormGroup;

  constructor(private renderer: Renderer2, private themeService: ThemeService, private formBuilder: FormBuilder, private authService: AuthService) {
    this.isDarkTheme$ = this.themeService.isDarkTheme$;
    this.loginForm = this.formBuilder.group({
      username: ['', [Validators.required, Validators.minLength(12), Validators.maxLength(12)]],
      password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(40)]]
    });
  }

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
    this.renderer.setStyle(
      document.getElementById('login-container'),
      'background-image',
      backgroundImage
    );
  }

  get username() { return this.loginForm.get('username'); }
  get password() { return this.loginForm.get('password'); }

  onSubmit() {
   if (this.loginForm.valid) {
      this.authService.login(this.loginForm.value.username, this.loginForm.value.password)
        .subscribe(
          response => {
            console.log('Login successful', response);sessionStorage.setItem('faculty_code', response.faculty.faculty_code);
            sessionStorage.setItem('faculty_name', response.faculty.faculty_name);
            sessionStorage.setItem('faculty_type', response.faculty.faculty_type);
            sessionStorage.setItem('faculty_email', response.faculty.faculty_email);

            sessionStorage.setItem('token', response.token);
            // Redirect or perform other actions on successful login
          },
          error => {
            console.error('Login failed', error);
            // Handle login error (e.g., show an error message)
          }
        );
    }
  }

  onLogout() {
    this.authService.logout().subscribe(
      response => {
        console.log('Logout successful', response);
        // Remove the token from local storage or session storage
        sessionStorage.removeItem('faculty_code');
        sessionStorage.removeItem('faculty_name');
        sessionStorage.removeItem('faculty_type');
        sessionStorage.removeItem('faculty_email');
        
        sessionStorage.removeItem('token');
        // Redirect or perform other actions on successful logout
      },
      error => {
        console.error('Logout failed', error);
        // Handle logout error (e.g., show an error message)
      }
    );
  }
}