import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatIconModule } from '@angular/material/icon';
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

interface DialogPrefData {
  facultyName: string;
  faculty_id: number;
  generatePdfFunction?: (preview: boolean) => Blob | void;
  viewOnlyTable?: boolean;
}

@Component({
  selector: 'app-dialog-pref',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LoadingComponent,
    MatTableModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatIconModule,
    MatSymbolDirective,
  ],
  templateUrl: './dialog-pref.component.html',
  styleUrls: ['./dialog-pref.component.scss'],
  animations: [fadeAnimation],
})
export class DialogPrefComponent implements OnInit {
  facultyName: string = '';
  academicYear: string = '';
  semesterLabel: string = '';
  courses: Course[] = [];
  isLoading = true;
  selectedView: 'table-view' | 'pdf-view' = 'table-view';
  pdfBlobUrl: SafeResourceUrl | null = null;

  constructor(
    private preferencesService: PreferencesService,
    public dialogRef: MatDialogRef<DialogPrefComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogPrefData,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.isLoading = true;
    this.facultyName = this.data.facultyName;

    if (this.data.viewOnlyTable) {
      this.selectedView = 'table-view';
    }

    this.preferencesService
      .getPreferencesByFacultyId(this.data.faculty_id.toString())
      .subscribe(
        (response) => {
          const faculty = response.preferences;

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

          if (!this.data.viewOnlyTable && this.selectedView === 'pdf-view') {
            this.generateAndDisplayPdf();
          }
        },
        (error) => {
          console.error('Error loading faculty preferences:', error);
          this.isLoading = false;
        }
      );
  }

  onViewChange(): void {
    if (this.selectedView === 'pdf-view') {
      this.generateAndDisplayPdf();
    } else {
      this.pdfBlobUrl = null;
    }
  }

  generateAndDisplayPdf(): void {
    if (this.data.generatePdfFunction) {
      const pdfBlob = this.data.generatePdfFunction(true);
      if (pdfBlob instanceof Blob) {
        const blobUrl = URL.createObjectURL(pdfBlob);
        this.pdfBlobUrl =
          this.sanitizer.bypassSecurityTrustResourceUrl(blobUrl);
      } else {
        console.error('generatePdfFunction did not return a Blob.');
      }
    } else {
      console.error('No generatePdfFunction provided.');
    }
  }

  downloadPdf(): void {
    if (this.data.generatePdfFunction) {
      this.data.generatePdfFunction(false);
    } else {
      console.error('No generatePdfFunction provided.');
    }
  }

  closeDialog(): void {
    this.dialogRef.close();
  }

  convertToDate(timeString: string): Date {
    return new Date(`1970-01-01T${timeString}`);
  }
}
