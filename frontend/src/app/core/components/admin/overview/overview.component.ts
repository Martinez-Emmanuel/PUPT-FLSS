import { Component, OnInit, AfterViewInit, ChangeDetectorRef } from '@angular/core';

import { MatDialog } from '@angular/material/dialog';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarRef } from '@angular/material/snack-bar';

import { DialogGenericComponent } from '../../../../shared/dialog-generic/dialog-generic.component';
import { MatSymbolDirective } from '../../../imports/mat-symbol.directive';

import { OverviewService } from '../../../services/admin/overview/overview.service';

import { fadeAnimation } from '../../../animations/animations';

@Component({
  selector: 'app-overview',
  standalone: true,
  imports: [MatSymbolDirective, MatDialogModule],
  templateUrl: './overview.component.html',
  styleUrl: './overview.component.scss',
  animations: [fadeAnimation],
})
export class OverviewComponent implements OnInit, AfterViewInit {
  activeYear = '2024-2025';
  activeSemester = '1st Semester';

  preferencesProgress = 75;
  schedulingProgress = 60;
  roomUtilizationProgress = 90;

  constructor(
    private cdr: ChangeDetectorRef,
    public dialog: MatDialog,
    private snackBar: MatSnackBar,
    private overviewService: OverviewService
  ) {}

  ngOnInit() {
    this.updateProgressBars(0);
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.updateProgressBars();
      this.cdr.detectChanges();
    }, 50);
  }

  updateProgressBars(initialValue: number = -1) {
    const value = initialValue >= 0 ? initialValue : -1;
    this.updateProgressBar(
      'preferences',
      value >= 0 ? value : this.preferencesProgress
    );
    this.updateProgressBar(
      'scheduling',
      value >= 0 ? value : this.schedulingProgress
    );
    this.updateProgressBar(
      'room-utilization',
      value >= 0 ? value : this.roomUtilizationProgress
    );
  }

  updateProgressBar(id: string, value: number) {
    const progressElement = document.getElementById(`${id}-progress`);
    if (progressElement) {
      progressElement.style.width = `${value}%`;
    }
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
}
