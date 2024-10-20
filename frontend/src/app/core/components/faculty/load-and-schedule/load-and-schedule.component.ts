import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatSymbolDirective } from '../../../imports/mat-symbol.directive';

import { FacultyScheduleTimetableComponent } from '../../../../shared/faculty-schedule-timetable/faculty-schedule-timetable.component';
import { LoadingComponent } from '../../../../shared/loading/loading.component';

import { ReportsService } from '../../../services/admin/reports/reports.service';
import { CookieService } from 'ngx-cookie-service';

import { fadeAnimation } from '../../../animations/animations';

@Component({
  selector: 'app-load-and-schedule',
  standalone: true,
  imports: [CommonModule, FacultyScheduleTimetableComponent, LoadingComponent, MatSymbolDirective],
  templateUrl: './load-and-schedule.component.html',
  styleUrl: './load-and-schedule.component.scss',
  animations: [fadeAnimation],
})
export class LoadAndScheduleComponent implements OnInit {
  facultySchedule: any;
  isLoading = true;
  isPublished = false;

  constructor(
    private reportsService: ReportsService,
    private cookieService: CookieService
  ) {}

  ngOnInit() {
    this.loadFacultySchedule();
  }

  loadFacultySchedule() {
    const facultyId = this.cookieService.get('faculty_id');
    if (facultyId) {
      this.reportsService.getSingleFacultySchedule(+facultyId).subscribe(
        (data) => {
          this.facultySchedule = data.faculty_schedule;
          this.isPublished = data.faculty_schedule.is_published === 1;
          this.isLoading = false;
        },
        (error) => {
          console.error('Error fetching faculty schedule:', error);
          this.isLoading = false;
        }
      );
    } else {
      console.error('Faculty ID not found in cookies');
      this.isLoading = false;
    }
  }
  
  get academicYear(): string {
    if (this.facultySchedule) {
      return `${this.facultySchedule.year_start}-${this.facultySchedule.year_end}`;
    }
    return '';
  }

  get semester(): string {
    if (this.facultySchedule) {
      switch (this.facultySchedule.semester) {
        case 1:
          return '1st Semester';
        case 2:
          return '2nd Semester';
        case 3:
          return 'Summer Term';
        default:
          return '';
      }
    }
    return '';
  }
}