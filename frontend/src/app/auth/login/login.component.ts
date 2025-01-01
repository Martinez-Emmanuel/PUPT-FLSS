import { Component, OnInit, OnDestroy, Renderer2, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';

import { Subject, Observable, takeUntil } from 'rxjs';

import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRippleModule } from '@angular/material/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSymbolDirective } from '../../core/imports/mat-symbol.directive';

import { SlideshowComponent } from '../../shared/slideshow/slideshow.component';
import { DialogFacultyLoginComponent } from '../../shared/dialog-faculty-login/dialog-faculty-login.component';
import { DialogAdminLoginComponent } from '../../shared/dialog-admin-login/dialog-admin-login.component';

import { ThemeService } from '../../core/services/theme/theme.service';
import { AuthService } from '../../core/services/auth/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  imports: [
    CommonModule,
    SlideshowComponent,
    MatSymbolDirective,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatRippleModule,
    MatTooltipModule,
  ],
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

  constructor(
    private renderer: Renderer2,
    private elementRef: ElementRef,
    private themeService: ThemeService,
    private dialog: MatDialog,
    private authService: AuthService,
  ) {
    this.isDarkTheme$ = this.themeService.isDarkTheme$;
    this.currentBackgroundImage = `url(${this.backgroundImages[0]})`;
  }

  ngOnInit(): void {
    this.updateBackgroundImage(0);
    this.isDarkTheme$.pipe(takeUntil(this.destroy$)).subscribe();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get isDarkTheme(): Observable<boolean> {
    return this.themeService.isDarkTheme$;
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  onSlideChange(index: number): void {
    this.updateBackgroundImage(index);
  }

  updateBackgroundImage(index: number): void {
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

  checkHRISHealthAndLogin(): void {
    this.isLoading = true;

    this.authService.checkHrisHealth().subscribe({
      next: (isHealthy) => {
        if (isHealthy) {
          // HRIS is available, proceed with OAuth
          this.authService.initiateHrisLogin();
        } else {
          // HRIS is down, open local login dialog
          this.isLoading = false;
          this.openFacultyLoginDialog();
        }
      },
      error: (error) => {
        // Error checking HRIS health, fallback to local login
        console.error('Error checking HRIS health:', error);
        this.isLoading = false;
        this.openFacultyLoginDialog();
      },
    });
  }

  openFacultyLoginDialog(): void {
    const dialogRef = this.dialog.open(DialogFacultyLoginComponent, {
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe(() => {
      this.isLoading = false;
    });
  }

  openAdminLoginDialog(): void {
    const dialogRef = this.dialog.open(DialogAdminLoginComponent, {
      disableClose: true,
    });
  }
}
