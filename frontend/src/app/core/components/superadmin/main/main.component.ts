import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AsyncPipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';

import { Observable } from 'rxjs';
import { map, shareReplay, filter } from 'rxjs/operators';

import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';

import { ThemeService } from '../../../services/theme/theme.service';
import { MaterialComponents } from '../../../imports/material.component';
import { MatSymbolDirective } from '../../../imports/mat-symbol.directive';
import { AuthService } from '../../../services/auth/auth.service';
import { MatDialog } from '@angular/material/dialog';
import { DialogGenericComponent, DialogData } from '../../../../shared/dialog-generic/dialog-generic.component';
import { CookieService } from 'ngx-cookie-service'; 

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss'],
  standalone: true,
  imports: [
    MatToolbarModule,
    MatButtonModule,
    MatSidenavModule,
    MatListModule,
    MatIconModule,
    AsyncPipe,
    RouterModule,
    MaterialComponents,
    MatSymbolDirective,
    CommonModule,
  ],
})
export class MainComponent implements OnInit {
  private breakpointObserver = inject(BreakpointObserver);
  public isDropdownOpen = false;
  public pageTitle!: string;
  public accountName: string | null = '';  
  public accountRole: string | null = ''; 

  private routeTitleMap: { [key: string]: string } = {
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
      shareReplay()
    );

  constructor(
    public themeService: ThemeService,
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
    private dialog: MatDialog,
    private cookieService: CookieService  
  ) {}

  ngOnInit(): void {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        this.setPageTitle();
      });

    this.setPageTitle();

    this.accountName = this.cookieService.get('user_name');
    this.accountRole = this.cookieService.get('user_role');
  }

  private setPageTitle(): void {
    let child = this.route.firstChild;
    while (child) {
      if (child.firstChild) {
        child = child.firstChild;
      } else if (child.snapshot.data['pageTitle']) {
        let title = child.snapshot.data['pageTitle'];
        if (child.snapshot.data['curriculumYear']) {
          title += ` ${child.snapshot.data['curriculumYear']}`;
        }
        this.pageTitle = title;
        return;
      } else {
        break;
      }
    }

    const urlSegments = this.router.url.split('/').filter((segment) => segment);
    const lastSegment = urlSegments[urlSegments.length - 1];
    this.pageTitle = this.routeTitleMap[lastSegment] || 'Dashboard';
  }

  toggleTheme() {
    this.themeService.toggleTheme();
  }

  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  logout() {
    const confirmDialogRef = this.dialog.open(DialogGenericComponent, {
      data: {
        title: 'Log Out',
        content: 'Are you sure you want to log out? This will end your current session.',
        actionText: 'Log Out',
        cancelText: 'Cancel',
        action: 'Log Out',
      } as DialogData,
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

            this.cookieService.deleteAll('/');

            loadingDialogRef.close();
            this.router.navigate(['/login']);
          },
          error: (error) => {
            console.error('Logout failed', error);
            loadingDialogRef.close();
          }
        });
      }
    });
  }
}
