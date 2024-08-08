import { Component, AfterViewInit, ElementRef, Renderer2, OnDestroy, NgZone } from '@angular/core';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { filter, takeUntil } from 'rxjs/operators';
import { Subject, fromEvent } from 'rxjs';
import { CommonModule } from '@angular/common';
import { MaterialComponents } from '../../../imports/material.component';
import { ThemeService } from '../../../services/theme/theme.service';
import { MatSymbolDirective } from '../../../imports/mat-symbol.directive';
import { AuthService } from '../../../services/auth/auth.service'; // Add this import

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss'],
  standalone: true,
  imports: [RouterModule, CommonModule, MatSymbolDirective, MaterialComponents],
})
export class MainComponent implements AfterViewInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private isInitialLoad = true;
  private resizeObserver!: ResizeObserver;
  public isDropdownOpen = false;
  public isLoading = false; // Add this variable

  constructor(
    private el: ElementRef,
    private renderer: Renderer2,
    private router: Router,
    private ngZone: NgZone,
    public themeService: ThemeService,
    private authService: AuthService // Add this parameter
  ) {}

  ngAfterViewInit() {
    this.setupSlider();

    // Listen to router events
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        setTimeout(() => this.updateSliderPosition(), 0);
      });

    // Initial update
    setTimeout(() => this.updateSliderPosition(), 0);

    // Listen for window resize events
    this.ngZone.runOutsideAngular(() => {
      fromEvent(window, 'resize')
        .pipe(takeUntil(this.destroy$))
        .subscribe(() => {
          this.ngZone.run(() => {
            this.updateSliderPosition();
          });
        });
    });

    // Use ResizeObserver to watch for navbar size changes
    this.setupResizeObserver();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
  }

  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
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

  updateSliderPosition() {
    const navbar = this.el.nativeElement.querySelector('.header-navbar');
    const slider = navbar.querySelector('.slider');
    const activeItem = navbar.querySelector('a.active');

    if (activeItem) {
      if (this.isInitialLoad) {
        // Instantly set position without transition
        this.renderer.setStyle(slider, 'transition', 'none');
        this.renderer.setStyle(slider, 'width', `${activeItem.offsetWidth}px`);
        this.renderer.setStyle(slider, 'left', `${activeItem.offsetLeft}px`);
        this.renderer.setStyle(slider, 'opacity', '1');
        this.renderer.setStyle(slider, 'transform', 'scale(1)');

        // Force a reflow
        slider.offsetHeight;

        // Re-enable transitions
        this.renderer.removeStyle(slider, 'transition');
      } else {
        // Animate to new position
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
    this.isLoading = true; // Start the spinner
    this.authService.logout().subscribe(
      response => {
        console.log('Logout successful', response);
        sessionStorage.clear();
        this.isLoading = false; 
        this.router.navigate(['/login']);
      },
      error => {
        console.error('Logout failed', error);
        this.isLoading = false; 
      }
    );
  }
}
