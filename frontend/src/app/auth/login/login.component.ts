import { Component, OnInit, OnDestroy, Renderer2 } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SlideshowComponent } from '../../shared/slideshow/slideshow.component';
import { MaterialComponent } from '../../core/imports/material.component';
import { ThemeService } from '../../core/services/theme/theme.service';
import { Observable } from 'rxjs';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';

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

  constructor(private renderer: Renderer2, private themeService: ThemeService, private formBuilder: FormBuilder) {
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
      // Perform login logic here
      console.log('Form submitted:', this.loginForm.value);
    }
  }
}