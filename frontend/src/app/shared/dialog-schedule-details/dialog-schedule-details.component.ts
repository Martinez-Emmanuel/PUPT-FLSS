import { Component, Inject, OnInit, ChangeDetectorRef } from '@angular/core';

import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSymbolDirective } from '../../core/imports/mat-symbol.directive';

interface ScheduleColor {
  primary: string;
  secondary: string;
  text: string;
}

interface ScheduleDialogData {
  schedule: any;
  color: ScheduleColor;
}

@Component({
  selector: 'app-dialog-schedule-details',
  standalone: true,
  imports: [MatSymbolDirective],
  templateUrl: './dialog-schedule-details.component.html',
  styleUrls: ['./dialog-schedule-details.component.scss'],
})
export class DialogScheduleDetailsComponent implements OnInit {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: ScheduleDialogData,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    setTimeout(() => {
      this.cdr.detectChanges();
    });
  }

  formatTime(time: string): string {
    const [hours, minutes] = time.split(':');
    const date = new Date();
    date.setHours(parseInt(hours, 10));
    date.setMinutes(parseInt(minutes, 10));
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  }
}
