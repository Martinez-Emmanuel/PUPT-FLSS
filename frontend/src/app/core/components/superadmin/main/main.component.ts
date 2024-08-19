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
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        this.setPageTitle();
      });

    this.setPageTitle();
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

    // If no title is found in route data, fallback to URL-based title
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
  //for logout
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
  
        this.authService.logout().subscribe(
          (response) => {
            console.log('Logout successful', response);
            sessionStorage.clear();
            loadingDialogRef.close();
            this.router.navigate(['/login']);
          },
          (error) => {
            console.error('Logout failed', error);
            loadingDialogRef.close();
          }
        );
      }
    });
  }
}