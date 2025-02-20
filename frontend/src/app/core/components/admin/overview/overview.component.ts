import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, takeUntil, forkJoin } from 'rxjs';

import { MatDialog } from '@angular/material/dialog';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSymbolDirective } from '../../../imports/mat-symbol.directive';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { DialogActionComponent, DialogActionData } from '../../../../shared/dialog-action/dialog-action.component';
import { DialogTogglePreferencesComponent, DialogTogglePreferencesData } from '../../../../shared/dialog-toggle-preferences/dialog-toggle-preferences.component';
import { LoadingComponent } from '../../../../shared/loading/loading.component';

import { OverviewService, OverviewDetails, RequestNotification } from '../../../services/admin/overview/overview.service';
import { PreferencesService } from '../../../services/faculty/preference/preferences.service';
import { CookieService } from 'ngx-cookie-service';

import { fadeAnimation, cardEntranceSide } from '../../../animations/animations';
import { CommonModule } from '@angular/common';

interface CurriculumInfo {
  curriculum_id: number;
  curriculum_year: string;
}

@Component({
  selector: 'app-overview',
  imports: [
    CommonModule,
    MatSymbolDirective,
    MatDialogModule,
    MatTooltipModule,
    LoadingComponent,
    MatProgressSpinnerModule,
  ],
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.scss'],
  animations: [fadeAnimation, cardEntranceSide],
})
export class OverviewComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();
  private readonly ANIMATION_DELAY = 100;
  private readonly SNACKBAR_DURATION = 3000;

  // Admin info
  adminName: string = '';

  // Academic info
  activeYear = 'N/A';
  activeSemester = 'N/A';
  activeFacultyCount = 0;
  activeProgramsCount = 0;
  activeCurricula: CurriculumInfo[] = [
    { curriculum_id: 0, curriculum_year: '0' },
  ];
  globalDeadline: string | null = null;
  globalStartDate: string | null = null;

  // Progress metrics
  preferencesProgress = 0;
  schedulingProgress = 0;
  roomUtilization = 0;
  publishProgress = 0;

  // State flags
  isLoading = true;
  preferencesEnabled = true;
  schedulesPublished = false;
  notificationsLoaded = false;
  facultyWithSchedulesCount = 0;

  requestNotifications: RequestNotification[] = [];

  isAnimatingOut = false;

  constructor(
    private cdr: ChangeDetectorRef,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private overviewService: OverviewService,
    private preferencesService: PreferencesService,
    private cookieService: CookieService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initializeAdminInfo();
    this.loadAllData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeAdminInfo(): void {
    const fullName = this.cookieService.get('user_name');
    this.adminName = fullName.split(' ')[0];
  }

  private loadAllData(resetAnimation = true): void {
    this.isLoading = true;
    this.notificationsLoaded = false;

    forkJoin({
      overview: this.overviewService.getOverviewDetails(),
      notifications: this.overviewService.getRequestNotifications(),
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.handleOverviewData(data.overview, resetAnimation);
          if (resetAnimation) {
            this.requestNotifications = [];
            this.cdr.detectChanges();

            setTimeout(() => {
              this.requestNotifications = data.notifications;
              this.notificationsLoaded = true;
              this.cdr.detectChanges();
            }, this.ANIMATION_DELAY);
          } else {
            this.requestNotifications = data.notifications;
            this.notificationsLoaded = true;
          }
          this.isLoading = false;
          this.cdr.detectChanges();
        },
        error: (error) => {
          this.handleError('Failed to load data. Please try again later.')(
            error
          );
          this.isLoading = false;
          this.notificationsLoaded = true;
        },
      });
  }

  /**
   * Processes overview data and updates component state
   */
  private handleOverviewData(
    data: OverviewDetails,
    resetAnimation: boolean
  ): void {
    // Update non-progress data
    this.updateBasicInfo(data);

    if (resetAnimation) {
      this.resetProgressMetrics();
      this.cdr.detectChanges();

      // Trigger animations after delay
      setTimeout(() => {
        this.updateProgressMetrics(data);
        this.cdr.detectChanges();
      }, this.ANIMATION_DELAY);
    } else {
      this.updateProgressMetrics(data);
      this.cdr.detectChanges();
    }
  }

  private updateBasicInfo(data: OverviewDetails): void {
    this.activeYear = data.activeAcademicYear;
    this.activeSemester = data.activeSemester;
    this.activeFacultyCount = data.activeFacultyCount;
    this.activeProgramsCount = data.activeProgramsCount;
    this.activeCurricula = data.activeCurricula;
    this.facultyWithSchedulesCount = data.facultyWithSchedulesCount;
    this.preferencesEnabled = data.preferencesSubmissionEnabled;
    this.schedulesPublished = data.publishProgress > 0;
    this.globalDeadline = data.global_deadline || null;
    this.globalStartDate = data.global_start_date || null;
  }

  private resetProgressMetrics(): void {
    this.preferencesProgress = 0;
    this.schedulingProgress = 0;
    this.roomUtilization = 0;
    this.publishProgress = 0;
  }

  private updateProgressMetrics(data: OverviewDetails): void {
    this.preferencesProgress = data.preferencesProgress;
    this.schedulingProgress = data.schedulingProgress;
    this.roomUtilization = data.roomUtilization;
    this.publishProgress = data.publishProgress;
  }

  getCircleOffset(percentage: number): number {
    const circumference = 2 * Math.PI * 45;
    return circumference - (percentage / 100) * circumference;
  }

  // ================
  // Toggle Methods
  // ================

  togglePreferencesSubmission(): void {
    const deadlineDate = this.globalDeadline
      ? new Date(this.globalDeadline)
      : null;

    const StartDate = this.globalStartDate
      ? new Date(this.globalStartDate)
      : null;

    const dialogData: DialogTogglePreferencesData = {
      type: 'all_preferences',
      academicYear: this.activeYear,
      semester: this.activeSemester,
      hasSecondaryText: true,
      currentState: this.preferencesEnabled,
      global_deadline: deadlineDate,
      global_start_date: StartDate,
    };

    const dialogRef = this.dialog.open(DialogTogglePreferencesComponent, {
      data: dialogData,
      disableClose: true,
      autoFocus: false,
    });

    dialogRef.afterClosed().subscribe((result: boolean) => {
      if (result) {
        this.loadAllData(true);
      }
    });
  }

  togglePublishSchedules(): void {
    if (this.facultyWithSchedulesCount === 0) {
      this.showSchedulingRedirectMessage();
      return;
    }

    const dialogData: DialogActionData = {
      type: 'all_publish',
      academicYear: this.activeYear,
      semester: this.activeSemester,
      currentState: this.schedulesPublished,
      hasSecondaryText: true,
    };

    const dialogRef = this.dialog.open(DialogActionComponent, {
      data: dialogData,
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((result: boolean) => {
      if (result) {
        this.loadAllData(true);
      }
    });
  }

  generateReports(): void {
    if (this.facultyWithSchedulesCount === 0) {
      this.showSchedulingRedirectMessage();
      return;
    }

    const dialogRef = this.dialog.open(DialogActionComponent, {
      data: {
        type: 'reports',
        academicYear: this.activeYear,
        semester: this.activeSemester,
      },
      disableClose: true,
    });
  }

  private showSchedulingRedirectMessage(): void {
    const snackBarRef = this.snackBar.open(
      'No schedule has been made yet.',
      'Go to Scheduling',
      {
        duration: this.SNACKBAR_DURATION,
      }
    );

    snackBarRef.onAction().subscribe(() => {
      this.navigateToScheduling();
    });
  }

  private navigateToScheduling(): void {
    this.router.navigate(['/admin/scheduling']);
  }

  // ======================
  // Request Action Methods
  // ======================

  approveRequest(request: RequestNotification): void {
    const dialogData: DialogTogglePreferencesData = {
      type: 'single_preferences',
      academicYear: this.activeYear,
      semester: this.activeSemester,
      currentState: false,
      facultyName: request.faculty_name,
      faculty_id: request.faculty_id,
      global_deadline: this.globalDeadline
        ? new Date(this.globalDeadline)
        : null,
      global_start_date: this.globalStartDate
        ? new Date(this.globalStartDate)
        : null,
    };

    const dialogRef = this.dialog.open(DialogTogglePreferencesComponent, {
      data: dialogData,
      disableClose: true,
      autoFocus: false,
    });

    dialogRef.afterClosed().subscribe((result: boolean) => {
      if (result) {
        this.preferencesService
          .cancelRequestAccess(request.faculty_id.toString())
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: () => {
              this.isAnimatingOut = true;
              this.requestNotifications = this.requestNotifications.filter(
                (r) => r.faculty_id !== request.faculty_id
              );
              this.cdr.detectChanges();

              setTimeout(() => {
                this.isAnimatingOut = false;
                this.cdr.detectChanges();
              }, 600);

              this.showSuccessMessage(
                'Faculty preferences access has been enabled.'
              );
            },
            error: this.handleError(
              'Failed to process request. Please try again.'
            ),
          });
      }
    });
  }

  discardRequest(request: RequestNotification): void {
    const discardedRequest = { ...request };

    this.isAnimatingOut = true;
    this.requestNotifications = this.requestNotifications.filter(
      (r) => r.faculty_id !== request.faculty_id
    );
    this.cdr.detectChanges();

    const snackBarRef = this.snackBar.open(
      'Faculty request has been discarded.',
      'Undo',
      { duration: 3000 }
    );

    const cancelAction = new Subject<void>();
    let animationTimeout: any;

    snackBarRef
      .onAction()
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        cancelAction.next();
        cancelAction.complete();

        clearTimeout(animationTimeout);
        this.isAnimatingOut = false;
        this.requestNotifications = [
          ...this.requestNotifications,
          discardedRequest,
        ];
        this.cdr.detectChanges();
        this.showSuccessMessage('Action cancelled.');
      });

    animationTimeout = setTimeout(() => {
      this.isAnimatingOut = false;
      this.cdr.detectChanges();
    }, 600);

    snackBarRef
      .afterDismissed()
      .pipe(takeUntil(this.destroy$))
      .subscribe((dismissedByAction) => {
        if (!dismissedByAction.dismissedByAction) {
          this.preferencesService
            .cancelRequestAccess(request.faculty_id.toString())
            .pipe(takeUntil(this.destroy$), takeUntil(cancelAction))
            .subscribe({
              next: () => {
                this.cdr.detectChanges();
              },
              error: (error) => {
                this.requestNotifications = [
                  ...this.requestNotifications,
                  discardedRequest,
                ];
                this.cdr.detectChanges();
                this.handleError(
                  'Failed to discard request. Please try again.'
                )(error);
              },
            });
        }
      });
  }

  // ================
  // Utility Methods
  // ================

  private showSuccessMessage(message: string): void {
    this.snackBar.open(message, 'Close', { duration: this.SNACKBAR_DURATION });
  }

  private showErrorMessage(message: string): void {
    this.snackBar.open(message, 'Close', { duration: this.SNACKBAR_DURATION });
  }

  private handleError(errorMessage: string) {
    return (error: any) => {
      this.showErrorMessage(errorMessage);
      this.isLoading = false;
    };
  }
}
