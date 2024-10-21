//report-faculty.ts:
import { Component, OnInit, ViewChild, AfterViewInit, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

import { TableHeaderComponent, InputField } from '../../../../../shared/table-header/table-header.component';
import { LoadingComponent } from '../../../../../shared/loading/loading.component';
import { DialogViewScheduleComponent } from '../../../../../shared/dialog-view-schedule/dialog-view-schedule.component';

import { ReportsService } from '../../../../services/admin/reports/reports.service';

import { fadeAnimation } from '../../../../animations/animations';


import jsPDF from 'jspdf';
import 'jspdf-autotable';

interface Faculty {
  facultyName: string;
  facultyCode: string;
  facultyType: string;
  facultyUnits: number;
  isEnabled: boolean;
  facultyId: number;
  schedules?: any[];
  academicYear?: string;
  semester?: string;
}

@Component({
  selector: 'app-report-faculty',
  standalone: true,
  imports: [
    CommonModule,
    TableHeaderComponent,
    LoadingComponent,
    MatTableModule,
    MatPaginatorModule,
    MatIconModule,
    MatSlideToggleModule,
    MatButtonModule,
    MatTooltipModule,
    FormsModule,
    MatDialogModule,
  ],
  templateUrl: './report-faculty.component.html',
  styleUrl: './report-faculty.component.scss',
  animations: [fadeAnimation],
})
export class ReportFacultyComponent
  implements OnInit, AfterViewInit, AfterViewChecked
{
  inputFields: InputField[] = [
    {
      type: 'text',
      label: 'Search Faculty',
      key: 'search',
    },
  ];

  displayedColumns: string[] = [
    'index',
    'facultyName',
    'facultyCode',
    'facultyType',
    'facultyUnits',
    'action',
    'toggle',
  ];

  dataSource = new MatTableDataSource<Faculty>();
  filteredData: Faculty[] = [];
  hasSchedulesForToggleAll = false;
  isToggleAllChecked = false;
  isLoading = true;

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private reportsService: ReportsService,
    public dialog: MatDialog,
    private snackBar: MatSnackBar,
    private sanitizer: DomSanitizer // Inject DomSanitizer here
  ) {}

  ngOnInit(): void {
    this.fetchFacultyData();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  ngAfterViewChecked() {
    if (this.dataSource.paginator !== this.paginator) {
      this.dataSource.paginator = this.paginator;
    }
  }

  fetchFacultyData(): void {
    this.isLoading = true;
    this.reportsService.getFacultySchedulesReport().subscribe({
      next: (response) => {
        const facultyData = response.faculty_schedule_reports.faculties.map(
          (faculty: any) => ({
            facultyName: faculty.faculty_name,
            facultyCode: faculty.faculty_code,
            facultyType: faculty.faculty_type,
            facultyUnits: faculty.assigned_units,
            isEnabled: faculty.is_published === 1,
            facultyId: faculty.faculty_id,
            schedules: faculty.schedules || [],
            academicYear: `${response.faculty_schedule_reports.year_start}-${response.faculty_schedule_reports.year_end}`,
            semester: this.getSemesterDisplay(
              response.faculty_schedule_reports.semester
            ),
          })
        );

        this.isLoading = false;
        this.dataSource.data = facultyData;
        this.filteredData = [...facultyData];
        this.dataSource.paginator = this.paginator;

        this.hasSchedulesForToggleAll = facultyData.some(
          (faculty: { schedules: string | any[] }) =>
            faculty.schedules && faculty.schedules.length > 0
        );

        this.isToggleAllChecked =
          this.dataSource.data.length > 0 &&
          this.dataSource.data.every((faculty) => faculty.isEnabled);
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error fetching faculty data:', error);
      },
    });
  }

  getSemesterDisplay(semester: number): string {
    switch (semester) {
      case 1:
        return '1st Semester';
      case 2:
        return '2nd Semester';
      case 3:
        return 'Summer Semester';
      default:
        return 'Unknown Semester';
    }
  }

  getRowIndex(index: number): number {
    if (this.paginator) {
      return index + 1 + this.paginator.pageIndex * this.paginator.pageSize;
    }
    return index + 1;
  }

  onInputChange(changes: { [key: string]: any }) {
    const searchQuery = changes['search']
      ? changes['search'].trim().toLowerCase()
      : '';

    if (searchQuery === '') {
      this.dataSource.data = this.filteredData;
    } else {
      this.dataSource.data = this.filteredData.filter(
        (faculty) =>
          faculty.facultyName.toLowerCase().includes(searchQuery) ||
          faculty.facultyCode.toLowerCase().includes(searchQuery) ||
          faculty.facultyType.toLowerCase().includes(searchQuery)
      );
    }

    this.isToggleAllChecked =
      this.dataSource.data.length > 0 &&
      this.dataSource.data.every((faculty) => faculty.isEnabled);
  }

  onView(faculty: Faculty): void {
    const generatePdfFunction = (preview: boolean): Blob | void => {
        return this.createPdfBlob(faculty);
    };

    this.dialog.open(DialogViewScheduleComponent, {
        maxWidth: '90vw',
        width: '100%',
        data: {
            exportType: 'single',
            entity: 'faculty',
            entityData: faculty.schedules,
            customTitle: `${faculty.facultyName}`,
            academicYear: faculty.academicYear,
            semester: faculty.semester,
            generatePdfFunction: generatePdfFunction,
            
        },
        disableClose: true,
    });
}


  onExportAll(): void {
    if (this.filteredData.length === 0) {
      this.snackBar.open(
        'No faculty data available to export.', 
        'Close', { duration: 3000 }
      );
      return;
    }

    // Generate a PDF blob function for all schedules
    const generatePdfFunction = (preview: boolean): Blob | void => {
      return this.generateAllSchedulesPdfBlob();
    };

    // Open the dialog for the all-schedules export
    this.dialog.open(DialogViewScheduleComponent, {
      maxWidth: '90vw',
      width: '100%',
      data: {
        exportType: 'all',
        entity: 'faculty',
        entityData: this.filteredData.map(faculty => faculty.schedules).flat(),
        customTitle: 'All Faculty Schedules',
        academicYear: this.filteredData[0].academicYear,
        semester: this.filteredData[0].semester,
        generatePdfFunction: generatePdfFunction,
        showViewToggle: false,
      },
      disableClose: true,
    });
  }



  onExportSingle(faculty: Faculty): void {
    const pdfBlob = this.createPdfBlob(faculty);
    const blobUrl = URL.createObjectURL(pdfBlob);
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = `${faculty.facultyName.replace(/\s+/g, '_')}_schedule_report.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a); 
  }

  onToggleAllChange(event: any) {
    const isPublished = event.checked ? 1 : 0;

    this.snackBar.open('Loading, please wait...', 'Close', {
      duration: undefined,
    });

    this.reportsService.togglePublishAllSchedules(isPublished).subscribe({
      next: (response) => {
        this.dataSource.data.forEach((faculty) => {
          if (faculty.schedules && faculty.schedules.length > 0) {
            faculty.isEnabled = isPublished === 1;
          }
        });

        this.isToggleAllChecked =
          this.dataSource.data.length > 0 &&
          this.dataSource.data
            .filter(
              (faculty) => faculty.schedules && faculty.schedules.length > 0
            )
            .every((faculty) => faculty.isEnabled);

        this.snackBar.open(
          'Schedules successfully published for all applicable faculty.',
          'Close',
          {
            duration: 3000,
          }
        );
      },
      error: (error) => {
        console.error('Error toggling all schedules:', error);
        this.isToggleAllChecked = !event.checked;

        this.snackBar.open(
          'Error publishing schedules for all applicable faculty.',
          'Close',
          {
            duration: 3000,
          }
        );
      },
    });
  }

  onToggleChange(element: Faculty) {
    const isPublished = element.isEnabled ? 1 : 0;

    this.snackBar.open('Loading, please wait...', 'Close', {
      duration: undefined,
    });

    this.reportsService
      .togglePublishSingleSchedule(element.facultyId, isPublished)
      .subscribe({
        next: (response) => {
          this.isToggleAllChecked =
            this.dataSource.data.length > 0 &&
            this.dataSource.data.every((faculty) => faculty.isEnabled);

          this.snackBar.open(
            `Schedules successfully published for ${element.facultyName}.`,
            'Close',
            {
              duration: 3000,
            }
          );
        },
        error: (error) => {
          console.error(
            `Error toggling schedule for faculty ${element.facultyId}:`,
            error
          );
          element.isEnabled = !element.isEnabled;

          this.snackBar.open(
            `Error publishing schedules for ${element.facultyName}.`,
            'Close',
            {
              duration: 3000,
            }
          );
        },
      });
  }

  updateDisplayedData() {
    console.log('Paginator updated');
  }

  generateAllSchedulesPdfBlob(): Blob {
    const doc = new jsPDF('landscape', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.width;
    const margin = 10;
    const topMargin = 15;
    const logoSize = 22;

    // Ensure filteredData is not empty before proceeding
    if (this.filteredData.length === 0) {
        this.snackBar.open(
          'No data available to export.', 
          'Close', { duration: 3000 }
        );
        return new Blob(); // Return an empty Blob if there's no data
    }

    // Iterate through each faculty and add their schedule to the PDF
    this.filteredData.forEach((faculty, index) => {
        // If it's not the first faculty, add a new page
        if (index > 0) {
            doc.addPage();
        }

        // Draw header and schedule for each faculty
        let currentY = this.drawHeader(
            doc,
            topMargin,
            pageWidth,
            margin,
            logoSize,
            `${faculty.facultyName} Schedule`,
            this.getAcademicYearSubtitle(faculty)
        );
        
        // Use a fallback value for schedules if it is undefined
        this.drawScheduleTable(
            doc,
            faculty.schedules ?? [], // If schedules is undefined, use an empty array
            currentY,
            margin,
            pageWidth
        );
    });

    return doc.output('blob'); // Return the PDF as a Blob
  }

  createPdfBlob(faculty: Faculty): Blob {
    const doc = new jsPDF('landscape', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.width;
    const margin = 10;
    const topMargin = 15;
    const logoSize = 22;
  
    if (faculty.schedules && faculty.schedules.length > 0) {
      // Single schedule case
      let currentY = this.drawHeader(
        doc, topMargin, 
        pageWidth, margin,
        logoSize, `${faculty.facultyName}`, 
        this.getAcademicYearSubtitle(faculty)
      );
      this.drawScheduleTable(
        doc,
        faculty.schedules, 
        currentY, 
        margin, 
        pageWidth
      );
    }
    return doc.output('blob');
  }
  
  // Helper method to draw the header
  private drawHeader(
    doc: jsPDF, 
    startY: number, 
    pageWidth: number, 
    margin: number, 
    logoSize: number, 
    title: string, 
    subtitle: string
  ): number {
    const logoUrl = 
    'https://iantuquib.weebly.com/uploads/5/9/7/7/59776029/2881282_orig.png';
    const logoXPosition = pageWidth / 25 + 25; 
    doc.addImage(logoUrl, 'PNG', logoXPosition, startY - 5, logoSize, logoSize);
  
    // Add the university name
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(
      'POLYTECHNIC UNIVERSITY OF THE PHILIPPINES – TAGUIG BRANCH',
      pageWidth / 2, 
      startY, 
      { align: 'center' }
    );
  
    let currentY = startY + 5;
  
    // Add the university address
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(
      'Gen. Santos Ave. Upper Bicutan, Taguig City', 
      pageWidth / 2, 
      currentY, 
      { align: 'center' }
    );
  
    currentY += 10;
  
    // Add the title (override for group title if provided)
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(title, pageWidth / 2, currentY, { align: 'center' });
    currentY += 8;
  
    if (subtitle) {
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(subtitle, pageWidth / 2, currentY, { align: 'center' });
      currentY += 8;
    }
    // Draw a horizontal line under the header
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.5);
    doc.line(margin, currentY, pageWidth - margin, currentY);
    currentY += 7;
       
    return currentY;
  }
  
  // Helper function to draw the schedule table
  private drawScheduleTable(
    doc: jsPDF, 
    scheduleData: any[], 
    startY: number, 
    margin: number, 
    pageWidth: number
): void {
    const days = [
        'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
    ];
    const dayColumnWidth = (pageWidth - margin * 2) / days.length;

    // Draw the day headers
    days.forEach((day, index) => {
        const xPosition = margin + index * dayColumnWidth;
        doc.setFillColor(128, 0, 0);
        doc.setTextColor(255, 255, 255);
        doc.rect(xPosition, startY, dayColumnWidth, 10, 'F');
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text(
            day, 
            xPosition + dayColumnWidth / 2, 
            startY + 7, 
            { align: 'center' }
        );
    });

    // Update the currentY position
    let currentY = startY + 12;
    let maxYPosition = currentY;

    // Loop through each day and draw course blocks
    days.forEach((day, dayIndex) => {
      const xPosition = margin + dayIndex * dayColumnWidth;
      let yPosition = currentY;
      const daySchedule = scheduleData
      .filter((item: any) => item.day === day)
      .sort(
        (a: any, b: any) => 
        this.timeToMinutes(a.start_time) - this.timeToMinutes(b.start_time)
      );

      if (daySchedule.length > 0) {
        daySchedule.forEach((item: any) => {
          const startTime = this.formatTime(item.start_time);
          const endTime = this.formatTime(item.end_time);
          const courseContent = [
            item.course_details.course_code,
            item.course_details.course_title,
            `${item.section_name} - ${item.program_code}`,
            item.room_code,
            `${startTime} - ${endTime}`
          ];
          const boxHeight = 35;
          doc.setFillColor(240, 240, 240);
          doc.rect(xPosition, yPosition, dayColumnWidth, boxHeight, 'F');

          let textYPosition = yPosition + 5;
          courseContent.forEach((line: string, index) => {
            doc.setTextColor(0);
            doc.setFontSize(9);
            doc.setFont(
              index <= 1 ? 'helvetica' : 'helvetica',
              index <= 1 ? 'bold' : 'normal'
            );
            const wrappedLines = doc.splitTextToSize(line, dayColumnWidth - 10);

            wrappedLines.forEach((wrappedLine: string) => {
              doc.text(wrappedLine, xPosition + 5, textYPosition);
              textYPosition += 5;
            });

            // If the current line is the time, underline it
            if (index === courseContent.length - 1) {
              // Underline the time (which is the last line)
              const timeTextWidth = doc.getTextWidth(line);
              doc.setDrawColor(0, 0, 0);
              doc.setLineWidth(0.2);
              doc.line(
                xPosition + 5, 
                textYPosition - 4, 
                xPosition + 5 + timeTextWidth, 
                textYPosition - 4
              );
            }
          });

          yPosition += boxHeight + 5;
        });
      }

      if (yPosition > maxYPosition) {
        maxYPosition = yPosition;
      }
    });

  // Draw vertical lines and a bottom horizontal line
  for (let i = 0; i <= days.length; i++) {
    const xPosition = margin + i * dayColumnWidth;
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.5);
    doc.line(xPosition, startY , xPosition, maxYPosition);
  }
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.5);
    doc.line(margin, maxYPosition, pageWidth - margin, maxYPosition);
  }

  // Helper method to format time from "HH:mm:ss" to "HH:mm AM/PM"
  private formatTime(time: string): string {
    const [hours, minutes] = time.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 || 12;
    return `${formattedHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  }
  
  private timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }
  
  // Helper method to generate the academic year subtitle
  private getAcademicYearSubtitle(faculty: Faculty): string {
    return `For Academic Year ${faculty.academicYear}, ${faculty.semester}`;
  }
}
