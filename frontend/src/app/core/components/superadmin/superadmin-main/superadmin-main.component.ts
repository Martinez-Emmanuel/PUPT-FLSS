import { Component, inject, OnInit, ViewChild, AfterViewInit, OnDestroy, ElementRef, Renderer2, NgZone } from '@angular/core';
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
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';

import { MatSymbolDirective } from '../../../imports/mat-symbol.directive';
import { DialogGenericComponent, DialogData } from '../../../../shared/dialog-generic/dialog-generic.component';
import { slideInAnimation, fadeAnimation } from '../../../animations/animations';

import { AuthService } from '../../../services/auth/auth.service';
import { ThemeService } from '../../../services/theme/theme.service';
import { CookieService } from 'ngx-cookie-service';
import { DialogChangePasswordComponent } from '../../../../shared/dialog-change-password/dialog-change-password.component';

@Component({
  selector: 'app-superadmin-main',
  templateUrl: './superadmin-main.component.html',
  styleUrls: ['./superadmin-main.component.scss'],
  imports: [
    CommonModule,
    RouterModule,
    MatToolbarModule,
    MatButtonModule,
    MatSidenavModule,
    MatListModule,
    MatIconModule,
    MatSymbolDirective,
    MatTooltipModule,
  ],
  animations: [fadeAnimation, slideInAnimation],
})
export class SuperadminMainComponent
  implements OnInit, AfterViewInit, OnDestroy
{
  @ViewChild('drawer') drawer!: MatSidenav;

  private breakpointObserver = inject(BreakpointObserver);
  private documentClickListener!: () => void;
  public showSidenav = false;
  public isDropdownOpen = false;
  public pageTitle = 'Dashboard';
  public accountName!: string;
  public accountRole!: string;

  private routeTitleMap: Record<string, string> = {
    dashboard: 'Dashboard',
    programs: 'Programs',
    courses: 'Courses',
    curriculum: 'Curriculum',
    rooms: 'Rooms',
    'manage-admin': 'Manage Admin',
    'manage-faculty': 'Manage Faculty',
  };

  isHandset$: Observable<boolean> = this.breakpointObserver
    .observe(Breakpoints.Handset)
    .pipe(
      map((result) => result.matches),
      shareReplay(),
    );

  constructor(
    public themeService: ThemeService,
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
    private dialog: MatDialog,
    private cookieService: CookieService,
    private el: ElementRef,
    private renderer: Renderer2,
    private ngZone: NgZone,
  ) {}

  ngOnInit(): void {
    this.initializeUserData();
    this.router.events
      .pipe(
        filter(
          (event): event is NavigationEnd => event instanceof NavigationEnd,
        ),
      )
      .subscribe(() => this.setPageTitle());

    this.setPageTitle();
  }

  ngAfterViewInit() {
    this.setupDocumentClickListener();
  }

  ngOnDestroy() {
    this.removeDocumentClickListener();
  }

  private initializeUserData(): void {
    this.accountName = this.cookieService.get('user_name');
    this.accountRole = this.toTitleCase(this.cookieService.get('user_role'));
  }

  public toggleTheme() {
    this.themeService.toggleTheme();
  }

  public toggleDropdown(event: Event) {
    event.stopPropagation();
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  public closeDropdown() {
    this.isDropdownOpen = false;
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
      },
    );
  }

  private removeDocumentClickListener() {
    if (this.documentClickListener) {
      this.documentClickListener();
    }
  }

  private toTitleCase(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  private setPageTitle(): void {
    const childRoute = this.findDeepestChild(this.route);
    const pageTitle =
      childRoute?.snapshot.data['pageTitle'] ||
      this.routeTitleMap[this.router.url.split('/').pop() || ''] ||
      'Dashboard';
    this.pageTitle = childRoute?.snapshot.data['curriculumYear']
      ? `${pageTitle} ${childRoute.snapshot.data['curriculumYear']}`
      : pageTitle;
  }

  private findDeepestChild(route: ActivatedRoute): ActivatedRoute | null {
    let child = route.firstChild;
    while (child?.firstChild) {
      child = child.firstChild;
    }
    return child;
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

  public openChangePasswordDialog() {
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
