import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';

import { Subject, takeUntil } from 'rxjs';

import { MatDialog } from '@angular/material/dialog';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSymbolDirective } from '../../../imports/mat-symbol.directive';

import { DialogActionComponent, DialogActionData } from '../../../../shared/dialog-action/dialog-action.component';
import { DialogTogglePreferencesComponent, DialogTogglePreferencesData } from '../../../../shared/dialog-toggle-preferences/dialog-toggle-preferences.component';
import { LoadingComponent } from '../../../../shared/loading/loading.component';

import { OverviewService, OverviewDetails } from '../../../services/admin/overview/overview.service';

import { fadeAnimation } from '../../../animations/animations';

interface CurriculumInfo {
  curriculum_id: number;
  curriculum_year: string;
}

@Component({
    selector: 'app-overview',
    imports: [
        MatSymbolDirective,
        MatDialogModule,
        MatTooltipModule,
        LoadingComponent,
    ],
    templateUrl: './overview.component.html',
    styleUrls: ['./overview.component.scss'],
    animations: [fadeAnimation]
})
export class OverviewComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();
  private readonly ANIMATION_DELAY = 100;
  private readonly SNACKBAR_DURATION = 3000;

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
  facultyWithSchedulesCount = 0;

  constructor(
    private cdr: ChangeDetectorRef,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private overviewService: OverviewService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.fetchOverviewDetails(true);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Fetches overview details and updates component state
   * @param resetAnimation - Whether to reset progress animations
   */
  fetchOverviewDetails(resetAnimation = false): void {
    this.overviewService
      .getOverviewDetails()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: OverviewDetails) =>
          this.handleOverviewData(data, resetAnimation),
        error: this.handleError(
          'Failed to load overview details. Please try again later.'
        ),
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
      this.isLoading = false;
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
        this.fetchOverviewDetails();
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
        this.fetchOverviewDetails();
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

    dialogRef.afterClosed().subscribe((result) => {
      console.log('Export All dialog closed', result);
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
      console.error('Operation failed:', error);
      this.showErrorMessage(errorMessage);
      this.isLoading = false;
    };
  }
}
