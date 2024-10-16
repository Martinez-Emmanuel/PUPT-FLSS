import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatSymbolDirective } from '../../core/imports/mat-symbol.directive';

import { LoadingComponent } from '../loading/loading.component';

import { PreferencesService } from '../../core/services/faculty/preference/preferences.service';

import { fadeAnimation } from '../../core/animations/animations';

interface Course {
  course_code: string;
  course_title: string;
  lec_hours: number;
  lab_hours: number;
  units: number;
  preferred_day: string;
  preferred_start_time: string;
  preferred_end_time: string;
}

@Component({
  selector: 'app-dialog-pref',
  standalone: true,
  imports: [
    CommonModule,
    LoadingComponent,
    MatTableModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatSymbolDirective,
  ],
  templateUrl: './dialog-pref.component.html',
  styleUrl: './dialog-pref.component.scss',
  animations: [fadeAnimation],
})
export class DialogPrefComponent implements OnInit {
  facultyName: string = '';
  academicYear: string = '';
  semesterLabel: string = '';
  courses: Course[] = [];
  isLoading = true;

  constructor(
    private preferencesService: PreferencesService,
    public dialogRef: MatDialogRef<DialogPrefComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit(): void {
    this.isLoading = true;
    this.facultyName = this.data.facultyName;

    this.preferencesService.getPreferences().subscribe((response) => {
      const faculty = response.preferences.find(
        (f: any) => f.faculty_id === this.data.faculty_id
      );
      if (faculty) {
        const activeSemester = faculty.active_semesters[0];
        this.academicYear = activeSemester.academic_year;
        this.semesterLabel = activeSemester.semester_label;

        this.courses = activeSemester.courses.map((course: any) => ({
          course_code: course.course_details.course_code,
          course_title: course.course_details.course_title,
          lec_hours: course.lec_hours,
          lab_hours: course.lab_hours,
          units: course.units,
          preferred_day: course.preferred_day,
          preferred_start_time: course.preferred_start_time,
          preferred_end_time: course.preferred_end_time,
        }));
      }

      this.isLoading = false;
    });
  }

  closeDialog(): void {
    this.dialogRef.close();
  }

  convertToDate(timeString: string): Date {
    return new Date(`1970-01-01T${timeString}`);
  }
}
