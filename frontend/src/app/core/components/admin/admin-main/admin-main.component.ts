import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
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
import { DialogChangePasswordComponent } from '../../../../shared/dialog-change-password/dialog-change-password.component';

import { AuthService } from '../../../services/auth/auth.service';
import { ThemeService } from '../../../services/theme/theme.service';
import { CookieService } from 'ngx-cookie-service';

import { slideInAnimation, fadeAnimation } from '../../../animations/animations';

@Component({
  selector: 'app-admin-main',
  templateUrl: './admin-main.component.html',
  styleUrls: ['./admin-main.component.scss'],
  imports: [
    CommonModule,
    RouterModule,
    MatToolbarModule,
    MatButtonModule,
    MatSidenavModule,
    MatListModule,
    MatIconModule,
    MatRippleModule,
    MatTooltipModule,
    MatSymbolDirective,
  ],
  animations: [fadeAnimation, slideInAnimation],
})
export class AdminMainComponent implements OnInit {
  @ViewChild('drawer') drawer!: MatSidenav;

  private breakpointObserver = inject(BreakpointObserver);
  public pageTitle = '';
  public accountName!: string;
  public accountRole!: string;
  public isReportsView: boolean = false;

  public isHandset$: Observable<boolean> = this.breakpointObserver
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
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.isReportsView = event.urlAfterRedirects.includes('/reports');
      });
  }

  ngOnInit(): void {
    this.initializeUserData();

    this.router.events
      .pipe(
        filter(
          (event): event is NavigationEnd => event instanceof NavigationEnd
        )
      )
      .subscribe(() => this.setPageTitle());

    this.setPageTitle();
  }

  private initializeUserData(): void {
    this.accountName = this.cookieService.get('user_name');
    this.accountRole = this.toTitleCase(this.cookieService.get('user_role'));
  }

  public toggleTheme() {
    this.themeService.toggleTheme();
  }

  private toTitleCase(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  private setPageTitle(): void {
    const pageTitle = this.route.snapshot.firstChild?.data['pageTitle'];
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
      panelClass: 'dialog-base',
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
        loadingDialogRef.close();
      },
    });
  }

  openChangePasswordDialog() {
    const dialogRef = this.dialog.open(DialogChangePasswordComponent, {
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result?.message) {
        const successDialogConfig: DialogData = {
          title: 'Success!',
          content: result.message,
          showProgressBar: false,
          actionText: 'Close',
        };

        this.dialog.open(DialogGenericComponent, {
          data: successDialogConfig,
          disableClose: true,
        });
      }
    });
  }
}
