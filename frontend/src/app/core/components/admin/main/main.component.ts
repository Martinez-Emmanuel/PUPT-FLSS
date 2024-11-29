import { Component, inject, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule, AsyncPipe } from '@angular/common';
import { RouterModule, Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';

import { Observable } from 'rxjs';
import { map, shareReplay, filter } from 'rxjs/operators';

import { MatSidenav, MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { MatRippleModule } from '@angular/material/core';
import { MatTooltipModule } from '@angular/material/tooltip';

import { MatSymbolDirective } from '../../../imports/mat-symbol.directive';
import { DialogGenericComponent, DialogData } from '../../../../shared/dialog-generic/dialog-generic.component';
import { slideInAnimation, fadeAnimation } from '../../../animations/animations';

import { AuthService } from '../../../services/auth/auth.service';
import { ThemeService } from '../../../services/theme/theme.service';
import { CookieService } from 'ngx-cookie-service';

@Component({
    selector: 'app-main',
    templateUrl: './main.component.html',
    styleUrls: ['./main.component.scss'],
    imports: [
        CommonModule,
        RouterModule,
        AsyncPipe,
        MatToolbarModule,
        MatButtonModule,
        MatSidenavModule,
        MatListModule,
        MatIconModule,
        MatRippleModule,
        MatTooltipModule,
        MatSymbolDirective,
    ],
    animations: [fadeAnimation, slideInAnimation]
})
export class MainComponent implements OnInit, AfterViewInit {
  @ViewChild('drawer') drawer!: MatSidenav;
  isReportsView: boolean = false;

  private breakpointObserver = inject(BreakpointObserver);
  public showSidenav = false;
  public pageTitle = '';
  public accountName: string;
  public accountRole: string;

  isHandset$: Observable<boolean> = this.breakpointObserver
    .observe(Breakpoints.Handset)
    .pipe(
      map((result) => result.matches),
      shareReplay()
    );

  constructor(
    public themeService: ThemeService,
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
    private dialog: MatDialog,
    private cookieService: CookieService
  ) {
    this.accountName = this.cookieService.get('user_name');
    this.accountRole = this.toTitleCase(this.cookieService.get('user_role'));
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.isReportsView = event.urlAfterRedirects.includes('/reports');
      });
  }

  ngOnInit(): void {
    this.router.events
      .pipe(
        filter(
          (event): event is NavigationEnd => event instanceof NavigationEnd
        )
      )
      .subscribe(() => this.setPageTitle());

    this.setPageTitle();
  }

  ngAfterViewInit() {
    setTimeout(() => (this.showSidenav = true), 0);
  }

  toggleTheme() {
    this.themeService.toggleTheme();
  }

  private toTitleCase(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  private setPageTitle(): void {
    const pageTitle =
      this.route.snapshot.firstChild?.data['pageTitle'];
    this.pageTitle = pageTitle;
  }

  public logout() {
    const confirmDialogRef = this.dialog.open<
      DialogGenericComponent,
      DialogData,
      string
    >(DialogGenericComponent, {
      data: {
        title: 'Log Out',
        content:
          'Are you sure you want to log out? This will end your current session.',
        actionText: 'Log Out',
        cancelText: 'Cancel',
        action: 'Log Out',
      },
      disableClose: true,
      panelClass: 'dialog-base'
    });

    confirmDialogRef.afterClosed().subscribe((result) => {
      if (result === 'Log Out') {
        this.showLoadingAndLogout();
      }
    });
  }

  private showLoadingAndLogout() {
    const loadingDialogRef = this.dialog.open(DialogGenericComponent, {
      data: {
        title: 'Logging Out',
        content: 'Currently logging you out...',
        showProgressBar: true,
      },
      disableClose: true,
    });

    this.authService.logout().subscribe({
      next: () => {
        this.cookieService.deleteAll('/');
        loadingDialogRef.close();
        this.router.navigate(['/login']);
      },
      error: (error) => {
        console.error('Logout failed', error);
        loadingDialogRef.close();
      },
    });
  }
}
