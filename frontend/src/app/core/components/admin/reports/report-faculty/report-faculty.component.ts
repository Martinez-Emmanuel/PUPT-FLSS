import { Component, OnInit, ViewChild, AfterViewInit, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSymbolDirective } from '../../../../imports/mat-symbol.directive';

import { TableHeaderComponent, InputField } from '../../../../../shared/table-header/table-header.component';
import { LoadingComponent } from '../../../../../shared/loading/loading.component';
import { DialogActionComponent } from '../../../../../shared/dialog-action/dialog-action.component';
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
    MatSymbolDirective,
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
  hasAnySchedules = false;
  sendEmail = true;

  private searchInput$ = new Subject<string>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private reportsService: ReportsService,
    public dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.fetchFacultyData();
    this.searchInput$
      .pipe(
        debounceTime(300), // Wait for 300ms pause in events
        distinctUntilChanged() // Only emit if value is different from previous value
      )
      .subscribe((searchQuery) => {
        this.performSearch(searchQuery);
      });
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

        this.hasSchedulesForToggleAll =
          facultyData.length > 0 &&
          facultyData.every(
            (faculty: { schedules: string | any[] }) =>
              faculty.schedules && faculty.schedules.length > 0
          );

        this.hasAnySchedules = facultyData.some(
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
    this.searchInput$.next(searchQuery);
  }

  performSearch(searchQuery: string) {
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

    this.hasSchedulesForToggleAll =
      this.dataSource.data.length > 0 &&
      this.dataSource.data.every(
        (faculty) => faculty.schedules && faculty.schedules.length > 0
      );

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
      this.snackBar.open('No faculty data available to export.', 'Close', {
        duration: 3000,
      });
      return;
    }

    const generatePdfFunction = (preview: boolean): Blob | void => {
      return this.generateAllSchedulesPdfBlob();
    };

    this.dialog.open(DialogViewScheduleComponent, {
      maxWidth: '90vw',
      width: '100%',
      data: {
        exportType: 'all',
        entity: 'faculty',
        entityData: this.filteredData
          .map((faculty) => faculty.schedules)
          .flat(),
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
    a.download = `${faculty.facultyName.replace(
      /\s+/g,
      '_'
    )}_Official_Schedule_.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  onToggleAllSchedules(event: any) {
    event.source.checked = this.isToggleAllChecked;

    const intendedState = !this.isToggleAllChecked;

    const dialogRef = this.dialog.open(DialogActionComponent, {
      data: {
        type: 'all_publish',
        currentState: !intendedState,
        academicYear: this.filteredData[0]?.academicYear || '',
        semester: this.filteredData[0]?.semester || '',
        hasSecondaryText: false,
        sendEmail: this.sendEmail,
      },
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result === true) {
        this.isToggleAllChecked = intendedState;

        this.dataSource.data.forEach((faculty) => {
          if (faculty.schedules && faculty.schedules.length > 0) {
            faculty.isEnabled = intendedState;
          }
        });

        this.filteredData = [...this.dataSource.data];

        this.hasSchedulesForToggleAll =
          this.dataSource.data.length > 0 &&
          this.dataSource.data.every(
            (faculty) => faculty.schedules && faculty.schedules.length > 0
          );
      }
      event.source.checked = this.isToggleAllChecked;
    });
  }

  onToggleSingleSchedule(element: Faculty, event: any): void {
    const intendedState = event.checked;

    event.source.checked = element.isEnabled;

    const dialogRef = this.dialog.open(DialogActionComponent, {
      data: {
        type: 'single_publish',
        currentState: element.isEnabled,
        facultyName: element.facultyName,
        faculty_id: element.facultyId,
        academicYear: element.academicYear,
        semester: element.semester,
      },
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result === true) {
        element.isEnabled = intendedState;

        this.isToggleAllChecked = this.dataSource.data.every(
          (faculty) => faculty.isEnabled
        );
      } else {
        event.source.checked = element.isEnabled;
      }
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

    if (this.filteredData.length === 0) {
      this.snackBar.open('No data available to export.', 'Close', {
        duration: 3000,
      });
      return new Blob();
    }

    this.filteredData.forEach((faculty, index) => {
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

      this.drawScheduleTable(
        doc,
        faculty.schedules ?? [],
        currentY,
        margin,
        pageWidth,
        faculty.facultyName
      );
    });
    return doc.output('blob');
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
        doc,
        topMargin,
        pageWidth,
        margin,
        logoSize,
        `${faculty.facultyName}`,
        this.getAcademicYearSubtitle(faculty)
      );
      this.drawScheduleTable(
        doc,
        faculty.schedules,
        currentY,
        margin,
        pageWidth,
        faculty.facultyName
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
    doc.setTextColor(0, 0, 0);
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

    // Add the title
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
    pageWidth: number,
    facultyName: string
  ): void {
    const hasSchedules = scheduleData && scheduleData.length > 0;

    if (!hasSchedules) {
      doc.setFontSize(20);
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(128, 128, 128);
      doc.text('No Assigned Schedule', pageWidth / 2, startY + 50, {
        align: 'center',
      });
      return;
    }

    const days = [
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
    ];
    const dayColumnWidth = (pageWidth - margin * 2) / days.length;
    const pageHeight = doc.internal.pageSize.height;
    const maxContentHeight = pageHeight - margin;

    let currentY = startY;
    let maxYPosition = currentY;

    // Function to start a new page and draw the header
    const startNewPage = () => {
      doc.addPage();
      currentY = this.drawHeader(
        doc,
        15,
        pageWidth,
        margin,
        22,
        doc.getNumberOfPages() > 1
          ? 'Faculty Schedule (Continued)'
          : 'Faculty Schedule',
        this.getAcademicYearSubtitle(scheduleData[0])
      );

      // Redraw day headers on new page
      days.forEach((day, index) => {
        const xPosition = margin + index * dayColumnWidth;
        doc.setFillColor(128, 0, 0);
        doc.setTextColor(255, 255, 255);
        doc.rect(xPosition, currentY, dayColumnWidth, 10, 'F');
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text(day, xPosition + dayColumnWidth / 2, currentY + 7, {
          align: 'center',
        });
      });
      currentY += 12;
      return currentY;
    };

    // Draw initial day headers
    days.forEach((day, index) => {
      const xPosition = margin + index * dayColumnWidth;
      doc.setFillColor(128, 0, 0);
      doc.setTextColor(255, 255, 255);
      doc.rect(xPosition, currentY, dayColumnWidth, 10, 'F');
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text(day, xPosition + dayColumnWidth / 2, currentY + 7, {
        align: 'center',
      });
    });

    currentY += 12; // Space after headers

    // Process each day's schedule
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
          const boxHeight = 35;
          if (yPosition + boxHeight > maxContentHeight) {
            days.forEach((_, i) => {
              const lineX = margin + i * dayColumnWidth;
              doc.setDrawColor(200, 200, 200);
              doc.setLineWidth(0.5);
              doc.line(lineX, startY, lineX, maxYPosition);
            });
            doc.line(
              pageWidth - margin,
              startY,
              pageWidth - margin,
              maxYPosition
            );

            yPosition = startNewPage();
            maxYPosition = yPosition;
          }

          const startTime = this.formatTime(item.start_time);
          const endTime = this.formatTime(item.end_time);
          const courseContent = [
            item.course_details.course_code,
            item.course_details.course_title,
            `${item.program_code} ${item.year_level} - ${item.section_name}`,
            item.room_code,
            `${startTime} - ${endTime}`,
          ];

          // Draw course block
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

            if (index === courseContent.length - 1) {
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
          if (yPosition > maxYPosition) {
            maxYPosition = yPosition;
          }
        });
      }
    });

    days.forEach((_, i) => {
      const lineX = margin + i * dayColumnWidth;
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.5);
      doc.line(lineX, startY, lineX, maxYPosition);
    });
    doc.line(pageWidth - margin, startY, pageWidth - margin, maxYPosition);
    doc.line(margin, maxYPosition, pageWidth - margin, maxYPosition);

    // Footer content: "Prepared By" and "Received By"
    const footerMargin = 20;

    // "Prepared By:" on the left side
    const preparedByXPosition = margin;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Prepared By:', preparedByXPosition, pageHeight - footerMargin);

    // "Received By: <Faculty Name>" on the right side
    const receivedByXPosition = pageWidth - margin - 80;
    doc.setFont('helvetica', 'bold');
    doc.text('Received By:', receivedByXPosition, pageHeight - footerMargin);

    // Faculty name for "Received By:" on the next line, indented
    const indent = 10;
    doc.setFont('helvetica', 'normal');
    doc.text(
      `Professor ${facultyName}`,
      receivedByXPosition + indent,
      pageHeight - footerMargin + 8
    );
  }

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

  private getAcademicYearSubtitle(faculty: Faculty): string {
    return `For Academic Year ${faculty.academicYear}, ${faculty.semester}`;
  }

  getSingleToggleTooltip(faculty: Faculty): string {
    if (!faculty.schedules || faculty.schedules.length === 0) {
      return `Cannot publish/unpublish empty schedule for ${faculty.facultyName}`;
    }
    return `${faculty.isEnabled ? 'Unpublish' : 'Publish'} schedule for ${
      faculty.facultyName
    }`;
  }

  getAllToggleTooltip(isEnabled: boolean): string {
    if (!this.hasSchedulesForToggleAll) {
      return 'Cannot be toggled unless all faculty has schedule';
    }
    return `${
      isEnabled ? 'Unpublish' : 'Publish'
    } schedules for all applicable faculty`;
  }

  hasSchedules(faculty: Faculty): boolean {
    return (faculty.schedules ?? []).length > 0;
  }

  getFacultyTypeClass(facultyType: string): Record<string, boolean> {
    const type = facultyType.toLowerCase();
    return {
      'full-time': type.includes('full-time'),
      designee: type.includes('designee'),
      'part-time': type.includes('part-time'),
      temporary: type.includes('temporary'),
    };
  }
}
