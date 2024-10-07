import { Component, Inject, OnInit, ElementRef, ViewChild, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatSymbolDirective } from '../../core/imports/mat-symbol.directive';
import { LoadingComponent } from '../loading/loading.component';
import { PreferencesService } from '../../core/services/faculty/preference/preferences.service';
import { fadeAnimation } from '../../core/animations/animations';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

interface ExportDialogData {
  exportType: 'all' | 'single';
  entity: string;
  entityData?: any;
  customTitle?: string;
}

@Component({
  selector: 'app-dialog-export',
  standalone: true,
  imports: [
    CommonModule,
    LoadingComponent,
    MatTableModule,
    MatButtonModule,
    MatSymbolDirective,
  ],
  templateUrl: './dialog-export.component.html',
  styleUrls: ['./dialog-export.component.scss'],
  animations: [fadeAnimation],
})
export class DialogExportComponent implements OnInit, AfterViewInit {
  title: string = '';
  subtitle: string = '';
  isLoading = true;
  exportType: 'all' | 'single' = 'single';
  faculty: any;
  pdfBlobUrl: SafeResourceUrl | null = null;

  @ViewChild('pdfIframe') pdfIframe!: ElementRef<HTMLIFrameElement>;

  constructor(
    private preferencesService: PreferencesService,
    public dialogRef: MatDialogRef<DialogExportComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ExportDialogData,
    private cdr: ChangeDetectorRef,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.exportType = this.data.exportType || 'single';
    if (this.data.entity === 'faculty') {
      this.faculty = this.data.entityData;
    }
    this.exportType === 'single'
      ? this.setTitleForSingleExport()
      : this.setTitleForAllExport();
    this.fetchAcademicYearAndSemester();
  }

  ngAfterViewInit(): void {
    if (this.exportType === 'single') {
      this.generateFacultyPDF(true);  // Trigger PDF generation with preview
    }
  }

  setTitleForSingleExport(): void {
    const { entity, entityData } = this.data;
    if (entity === 'faculty') {
      this.title = `Prof. ${entityData.facultyName}`;
    }
  }

  setTitleForAllExport(): void {
    const { entity, customTitle } = this.data;
    this.title =
      customTitle ||
      `Export All ${entity.charAt(0).toUpperCase() + entity.slice(1)} to PDF`;
  }

  fetchAcademicYearAndSemester(): void {
    this.preferencesService.getPreferences().subscribe((response) => {
      const firstFaculty = response.preferences[0];
      const activeSemester = firstFaculty?.active_semesters[0];
      if (activeSemester) {
        this.subtitle = `For Academic Year: ${activeSemester.academic_year}, ${activeSemester.semester_label}`;
      }
      this.isLoading = false;
      this.cdr.detectChanges();
    });
  }

  generateFacultyPDF(showPreview: boolean = false): void {
    const doc = new jsPDF('p', 'mm', 'legal') as any;
    const pageWidth = doc.internal.pageSize.width;
    const margin = 10;
    const logoSize = 22;
    const topMargin = 15;
    let currentY = topMargin;

    // Add the left logo
    const leftLogoUrl = 'https://iantuquib.weebly.com/uploads/5/9/7/7/59776029/2881282_orig.png';
    doc.addImage(leftLogoUrl, 'PNG', margin, 10, logoSize, logoSize);

    // Add header text
    doc.setFontSize(12);
    doc.setFont('times', 'bold');
    doc.text('POLYTECHNIC UNIVERSITY OF THE PHILIPPINES – TAGUIG BRANCH',
      pageWidth / 2, currentY, { align: 'center' }
    );
    currentY += 5;

    doc.setFontSize(12);
    doc.text('Gen. Santos Ave. Upper Bicutan, Taguig City',
      pageWidth / 2, currentY, { align: 'center' }
    );
    currentY += 10;

    doc.setFontSize(15);
    doc.setTextColor(0, 0, 0);
    doc.text('Faculty Preferences Report', pageWidth / 2, currentY, { align: 'center' });
    currentY += 8;

    // Add horizontal line below header
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.5);
    doc.line(margin, currentY, pageWidth - margin, currentY);
    currentY += 7;

    // Faculty Info (not bold)
    doc.setFontSize(12);
    doc.setFont('times', 'normal'); // Set font to normal
    doc.text(`Faculty Name: ${this.faculty.facultyName}`, margin, currentY);
    currentY += 5;
    doc.text(`Faculty Code: ${this.faculty.facultyCode}`, margin, currentY);
    currentY += 5;
    doc.text(`Academic Year: ${this.faculty.academicYear}`, margin, currentY);
    currentY += 5;
    doc.text(`Semester: ${this.faculty.semesterLabel}`, margin, currentY);
    currentY += 10;

    if (!this.faculty.courses || this.faculty.courses.length === 0) {
        console.error('No courses available for the faculty.');
        return;
    }

    // Prepare course data for table
    const courseData = this.faculty.courses.map((course: any, index: number) => {
        return [
            (index + 1).toString(),
            course.course_details?.course_code || 'N/A', // Properly accessing course_code
            course.course_details?.course_title || 'N/A', // Properly accessing course_title
            course.lec_hours.toString(),
            course.lab_hours.toString(),
            course.units.toString(),
            course.preferred_day,
            `${this.formatTimeTo12Hour(course.preferred_start_time)} - ${this.formatTimeTo12Hour(course.preferred_end_time)}` // Format times to 12-hour format
        ];
    });

    console.log('Prepared Course Data:', courseData);

    // Generate course table using autoTable
    doc.autoTable({
        startY: currentY,
        head: [['#', 'Course Code', 'Course Title', 'Lec', 'Lab', 'Units', 'Preferred Day', 'Preferred Time']],
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
            0: { cellWidth: 10 },  // #
            1: { cellWidth: 30 },  // Course Code
            2: { cellWidth: 50 },  // Course Title
            3: { cellWidth: 13 },  // Lec
            4: { cellWidth: 13 },  // Lab
            5: { cellWidth: 13 },  // Units
            6: { cellWidth: 25 },  // Preferred Day
            7: { cellWidth: 35 },  // Preferred Time
        },
        margin: { left: margin, right: margin },
    });

    // Create Blob URL for the PDF
    const pdfBlob = doc.output('blob');
    const blobUrl = URL.createObjectURL(pdfBlob);

    if (showPreview) {
        setTimeout(() => {
            if (this.pdfIframe && this.pdfIframe.nativeElement) {
                this.pdfIframe.nativeElement.src = blobUrl;
                console.log('Blob URL assigned to iframe:', blobUrl);
            } else {
                console.error('Iframe not found');
            }
        }, 0);
    } else {
        doc.save('faculty_preferences_report.pdf'); // Save the PDF if not showing preview
    }
}



// Time formatting function
formatTimeTo12Hour(time: string): string {
    const [hour, minute] = time.split(':');
    const hours = parseInt(hour, 10);
    const minutesFormatted = minute.length === 2 ? minute : `0${minute}`;
    const period = hours >= 12 ? 'PM' : 'AM';
    const formattedHour = hours % 12 || 12; // Convert 0 hour to 12

    return `${formattedHour}:${minutesFormatted} ${period}`;
}


  closeDialog(): void {
    this.dialogRef.close();
  }
}
