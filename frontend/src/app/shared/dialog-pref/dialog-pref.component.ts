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

import jsPDF from 'jspdf';
import 'jspdf-autotable';

interface Course {
  course_code: string;
  course_title: string;
  lec_hours: number;
  lab_hours: number;
  units: number;
  preferred_days: { day: string; start_time: string; end_time: string }[];
}

interface DialogPrefData {
  facultyName: string;
  faculty_id: number;
  viewOnlyTable?: boolean;
}

@Component({
  selector: 'app-dialog-pref',
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
              preferred_days: course.preferred_days,
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
    const pdfBlob = this.generateFacultyPDF(false, [this.courses], true);
    if (pdfBlob instanceof Blob) {
      const blobUrl = URL.createObjectURL(pdfBlob);
      this.pdfBlobUrl = this.sanitizer.bypassSecurityTrustResourceUrl(blobUrl);
    } else {
      console.error('generateFacultyPDF did not return a Blob.');
    }
  }

  downloadPdf(): void {
    this.generateFacultyPDF(false, [this.courses], false);
  }

  closeDialog(): void {
    this.dialogRef.close();
  }

  /**
   * Generates a PDF for faculty preferences.
   */
  generateFacultyPDF(
    isAll: boolean,
    coursesArray: Course[][],
    showPreview: boolean = false
  ): Blob | void {
    const doc = new jsPDF('p', 'mm', 'legal') as any;
    const pageWidth = doc.internal.pageSize.width;
    const margin = 10;
    const topMargin = 15;
    const logoSize = 22;
    let currentY = topMargin;

    const headerFont = { font: 'times', style: 'bold', size: 12 };
    const normalFont = { font: 'times', style: 'normal', size: 12 };
    const centerAlign = { align: 'center' };

    /**
     * Adds the header to the PDF.
     */
    const addHeader = () => {
      const leftLogoUrl =
        'https://iantuquib.weebly.com/uploads/5/9/7/7/59776029/2881282_orig.png';
      doc.addImage(leftLogoUrl, 'PNG', margin, 10, logoSize, logoSize);

      doc.setFontSize(headerFont.size);
      doc.setFont(headerFont.font, headerFont.style);
      doc.text(
        'POLYTECHNIC UNIVERSITY OF THE PHILIPPINES – TAGUIG BRANCH',
        pageWidth / 2,
        topMargin,
        centerAlign
      );
      doc.text(
        'Gen. Santos Ave. Upper Bicutan, Taguig City',
        pageWidth / 2,
        topMargin + 5,
        centerAlign
      );
      doc.setFontSize(15);

      if (isAll) {
        doc.text(
          'All Faculty Preferences Report',
          pageWidth / 2,
          topMargin + 15,
          centerAlign
        );
      } else {
        doc.text(
          'Faculty Preferences Report',
          pageWidth / 2,
          topMargin + 15,
          centerAlign
        );
      }

      doc.setDrawColor(0, 0, 0);
      doc.setLineWidth(0.5);
      doc.line(margin, topMargin + 20, pageWidth - margin, topMargin + 20);

      currentY = topMargin + 25;
    };

    addHeader();

    coursesArray.forEach((courses, facultyIndex) => {
      if (!courses || courses.length === 0) return;

      doc.setFontSize(normalFont.size);
      doc.setFont(normalFont.font, normalFont.style);
      const facultyInfo = [
        `Faculty Name: ${this.facultyName}`,
        `Academic Year: ${this.academicYear}`,
        `Semester: ${this.semesterLabel}`,
      ];

      facultyInfo.forEach((info) => {
        doc.text(info, margin, currentY);
        currentY += 5;
      });
      currentY += 5;

      const courseData = courses.map((course: Course, index: number) => [
        (index + 1).toString(),
        course.course_code || 'N/A',
        course.course_title || 'N/A',
        course.lec_hours.toString(),
        course.lab_hours.toString(),
        course.units.toString(),
        this.formatPreferredDaysAndTime(course),
      ]);

      // Table Configuration
      const tableHead = [
        [
          '#',
          'Course Code',
          'Course Title',
          'Lec',
          'Lab',
          'Units',
          'Preferred Day & Time',
        ],
      ];
      const tableConfig = {
        startY: currentY,
        head: tableHead,
        body: courseData,
        theme: 'grid',
        headStyles: {
          fillColor: [128, 0, 0],
          textColor: [255, 255, 255],
          fontSize: 9,
        },
        bodyStyles: {
          fontSize: 8,
          textColor: [0, 0, 0],
        },
        styles: {
          lineWidth: 0.1,
          overflow: 'linebreak',
          cellPadding: 2,
        },
        columnStyles: {
          0: { cellWidth: 10 },
          1: { cellWidth: 30 },
          2: { cellWidth: 50 },
          3: { cellWidth: 13 },
          4: { cellWidth: 13 },
          5: { cellWidth: 13 },
          6: { cellWidth: 50 },
        },
        margin: { left: margin, right: margin },
      };

      (doc as any).autoTable(tableConfig);

      currentY = doc.autoTable.previous.finalY + 10;
      if (currentY > 270) {
        doc.addPage();
        addHeader();
        currentY = topMargin + 25;
      }
    });

    const pdfBlob = doc.output('blob');
    if (showPreview) {
      return pdfBlob;
    } else {
      let fileName = 'faculty_preferences_report.pdf';

      if (isAll && coursesArray.length > 0) {
        const firstCourse = coursesArray[0][0];
        fileName = `${this.sanitizeFileName(
          this.facultyName
        )}_preferences_report.pdf`;
      }

      doc.save(fileName);
    }
  }

  /**
   * Formats the preferred days and times for display.
   */
  formatPreferredDaysAndTime(course: Course): string {
    return course.preferred_days
      .map((pref) => {
        const time =
          pref.start_time === '07:00:00' && pref.end_time === '21:00:00'
            ? 'Whole Day'
            : `${this.convertTo12HourFormat(
                pref.start_time
              )} - ${this.convertTo12HourFormat(pref.end_time)}`;
        return `${pref.day} (${time})`;
      })
      .join('\n');
  }

  /**
   * Converts time from 24-hour to 12-hour format.
   */
  convertTo12HourFormat(time: string): string {
    const [hour, minute] = time.split(':').map(Number);
    let ampm = 'AM';
    let hour12 = hour;

    if (hour >= 12) {
      ampm = 'PM';
      if (hour > 12) hour12 = hour - 12;
    }
    if (hour === 0) {
      hour12 = 12;
    }

    return `${hour12.toString().padStart(2, '0')}:${minute
      .toString()
      .padStart(2, '0')} ${ampm}`;
  }

  /**
   * Sanitizes the file name by replacing non-alphanumeric characters.
   */
  sanitizeFileName(fileName: string): string {
    return fileName.toLowerCase().replace(/[^a-z0-9]/g, '_');
  }
}
