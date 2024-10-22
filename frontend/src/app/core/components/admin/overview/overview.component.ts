import { Component, OnInit, ChangeDetectorRef } from '@angular/core';

import { MatDialog } from '@angular/material/dialog';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarRef } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSymbolDirective } from '../../../imports/mat-symbol.directive';

import { DialogGenericComponent } from '../../../../shared/dialog-generic/dialog-generic.component';
import { LoadingComponent } from '../../../../shared/loading/loading.component';

import { OverviewService, OverviewDetails } from '../../../services/admin/overview/overview.service';

import { fadeAnimation } from '../../../animations/animations';

@Component({
  selector: 'app-overview',
  standalone: true,
  imports: [
    MatSymbolDirective,
    MatDialogModule,
    MatTooltipModule,
    LoadingComponent,
  ],
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.scss'],
  animations: [fadeAnimation],
})
export class OverviewComponent implements OnInit {
  activeYear: string = '';
  activeSemester: string = '';

  activeFacultyCount: number = 0;
  activeProgramsCount: number = 0;
  activeCurricula: Array<{ curriculum_id: number; curriculum_year: string }> =
    [];

  preferencesProgress: number = 0;
  schedulingProgress: number = 0;
  roomUtilization: number = 0;
  publishProgress: number = 0;

  facultyWithSchedulesCount: number = 0;

  isLoading = true;

  preferencesEnabled: boolean = true;
  schedulesPublished: boolean = false;

  constructor(
    private cdr: ChangeDetectorRef,
    public dialog: MatDialog,
    private snackBar: MatSnackBar,
    private overviewService: OverviewService
  ) {}

  ngOnInit() {
    this.fetchOverviewDetails();
  }

  fetchOverviewDetails() {
    this.overviewService.getOverviewDetails().subscribe({
      next: (data: OverviewDetails) => {
        this.activeYear = data.activeAcademicYear;
        this.activeSemester = data.activeSemester;
        this.activeFacultyCount = data.activeFacultyCount;
        this.activeProgramsCount = data.activeProgramsCount;
        this.activeCurricula = data.activeCurricula;

        this.preferencesProgress = data.preferencesProgress;
        this.schedulingProgress = data.schedulingProgress;
        this.roomUtilization = data.roomUtilization;
        this.publishProgress = data.publishProgress;

        this.facultyWithSchedulesCount = data.facultyWithSchedulesCount;

        this.preferencesEnabled = data.preferencesSubmissionEnabled;
        this.schedulesPublished = data.publishProgress > 0;

        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error fetching overview details:', error);
        this.snackBar.open(
          'Failed to load overview details. Please try again later.',
          'Close',
          {
            duration: 3000,
          }
        );
        this.isLoading = false;
      },
    });
  }

  getCircleOffset(percentage: number): number {
    const circumference = 2 * Math.PI * 45;
    return circumference - (percentage / 100) * circumference;
  }

  openSendEmailDialog(): void {
    const dialogRef = this.dialog.open(DialogGenericComponent, {
      data: {
        title: 'Send Email to All Faculty',
        content: `Send an email to all the faculty members to submit their load 
          and schedule preference for the current semester. 
          Click "Send Email" below to proceed.`,
        actionText: 'Send Email',
        cancelText: 'Cancel',
        action: 'send-email',
      },
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result === 'send-email') {
        this.sendEmailToFaculty();
      }
    });
  }

  sendEmailToFaculty() {
    const sendingSnackBarRef: MatSnackBarRef<any> = this.snackBar.open(
      'Sending emails. Please wait...',
      'Close',
      { duration: undefined }
    );

    this.overviewService.sendEmails().subscribe({
      next: () => {
        sendingSnackBarRef.dismiss();
        this.snackBar.open('Emails sent successfully!', 'Close', {
          duration: 3000,
        });
      },
      error: (error) => {
        sendingSnackBarRef.dismiss();
        this.snackBar.open(
          'Failed to send emails. Please try again.',
          'Close',
          {
            duration: 3000,
          }
        );
        console.error('Error sending email:', error);
      },
    });
  }

  togglePreferencesSubmission() {
    const newStatus = !this.preferencesEnabled;

    this.overviewService.togglePreferencesSettings(newStatus).subscribe({
      next: (response) => {
        this.snackBar.open(
          `Faculty Preferences Submission ${
            newStatus ? 'enabled' : 'disabled'
          } successfully.`,
          'Close',
          { duration: 3000 }
        );
        this.fetchOverviewDetails();
      },
      error: (error) => {
        console.error('Error toggling preferences settings:', error);
        this.snackBar.open(
          `Failed to ${
            newStatus ? 'enable' : 'disable'
          } Faculty Preferences Submission. Please try again.`,
          'Close',
          { duration: 3000 }
        );
      },
    });
  }

  togglePublishSchedules() {
    if (this.facultyWithSchedulesCount === 0) {
      this.snackBar.open('No faculty has been scheduled yet.', 'Close', {
        duration: 3000,
      });
      return;
    }

    const newStatus = !this.schedulesPublished;

    this.overviewService.toggleAllSchedules(newStatus).subscribe({
      next: (response) => {
        this.snackBar.open(
          `Faculty Load and Schedule ${
            newStatus ? 'published' : 'unpublished'
          } successfully.`,
          'Close',
          { duration: 3000 }
        );
        this.fetchOverviewDetails();
      },
      error: (error) => {
        console.error('Error toggling schedule publication:', error);
        this.snackBar.open(
          `Failed to ${
            newStatus ? 'publish' : 'unpublish'
          } Faculty Load and Schedule. Please try again.`,
          'Close',
          { duration: 3000 }
        );
      },
    });
  }
}
