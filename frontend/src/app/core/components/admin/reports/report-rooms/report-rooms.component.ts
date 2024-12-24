import { Component, OnInit, ViewChild, AfterViewInit, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSymbolDirective } from '../../../../imports/mat-symbol.directive';

import { TableHeaderComponent, InputField } from '../../../../../shared/table-header/table-header.component';
import { LoadingComponent } from '../../../../../shared/loading/loading.component';
import { DialogViewScheduleComponent } from '../../../../../shared/dialog-view-schedule/dialog-view-schedule.component';

import { ReportsService } from '../../../../services/admin/reports/reports.service';

import jsPDF from 'jspdf';
import 'jspdf-autotable';

import { fadeAnimation } from '../../../../animations/animations';

interface Room {
  academicYear: any;
  semester: any;
  roomId: number;
  roomCode: string;
  location: string;
  floorLevel: string;
  capacity: number;
  schedules: any[];
}

@Component({
  selector: 'app-report-rooms',
  imports: [
    CommonModule,
    TableHeaderComponent,
    LoadingComponent,
    MatTableModule,
    MatPaginatorModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    FormsModule,
    MatDialogModule,
    MatSymbolDirective,
  ],
  templateUrl: './report-rooms.component.html',
  styleUrls: ['./report-rooms.component.scss'],
  animations: [fadeAnimation],
})
export class ReportRoomsComponent
  implements OnInit, AfterViewInit, AfterViewChecked
{
  inputFields: InputField[] = [
    {
      type: 'text',
      label: 'Search Rooms',
      key: 'search',
    },
  ];

  displayedColumns: string[] = [
    'index',
    'roomCode',
    'location',
    'floor',
    'capacity',
    'action',
  ];

  dataSource = new MatTableDataSource<Room>();
  filteredData: Room[] = [];
  isLoading = true;
  hasAnySchedules = false;

  private searchInput$ = new Subject<string>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private reportsService: ReportsService,
    public dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.fetchRoomData();
    this.searchInput$
      .pipe(debounceTime(300), distinctUntilChanged())
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

  fetchRoomData(): void {
    this.isLoading = true;
    this.reportsService.getRoomSchedulesReport().subscribe({
      next: (response) => {
        const rooms = response.room_schedule_reports.rooms.map((room: any) => ({
          roomId: room.room_id,
          roomCode: room.room_code,
          location: room.location,
          floorLevel: room.floor_level,
          capacity: room.capacity,
          schedules: room.schedules,
          academicYear: `${response.room_schedule_reports.year_start}-${response.room_schedule_reports.year_end}`,
          semester: this.getSemesterDisplay(
            response.room_schedule_reports.semester
          ),
        }));

        this.isLoading = false;
        this.dataSource.data = rooms;
        this.filteredData = [...rooms];
        this.dataSource.paginator = this.paginator;

        this.hasAnySchedules = this.filteredData.some((room) =>
          this.hasSchedules(room)
        );
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error fetching room data:', error);
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
        (room) =>
          room.roomCode.toLowerCase().includes(searchQuery) ||
          room.location.toLowerCase().includes(searchQuery) ||
          room.floorLevel.toLowerCase().includes(searchQuery)
      );
    }
  }

  onView(element: Room): void {
    this.dialog.open(DialogViewScheduleComponent, {
      maxWidth: '90vw',
      width: '100%',
      data: {
        exportType: 'single',
        entity: 'room',
        entityData: element.schedules,
        customTitle: `Room ${element.roomCode}`,
        academicYear: element.academicYear,
        semester: element.semester,
        generatePdfFunction: (preview: boolean) => this.createPdfBlob(element),
      },
      disableClose: true,
    });
  }

  onExportAll() {
    const generatePdfFunction = (preview: boolean): Blob | void => {
      return this.generateAllRoomsPdfBlob();
    };

    this.dialog.open(DialogViewScheduleComponent, {
      maxWidth: '90vw',
      width: '100%',
      data: {
        exportType: 'all',
        entity: 'room',
        entityData: this.filteredData,
        customTitle: 'All Room Schedules',
        generatePdfFunction: generatePdfFunction,
        showViewToggle: false,
      },
      disableClose: true,
    });
  }

  onExportSingle(element: Room): void {
    const pdfBlob = this.createPdfBlob(element);
    const blobUrl = URL.createObjectURL(pdfBlob);
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = `${element.roomCode.replace(/\s+/g, '_')}_schedule_report.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(blobUrl);
  }

  updateDisplayedData() {
    console.log('Paginator updated');
  }

  generateAllRoomsPdfBlob(): Blob {
    const doc = new jsPDF('landscape', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.width;
    const margin = 10;
    const topMargin = 15;
    const logoSize = 22;

    if (this.filteredData.length === 0) {
      console.error('No data available to export.');
      return new Blob();
    }

    this.filteredData.forEach((room, index) => {
      if (index > 0) {
        doc.addPage();
      }

      let currentY = this.drawHeader(
        doc,
        topMargin,
        pageWidth,
        margin,
        logoSize,
        `Room ${room.roomCode} Schedule`,
        this.getAcademicYearSubtitle(room)
      );

      this.drawScheduleTable(
        doc,
        room.schedules ?? [],
        currentY,
        margin,
        pageWidth
      );
    });

    return doc.output('blob');
  }

  createPdfBlob(room: Room): Blob {
    const doc = new jsPDF('landscape', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.width;
    const margin = 10;
    const topMargin = 15;
    const logoSize = 22;

    if (room.schedules && room.schedules.length > 0) {
      let currentY = this.drawHeader(
        doc,
        topMargin,
        pageWidth,
        margin,
        logoSize,
        `Room ${room.roomCode}`,
        this.getAcademicYearSubtitle(room)
      );
      this.drawScheduleTable(doc, room.schedules, currentY, margin, pageWidth);
    }

    return doc.output('blob');
  }

  drawHeader(
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

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(
      'POLYTECHNIC UNIVERSITY OF THE PHILIPPINES – TAGUIG BRANCH',
      pageWidth / 2,
      startY,
      { align: 'center' }
    );

    let currentY = startY + 5;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(
      'Gen. Santos Ave. Upper Bicutan, Taguig City',
      pageWidth / 2,
      currentY,
      { align: 'center' }
    );

    currentY += 10;
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

    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.5);
    doc.line(margin, currentY, pageWidth - margin, currentY);
    currentY += 7;

    return currentY;
  }

  drawScheduleTable(
    doc: jsPDF,
    scheduleData: any[],
    startY: number,
    margin: number,
    pageWidth: number
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

    const startNewPage = () => {
      doc.addPage();
      currentY = this.drawHeader(
        doc,
        15,
        pageWidth,
        margin,
        22,
        doc.getNumberOfPages() > 1
          ? 'Room Schedule (Continued)'
          : 'Room Schedule',
        this.getAcademicYearSubtitle(scheduleData[0])
      );

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
            item.faculty_name,
            `${startTime} - ${endTime}`,
          ];

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

  getAcademicYearSubtitle(room: Room): string {
    return `For Academic Year ${room.academicYear}, ${room.semester}`;
  }

  hasSchedules(room: Room): boolean {
    return room.schedules && room.schedules.length > 0;
  }
}