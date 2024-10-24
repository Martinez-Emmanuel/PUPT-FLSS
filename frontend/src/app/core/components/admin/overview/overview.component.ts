import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';

import { Subject, takeUntil } from 'rxjs';

import { MatDialog } from '@angular/material/dialog';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSymbolDirective } from '../../../imports/mat-symbol.directive';

import { DialogActionComponent, DialogActionData } from '../../../../shared/dialog-action/dialog-action.component';
import { LoadingComponent } from '../../../../shared/loading/loading.component';

import { OverviewService, OverviewDetails } from '../../../services/admin/overview/overview.service';

import { fadeAnimation } from '../../../animations/animations';

interface CurriculumInfo {
  curriculum_id: number;
  curriculum_year: string;
}

@Component({
  selector: 'app-overview',
  standalone: true,
  imports: [
    MatSymbolDirective,
    MatDialogModule,
    MatTooltipModule,
    LoadingComponent,
    DialogActionComponent,
  ],
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.scss'],
  animations: [fadeAnimation],
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
    private overviewService: OverviewService
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
    const dialogData: DialogActionData = {
      type: 'preferences',
      academicYear: this.activeYear,
      semester: this.activeSemester,
      currentState: this.preferencesEnabled,
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

  togglePublishSchedules(): void {
    if (this.facultyWithSchedulesCount === 0) {
      this.showErrorMessage('No faculty has been scheduled yet.');
      return;
    }

    const dialogData: DialogActionData = {
      type: 'publish',
      academicYear: this.activeYear,
      semester: this.activeSemester,
      currentState: this.schedulesPublished,
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
    const dialogRef = this.dialog.open(DialogActionComponent, {
      data: {
        type: 'reports',
        academicYear: this.activeYear,
        semester: this.activeSemester,
        currentState: false
      },
      disableClose: true,
    });
  
    dialogRef.afterClosed().subscribe((result: boolean) => {
      if (result) {
        // TODO: To be implemented later
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
      console.error('Operation failed:', error);
      this.showErrorMessage(errorMessage);
      this.isLoading = false;
    };
  }
}
