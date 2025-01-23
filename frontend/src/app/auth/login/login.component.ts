import { Component, OnInit, OnDestroy, Renderer2, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';

import { Subject, Observable } from 'rxjs';

import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRippleModule } from '@angular/material/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';
import { MatSymbolDirective } from '../../core/imports/mat-symbol.directive';

import { DialogFacultyLoginComponent } from '../../shared/dialog-faculty-login/dialog-faculty-login.component';
import { DialogAdminLoginComponent } from '../../shared/dialog-admin-login/dialog-admin-login.component';
import { DialogRedirectComponent } from '../../shared/dialog-redirect/dialog-redirect.component';
import { SlideshowComponent } from '../../shared/slideshow/slideshow.component';

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
  private isAdminDialogOpen = false;
  private isFacultyDialogOpen = false;
  private isRedirectDialogOpen = false;

  readonly slideshowImages = [
    'assets/images/pupt_img_1.webp',
    'assets/images/pupt_img_2.webp',
    'assets/images/pupt_img_3.webp',
    'assets/images/pupt_img_4.webp',
    'assets/images/pupt_img_5.webp',
  ];

  currentBackgroundImage = '';
  isDarkTheme$: Observable<boolean>;

  constructor(
    private themeService: ThemeService,
    private dialog: MatDialog,
    private authService: AuthService
  ) {
    this.isDarkTheme$ = this.themeService.isDarkTheme$;
  }

  ngOnInit() {
    this.currentBackgroundImage = `url(${this.slideshowImages[0]})`;
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSlideChange(index: number) {
    this.currentBackgroundImage = `url(${this.slideshowImages[index]})`;
  }

  handleFacultyLogin(): void {
    if (this.isRedirectDialogOpen || this.isFacultyDialogOpen) return;

    this.isRedirectDialogOpen = true;
    const dialogRef = this.dialog.open(DialogRedirectComponent, {
      disableClose: true,
      data: { checkingHris: true },
    });

    dialogRef.afterClosed().subscribe(() => {
      this.isRedirectDialogOpen = false;
    });

    this.authService.checkHrisHealth().subscribe({
      next: (isHealthy) => {
        if (isHealthy) {
          dialogRef.componentInstance.updateState(false, true);
        } else {
          dialogRef.close();
          this.openFacultyLoginDialog();
        }
      },
      error: (error) => {
        console.error('Error checking HRIS health:', error);
        dialogRef.close();
        this.openFacultyLoginDialog();
      },
    });
  }

  openFacultyLoginDialog(): void {
    if (this.isFacultyDialogOpen) return;

    this.isFacultyDialogOpen = true;
    const dialogRef = this.dialog.open(DialogFacultyLoginComponent, {
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe(() => {
      this.isFacultyDialogOpen = false;
    });
  }

  openAdminLoginDialog(): void {
    if (this.isAdminDialogOpen) return;

    this.isAdminDialogOpen = true;
    const dialogRef = this.dialog.open(DialogAdminLoginComponent, {
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe(() => {
      this.isAdminDialogOpen = false;
    });
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }
}
