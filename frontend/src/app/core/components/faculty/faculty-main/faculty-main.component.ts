import { Component, AfterViewInit, ElementRef, Renderer2, OnDestroy, NgZone, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';

import { MatDialog } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatBottomSheet, MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { MatRippleModule } from '@angular/material/core';
import { MatSymbolDirective } from '../../../imports/mat-symbol.directive';

import { Subject, fromEvent } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';

import { DialogGenericComponent, DialogData } from '../../../../shared/dialog-generic/dialog-generic.component';

import { ThemeService } from '../../../services/theme/theme.service';
import { AuthService } from '../../../services/auth/auth.service';
import { CookieService } from 'ngx-cookie-service';

import { slideUpDown } from '../../../animations/animations';

@Component({
  selector: 'app-faculty-main',
  templateUrl: './faculty-main.component.html',
  styleUrls: ['./faculty-main.component.scss'],
  imports: [
    RouterModule,
    CommonModule,
    MatTooltipModule,
    MatSymbolDirective,
    MatBottomSheetModule,
    MatRippleModule,
  ],
  animations: [slideUpDown],
})
export class FacultyMainComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('bottomSheetTemplate') bottomSheetTemplate!: TemplateRef<any>;

  private destroy$ = new Subject<void>();
  private isInitialLoad = true;
  private resizeObserver!: ResizeObserver;
  public isDropdownOpen = false;
  private documentClickListener!: () => void;

  private readonly MOBILE_BREAKPOINT = 512;
  private readonly SLIDER_TRANSITION_SCALE = 0.95;
  private readonly COOKIE_KEYS = {
    userName: 'user_name',
    userEmail: 'user_email',
  };
  private readonly DIALOG_CLASSES = {
    base: 'dialog-base',
  };
  private readonly SELECTORS = {
    navbar: '.header-navbar',
    slider: '.slider',
    activeLink: 'a.active',
    mobileDropdown: '.mobile-dropdown',
    dropdownMenu: '.dropdown-menu',
    bottomNavLastItem: '.bottom-nav-item:last-child',
    profileIcon: '.profile-icon',
  };

  public facultyName: string | null = '';
  public facultyEmail: string | null = '';

  constructor(
    public themeService: ThemeService,
    private el: ElementRef,
    private renderer: Renderer2,
    private router: Router,
    private ngZone: NgZone,
    private authService: AuthService,
    private dialog: MatDialog,
    private cookieService: CookieService,
    private bottomSheet: MatBottomSheet,
  ) {}

  ngOnInit(): void {
    this.loadFacultyInfo();
  }

  ngAfterViewInit() {
    this.setupSlider();
    this.setupNavigationEvents();
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
    this.facultyName = this.cookieService.get(this.COOKIE_KEYS.userName);
    this.facultyEmail = this.cookieService.get(this.COOKIE_KEYS.userEmail);
  }

  toggleDropdown(event: Event) {
    event.stopPropagation();

    if (window.innerWidth > this.MOBILE_BREAKPOINT) {
      const bottomSheetRef = this.bottomSheet.open(
        this.bottomSheetTemplate,
        {},
      );

      bottomSheetRef.afterDismissed().subscribe((result) => {
        if (result === 'theme') {
          this.toggleTheme();
        } else if (result === 'logout') {
          this.logout();
        }
      });
    } else {
      this.isDropdownOpen = !this.isDropdownOpen;
    }
  }

  closeDropdown() {
    this.isDropdownOpen = false;
  }

  toggleTheme() {
    this.themeService.toggleTheme();
  }

  private setupNavigationEvents() {
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntil(this.destroy$),
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
  }

  private setupSlider() {
    const navbar = this.el.nativeElement.querySelector(this.SELECTORS.navbar);
    const navItems = navbar.querySelectorAll('a');

    navItems.forEach((item: HTMLElement) => {
      item.addEventListener('click', () => {
        this.isInitialLoad = false;
        this.updateSliderPosition();
      });
    });
  }

  private setupResizeObserver() {
    const navbar = this.el.nativeElement.querySelector(this.SELECTORS.navbar);

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
        const dropdownElement = this.el.nativeElement.querySelector(
          window.innerWidth <= this.MOBILE_BREAKPOINT
            ? this.SELECTORS.mobileDropdown
            : this.SELECTORS.dropdownMenu,
        );
        const triggerElement = this.el.nativeElement.querySelector(
          window.innerWidth <= this.MOBILE_BREAKPOINT
            ? this.SELECTORS.bottomNavLastItem
            : this.SELECTORS.profileIcon,
        );

        if (
          !dropdownElement?.contains(event.target as Node) &&
          !triggerElement?.contains(event.target as Node)
        ) {
          this.ngZone.run(() => {
            this.closeDropdown();
          });
        }
      },
    );
  }

  private removeDocumentClickListener() {
    if (this.documentClickListener) {
      this.documentClickListener();
    }
  }

  updateSliderPosition() {
    const navbar = this.el.nativeElement.querySelector(this.SELECTORS.navbar);
    const slider = navbar.querySelector(this.SELECTORS.slider);
    const activeItem = navbar.querySelector(this.SELECTORS.activeLink);

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
      this.renderer.setStyle(
        slider,
        'transform',
        `scale(${this.SLIDER_TRANSITION_SCALE})`,
      );
    }

    this.isInitialLoad = false;
  }

  logout() {
    const dialogConfig: DialogData = {
      title: 'Log Out',
      content:
        'Are you sure you want to log out? This will end your current session.',
      actionText: 'Log Out',
      cancelText: 'Cancel',
      action: 'Log Out',
    };

    const confirmDialogRef = this.dialog.open(DialogGenericComponent, {
      data: dialogConfig,
      disableClose: true,
      panelClass: this.DIALOG_CLASSES.base,
    });

    confirmDialogRef.afterClosed().subscribe((result) => {
      if (result === dialogConfig.action) {
        const loadingDialogConfig: DialogData = {
          title: 'Logging Out',
          content: 'Currently logging you out...',
          showProgressBar: true,
        };

        const loadingDialogRef = this.dialog.open(DialogGenericComponent, {
          data: loadingDialogConfig,
          disableClose: true,
        });

        this.authService.logout().subscribe({
          next: () => {
            this.authService.clearCookies();

            loadingDialogRef.close();
            this.router.navigate(['/login']);
          },
          error: () => {
            loadingDialogRef.close();
          },
        });
      }
    });
  }

  onBottomSheetAction(action: string) {
    if (action === 'theme') {
      this.toggleTheme();
    } else if (action === 'logout') {
      this.logout();
    }
  }
}
