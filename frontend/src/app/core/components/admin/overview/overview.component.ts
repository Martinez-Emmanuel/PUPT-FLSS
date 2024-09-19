import { Component, OnInit, AfterViewInit, ChangeDetectorRef } from '@angular/core';

import { MatSymbolDirective } from '../../../imports/mat-symbol.directive';

import { fadeAnimation } from '../../../animations/animations';

@Component({
  selector: 'app-overview',
  standalone: true,
  imports: [MatSymbolDirective],
  templateUrl: './overview.component.html',
  styleUrl: './overview.component.scss',
  animations: [fadeAnimation],
})
export class OverviewComponent implements OnInit, AfterViewInit {

  activeYear  = '2024-2025';
  activeSemester = '1st Semester';

  preferencesProgress: number = 75;
  schedulingProgress: number = 60;
  roomUtilizationProgress: number = 90;

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    // Reset progress bars to 0
    this.updateProgressBars(0);
  }

  ngAfterViewInit() {
    // Trigger animation after a short delay
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
}
