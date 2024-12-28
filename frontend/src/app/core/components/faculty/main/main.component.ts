import { Component, AfterViewInit, ElementRef, Renderer2, OnDestroy, NgZone, OnInit } from '@angular/core';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';

import { MatDialog } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';

import { Subject, fromEvent } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';

import { MatSymbolDirective } from '../../../imports/mat-symbol.directive';
import { DialogGenericComponent, DialogData } from '../../../../shared/dialog-generic/dialog-generic.component';

import { ThemeService } from '../../../services/theme/theme.service';
import { AuthService } from '../../../services/auth/auth.service';
import { CookieService } from 'ngx-cookie-service';

@Component({
    selector: 'app-main',
    templateUrl: './main.component.html',
    styleUrls: ['./main.component.scss'],
    imports: [RouterModule, CommonModule, MatTooltipModule, MatSymbolDirective]
})
export class MainComponent implements OnInit, AfterViewInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private isInitialLoad = true;
  private resizeObserver!: ResizeObserver;
  private documentClickListener!: () => void;
  public isDropdownOpen = false;

  public facultyName: string | null = '';
  public facultyEmail: string | null = '';

  constructor(
    private el: ElementRef,
    private renderer: Renderer2,
    private router: Router,
    private ngZone: NgZone,
    public themeService: ThemeService,
    private authService: AuthService,
    private dialog: MatDialog,
    private cookieService: CookieService
  ) {}

  ngOnInit(): void {
    this.loadFacultyInfo();
  }

  ngAfterViewInit() {
    this.setupSlider();

    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        setTimeout(() => this.updateSliderPosition(), 0);
      });

    setTimeout(() => this.updateSliderPosition(), 0);

    this.ngZone.runOutsideAngular(() => {
      fromEvent(window, 'resize')
        .pipe(takeUntil(this.destroy$))
        .subscribe(() => {
          this.ngZone.run(() => {
            this.updateSliderPosition();
          });
        });
    });

    this.setupResizeObserver();
    this.setupDocumentClickListener();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
    this.removeDocumentClickListener();
  }

  private loadFacultyInfo(): void {
    this.facultyName = this.cookieService.get('user_name');
    this.facultyEmail = this.cookieService.get('user_email');
  }

  toggleDropdown(event: Event) {
    event.stopPropagation();
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  closeDropdown() {
    this.isDropdownOpen = false;
  }

  toggleTheme() {
    this.themeService.toggleTheme();
  }

  setupSlider() {
    const navbar = this.el.nativeElement.querySelector('.header-navbar');
    const navItems = navbar.querySelectorAll('a');

    navItems.forEach((item: HTMLElement) => {
      item.addEventListener('click', () => {
        this.isInitialLoad = false;
        this.updateSliderPosition();
      });
    });
  }

  setupResizeObserver() {
    const navbar = this.el.nativeElement.querySelector('.header-navbar');

    this.resizeObserver = new ResizeObserver(() => {
      this.ngZone.run(() => {
        this.updateSliderPosition();
      });
    });

    this.resizeObserver.observe(navbar);
  }

  private setupDocumentClickListener() {
    this.documentClickListener = this.renderer.listen(
      'document',
      'click',
      (event: Event) => {
        const dropdownElement =
          this.el.nativeElement.querySelector('.dropdown-menu');
        const profileIconElement =
          this.el.nativeElement.querySelector('.profile-icon');

        if (
          !dropdownElement?.contains(event.target as Node) &&
          !profileIconElement?.contains(event.target as Node)
        ) {
          this.ngZone.run(() => {
            this.closeDropdown();
          });
        }
      }
    );
  }

  private removeDocumentClickListener() {
    if (this.documentClickListener) {
      this.documentClickListener();
    }
  }

  updateSliderPosition() {
    const navbar = this.el.nativeElement.querySelector('.header-navbar');
    const slider = navbar.querySelector('.slider');
    const activeItem = navbar.querySelector('a.active');

    if (activeItem) {
      if (this.isInitialLoad) {
        this.renderer.setStyle(slider, 'transition', 'none');
        this.renderer.setStyle(slider, 'width', `${activeItem.offsetWidth}px`);
        this.renderer.setStyle(slider, 'left', `${activeItem.offsetLeft}px`);
        this.renderer.setStyle(slider, 'opacity', '1');
        this.renderer.setStyle(slider, 'transform', 'scale(1)');

        slider.offsetHeight;
        this.renderer.removeStyle(slider, 'transition');
      } else {
        this.renderer.setStyle(slider, 'width', `${activeItem.offsetWidth}px`);
        this.renderer.setStyle(slider, 'left', `${activeItem.offsetLeft}px`);
        this.renderer.setStyle(slider, 'opacity', '1');
        this.renderer.setStyle(slider, 'transform', 'scale(1)');
      }
    } else {
      this.renderer.setStyle(slider, 'opacity', '0');
      this.renderer.setStyle(slider, 'transform', 'scale(0.95)');
    }

    this.isInitialLoad = false;
  }

  logout() {
    const confirmDialogRef = this.dialog.open(DialogGenericComponent, {
      data: {
        title: 'Log Out',
        content:
          'Are you sure you want to log out? This will end your current session.',
        actionText: 'Log Out',
        cancelText: 'Cancel',
        action: 'Log Out',
      } as DialogData,
      disableClose: true,
      panelClass: 'dialog-base',
    });

    confirmDialogRef.afterClosed().subscribe((result) => {
      console.log('Dialog result:', result);
      if (result === 'Log Out') {
        const loadingDialogRef = this.dialog.open(DialogGenericComponent, {
          data: {
            title: 'Logging Out',
            content: 'Currently logging you out...',
            showProgressBar: true,
          } as DialogData,
          disableClose: true,
        });

        this.authService.logout().subscribe({
          next: (response) => {
            console.log('Logout successful', response);

            this.authService.clearCookies();

            loadingDialogRef.close();
            this.router.navigate(['/login']);
          },
          error: (error) => {
            console.error('Logout failed', error);
            loadingDialogRef.close();
          },
        });
      }
    });
  }
}