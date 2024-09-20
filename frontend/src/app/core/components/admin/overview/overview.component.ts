import {
  Component,
  OnInit,
  AfterViewInit,
  ChangeDetectorRef,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatDialogModule } from '@angular/material/dialog'; // Import the MatDialogModule
import { DialogGenericComponent } from '../../../../shared/dialog-generic/dialog-generic.component';
import { MatSymbolDirective } from '../../../imports/mat-symbol.directive';
import { fadeAnimation } from '../../../animations/animations';

@Component({
  selector: 'app-overview',
  standalone: true,
  imports: [MatSymbolDirective, MatDialogModule], // Import MatDialogModule here
  templateUrl: './overview.component.html',
  styleUrl: './overview.component.scss',
  animations: [fadeAnimation],
})
export class OverviewComponent implements OnInit, AfterViewInit {
  activeYear = '2024-2025';
  activeSemester = '1st Semester';

  preferencesProgress: number = 75;
  schedulingProgress: number = 60;
  roomUtilizationProgress: number = 90;

  constructor(private cdr: ChangeDetectorRef, public dialog: MatDialog) {}

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
    console.log('Sending email to all faculty...');
  }
}
