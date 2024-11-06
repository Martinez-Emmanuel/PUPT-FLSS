import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatSymbolDirective } from '../../core/imports/mat-symbol.directive';

import { FacultyScheduleTimetableComponent } from '../faculty-schedule-timetable/faculty-schedule-timetable.component';

import { SchedulingService } from '../../core/services/admin/scheduling/scheduling.service';
import { ReportsService } from '../../core/services/admin/reports/reports.service';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'app-dialog-schedule-history',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    MatSymbolDirective,
    FormsModule,
    FacultyScheduleTimetableComponent,
  ],
  templateUrl: './dialog-schedule-history.component.html',
  styleUrls: ['./dialog-schedule-history.component.scss'],
})
export class DialogScheduleHistoryComponent implements OnInit {
  selectedYear: number | null = null;
  selectedSemester: number | null = null;

  academicYears: any[] = [];
  semesters: any[] = [];

  facultySchedule: any = null;
  isLoading: boolean = false;

  constructor(
    private schedulingService: SchedulingService,
    private reportsService: ReportsService,
    private cookieService: CookieService,
    private dialogRef: MatDialogRef<DialogScheduleHistoryComponent>
  ) {}

  ngOnInit() {
    this.loadAcademicYears();
  }

  /**
   * Fetches all academic years
   * Initialize the selectedYear and selectedSemester with default values
   */
  loadAcademicYears() {
    this.schedulingService.getAcademicYears().subscribe(
      (data) => {
        this.academicYears = data;

        if (this.academicYears.length > 0) {
          const latestYear = this.academicYears.reduce((prev, current) =>
            prev.academic_year_id > current.academic_year_id ? prev : current
          );
          this.selectedYear = latestYear.academic_year_id;

          this.onYearChange();
        }
      },
      (error) => {
        console.error('Error fetching academic years:', error);
      }
    );
  }

  /**
   * Updates the semesters dropdown based on the selected academic year.
   * Initializes the selectedSemester to the first semester by default.
   */
  onYearChange() {
    if (this.selectedYear) {
      const selectedAcademicYear = this.academicYears.find(
        (ay) => ay.academic_year_id === this.selectedYear
      );
      if (selectedAcademicYear && selectedAcademicYear.semesters.length > 0) {
        this.semesters = selectedAcademicYear.semesters;
        this.selectedSemester = this.semesters[0].semester_id;
        this.onSemesterChange();
      } else {
        this.semesters = [];
        this.selectedSemester = null;
        this.facultySchedule = null;
      }
    } else {
      this.semesters = [];
      this.selectedSemester = null;
      this.facultySchedule = null;
    }
  }

  /**
   * Fetches the schedule history when both academic year and semester are selected.
   */
  onSemesterChange() {
    if (this.selectedYear && this.selectedSemester) {
      this.fetchScheduleHistory();
    } else {
      this.facultySchedule = null;
    }
  }

  /**
   * Fetches the schedule history from the backend.
   */
  fetchScheduleHistory() {
    this.isLoading = true;
    const facultyId = Number(this.cookieService.get('faculty_id'));

    this.reportsService
      .getFacultyScheduleHistory(
        facultyId,
        this.selectedYear!,
        this.selectedSemester!
      )
      .subscribe(
        (data) => {
          this.facultySchedule = data.faculty_schedule;
          this.isLoading = false;
        },
        (error) => {
          console.error('Error fetching schedule history:', error);
          this.isLoading = false;
        }
      );
  }

  closeDialog() {
    this.dialogRef.close();
  }
}
