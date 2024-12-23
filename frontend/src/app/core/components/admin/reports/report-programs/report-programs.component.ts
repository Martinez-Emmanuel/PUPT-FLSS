import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';

import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSymbolDirective } from '../../../../imports/mat-symbol.directive';

import { TableHeaderComponent, InputField } from '../../../../../shared/table-header/table-header.component';
import { TableDialogComponent, DialogConfig, DialogFieldConfig } from '../../../../../shared/table-dialog/table-dialog.component';
import { DialogViewScheduleComponent } from '../../../../../shared/dialog-view-schedule/dialog-view-schedule.component';
import { LoadingComponent } from '../../../../../shared/loading/loading.component';

import { ReportsService } from '../../../../services/admin/reports/reports.service';

import { fadeAnimation } from '../../../../animations/animations';

import jsPDF from 'jspdf';
import 'jspdf-autotable';


interface CourseDetails {
  course_assignment_id: number;
  course_title: string;
  course_code: string;
  lec: number;
  lab: number;
  units: number;
  tuition_hours: number;
}

interface Schedule {
  schedule_id: number;
  day: string;
  start_time: string;
  end_time: string;
  faculty_name: string;
  faculty_code: string;
  room_code: string;
  course_details: CourseDetails;
}

interface Section {
  section_name: string;
  schedules: Schedule[];
}

interface YearLevel {
  year_level: number;
  sections: Section[];
}

interface Program {
  program_id: number;
  program_code: string;
  program_title: string;
  year_levels: YearLevel[];
  year_levels_selected?: string;
  section_selected?: string;
  academicYear: any;
  semester: any;
}

@Component({
  selector: 'app-report-programs',
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatIconModule,
    MatButtonModule,
    MatSlideToggleModule,
    MatTooltipModule,
    TableHeaderComponent,
    LoadingComponent,
    MatSymbolDirective,
  ],
  templateUrl: './report-programs.component.html',
  styleUrls: ['./report-programs.component.scss'],
  animations: [fadeAnimation],
})
export class ReportProgramsComponent implements OnInit {
  inputFields: InputField[] = [
    {
      type: 'text',
      label: 'Search Programs',
      key: 'search',
    },
  ];

  displayedColumns: string[] = [
    'index',
    'programCode',
    'programName',
    'yearLevel',
    'section',
    'action',
  ];

  dataSource = new MatTableDataSource<Program>();
  filteredData: Program[] = [];
  academicYear: string = '';
  semester: string = '';
  isLoading = true;
  hasAnySchedules = false;

  private searchInput$ = new Subject<string>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private reportsService: ReportsService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.fetchProgramsData();
    this.searchInput$
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe((searchQuery) => {
        this.performSearch(searchQuery);
      });
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  fetchProgramsData(): void {
    this.isLoading = true;
    this.reportsService.getProgramSchedulesReport().subscribe({
      next: (response) => {
        const programData: Program[] =
          response.programs_schedule_reports.programs.map((program: any) => ({
            program_id: program.program_id,
            program_code: program.program_code,
            program_title: program.program_title,
            year_levels: program.year_levels.map((yl: any) => ({
              year_level: yl.year_level,
              sections: yl.sections.map((sec: any) => ({
                section_name: sec.section_name,
                schedules: sec.schedules,
              })),
            })),
            year_levels_selected: 'All',
            section_selected: 'All',
          }));

        this.academicYear = `${response.programs_schedule_reports.year_start}-${response.programs_schedule_reports.year_end}`;
        this.semester = this.getSemesterDisplay(
          response.programs_schedule_reports.semester
        );

        this.isLoading = false;
        this.dataSource.data = programData;
        this.filteredData = [...programData];
        this.dataSource.paginator = this.paginator;

        // Check if there are any schedules available
        this.hasAnySchedules = this.filteredData.some((program) =>
          program.year_levels.some((yearLevel) =>
            yearLevel.sections.some((section) => section.schedules.length > 0)
          )
        );
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error fetching programs data:', error);
        this.snackBar.open(
          'Failed to load programs data. Please try again later.',
          'Close',
          {
            duration: 5000,
          }
        );
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
        (program) =>
          program.program_code.toLowerCase().includes(searchQuery) ||
          program.program_title.toLowerCase().includes(searchQuery)
      );
    }
  }

  onExportAll() {
    const scheduleGroups: { title: string; scheduleData: any }[] = [];

    this.filteredData.forEach((program) => {
      program.year_levels.forEach((yearLevel) => {
        yearLevel.sections.forEach((section) => {
          const title = `${program.program_code} - Year ${yearLevel.year_level} - Section ${section.section_name}`;
          scheduleGroups.push({
            title: title,
            scheduleData: section.schedules,
          });
        });
      });
    });

    if (scheduleGroups.length === 0) {
      this.snackBar.open('No schedule data available to export.', 'Close', {
        duration: 5000,
      });
      return;
    }

    const generatePdfFunction = (preview: boolean): Blob | void => {
      const doc = this.createCombinedPdf();
      return doc.output('blob');
    };

    this.dialog.open(DialogViewScheduleComponent, {
      maxWidth: '90vw',
      width: '100%',
      data: {
        exportType: 'all',
        entity: 'program',
        scheduleGroups: scheduleGroups,
        customTitle: 'All Program Schedules',
        academicYear: this.academicYear,
        semester: this.semester,
        generatePdfFunction: generatePdfFunction,
        previewMode: true,
      },
      disableClose: true,
    });
  }

  onOpenDialog(program: Program, field: 'yearLevel' | 'section') {
    let dialogFields: DialogFieldConfig[] = [];
    let title = '';
    let options: string[] = [];

    if (field === 'yearLevel') {
      const uniqueYearLevels = program.year_levels.map((yl) => yl.year_level);
      options = ['All', ...uniqueYearLevels.map(String)];
      dialogFields = [
        {
          label: 'Year Level',
          formControlName: 'yearLevel',
          type: 'select',
          options: options,
          required: true,
        },
      ];
      title = 'Select Year Level';
    } else if (field === 'section') {
      if (program.year_levels_selected === 'All') {
        const uniqueSections = Array.from(
          new Set(
            program.year_levels.flatMap((yl) =>
              yl.sections.map((sec) => sec.section_name)
            )
          )
        );
        options = ['All', ...uniqueSections];
      } else {
        const selectedYearLevel = program.year_levels.find(
          (yl) => yl.year_level.toString() === program.year_levels_selected
        );
        if (selectedYearLevel) {
          const sections = selectedYearLevel.sections.map(
            (sec) => sec.section_name
          );
          options = ['All', ...sections];
        } else {
          options = ['All'];
        }
      }

      dialogFields = [
        {
          label: 'Section',
          formControlName: 'section',
          type: 'select',
          options: options,
          required: true,
        },
      ];
      title = 'Select Section';
    }

    const dialogConfig: DialogConfig = {
      title,
      fields: dialogFields,
      isEdit: false,
      initialValue: {
        [field === 'yearLevel' ? 'yearLevel' : 'section']:
          field === 'yearLevel'
            ? program.year_levels_selected
            : program.section_selected,
      },
    };

    const dialogRef = this.dialog.open(TableDialogComponent, {
      data: dialogConfig,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        if (field === 'yearLevel') {
          program.year_levels_selected = result.yearLevel;
          program.section_selected = 'All';
        } else if (field === 'section') {
          program.section_selected = result.section;
        }
      }
    });
  }

  onView(element: Program) {
    const selectedYearLevel = element.year_levels_selected;
    const selectedSection = element.section_selected;

    let scheduleGroups: { title: string; scheduleData: any }[] = [];

    if (selectedYearLevel === 'All') {
      element.year_levels.forEach((yl) => {
        const yearLevel = yl.year_level;
        let sections: any[] = [];

        if (selectedSection === 'All') {
          sections = yl.sections;
        } else {
          const section = yl.sections.find(
            (sec) => sec.section_name === selectedSection
          );
          if (section) {
            sections = [section];
          }
        }

        sections.forEach((sec) => {
          const title = `Year Level ${yearLevel} - Section ${sec.section_name}`;
          scheduleGroups.push({
            title: title,
            scheduleData: sec.schedules,
          });
        });
      });
    } else {
      const yl = element.year_levels.find(
        (yl) => yl.year_level.toString() === selectedYearLevel
      );
      if (yl) {
        let sections: any[] = [];

        if (selectedSection === 'All') {
          sections = yl.sections;
        } else {
          const section = yl.sections.find(
            (sec) => sec.section_name === selectedSection
          );
          if (section) {
            sections = [section];
          }
        }

        sections.forEach((sec) => {
          const title = `Year Level ${yl.year_level} - Section ${sec.section_name}`;
          scheduleGroups.push({
            title: title,
            scheduleData: sec.schedules,
          });
        });
      }
    }

    // Function to generate the PDF Blob for preview or download
    const generatePdfFunction = (preview: boolean): Blob | void => {
      return this.createPdfBlob(element);
    };

    this.dialog.open(DialogViewScheduleComponent, {
      maxWidth: '90vw',
      width: '100%',
      data: {
        entity: 'program',
        scheduleGroups: scheduleGroups,
        customTitle: `${element.program_title} (${element.program_code})`,
        academicYear: this.academicYear,
        semester: this.semester,
        generatePdfFunction: generatePdfFunction,
        previewMode: true,
      },
      disableClose: true,
    });
  }

  onExportSingle(element: Program): void {
    const selectedYearLevel = element.year_levels_selected ?? 'All';
    const selectedSection = element.section_selected ?? 'All';

    const pdfBlob = this.createPdfBlob(element);

    let fileName: string;

    // If both year level and section are "All", use only the program code
    if (selectedYearLevel === 'All' && selectedSection === 'All') {
      fileName = `${element.program_code.replace(
        /\s+/g,
        '_'
      )}_schedule_report.pdf`;
    } else {
      const yearLevelPart =
        selectedYearLevel !== 'All' ? `${selectedYearLevel}` : '';
      const sectionPart =
        selectedSection !== 'All'
          ? `${selectedSection.replace(/\s+/g, '_')}`
          : '';
      fileName = `${element.program_code.replace(
        /\s+/g,
        '_'
      )}_${yearLevelPart}-${sectionPart}_schedule_report.pdf`;
    }

    const blobUrl = URL.createObjectURL(pdfBlob);
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(blobUrl);
  }

  createCombinedPdf(): jsPDF {
    const doc = new jsPDF('landscape', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.width;
    const margin = 10;
    const topMargin = 15;
    const logoSize = 22;

    if (this.filteredData.length === 0) {
      console.error('No data available to export.');
      return doc;
    }

    this.filteredData.forEach((program, programIndex) => {
      program.year_levels.forEach((yearLevel, yearIndex) => {
        yearLevel.sections.forEach((section, sectionIndex) => {
          if (programIndex > 0 || yearIndex > 0 || sectionIndex > 0) {
            doc.addPage();
          }

          let currentY = this.drawHeader(
            doc,
            topMargin,
            pageWidth,
            margin,
            logoSize,
            `${program.program_code} - Year ${yearLevel.year_level} - Section ${section.section_name}`,
            `For Academic Year ${this.academicYear}, ${this.semester}`
          );

          this.drawScheduleTable(
            doc,
            section.schedules ?? [],
            currentY,
            margin,
            pageWidth
          );
        });
      });
    });

    return doc;
  }

  createPdfBlob(program: Program): Blob {
    const doc = new jsPDF('landscape', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.width;
    const margin = 10;
    const topMargin = 15;
    const logoSize = 22;

    if (program.year_levels.length === 0) {
      console.error('No data available to export.');
      return new Blob();
    }

    const selectedYearLevel = program.year_levels_selected;
    const selectedSection = program.section_selected;

    const filteredYearLevels = program.year_levels.filter(
      (yl) =>
        selectedYearLevel === 'All' ||
        yl.year_level.toString() === selectedYearLevel
    );

    let isFirstPage = true;

    filteredYearLevels.forEach((yearLevel) => {
      const filteredSections = yearLevel.sections.filter(
        (sec) =>
          selectedSection === 'All' || sec.section_name === selectedSection
      );

      filteredSections.forEach((section) => {
        if (!isFirstPage) {
          doc.addPage();
        } else {
          isFirstPage = false;
        }

        let currentY = this.drawHeader(
          doc,
          topMargin,
          pageWidth,
          margin,
          logoSize,
          `${program.program_code} - Year ${yearLevel.year_level} - Section ${section.section_name}`,
          `For Academic Year ${this.academicYear}, ${this.semester}`
        );

        this.drawScheduleTable(
          doc,
          section.schedules ?? [],
          currentY,
          margin,
          pageWidth
        );
      });
    });

    if (
      filteredYearLevels.length === 0 ||
      filteredYearLevels.every((yl) => yl.sections.length === 0)
    ) {
      console.error(
        'No matching year levels or sections found for the selected options.'
      );
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

    // Function to start a new page
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

    // Render the day headers
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

    // Loop through each day and display schedules
    days.forEach((day, dayIndex) => {
      const xPosition = margin + dayIndex * dayColumnWidth;
      let yPosition = currentY;

      const daySchedule = scheduleData
        .filter((item: any) => item.day === day)
        .sort(
          (a: any, b: any) =>
            this.timeToMinutes(a.start_time) - this.timeToMinutes(b.start_time)
        );

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
          item.faculty_name,
          item.room_code,
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

  getAcademicYearSubtitle(program: Program): string {
    return `For Academic Year ${program.academicYear}, ${program.semester}`;
  }

  hasSchedules(program: Program): boolean {
    return program.year_levels.some((yearLevel) =>
      yearLevel.sections.some(
        (section) => section.schedules && section.schedules.length > 0
      )
    );
  }
}