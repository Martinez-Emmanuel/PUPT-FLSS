import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatSymbolDirective } from '../../../imports/mat-symbol.directive';
import { MatDialog } from '@angular/material/dialog';

import { TableHeaderComponent, InputField } from '../../../../shared/table-header/table-header.component';
import { LoadingComponent } from '../../../../shared/loading/loading.component';
import { DialogPrefComponent } from '../../../../shared/dialog-pref/dialog-pref.component';
import { DialogExportComponent } from '../../../../shared/dialog-export/dialog-export.component';

import { PreferencesService, ActiveSemester } from '../../../services/faculty/preference/preferences.service';

import { fadeAnimation } from '../../../animations/animations';

import jsPDF from 'jspdf';
import 'jspdf-autotable'; 

interface Faculty {
  faculty_id: number;
  facultyName: string;
  facultyCode: string;
  facultyType: string;
  facultyUnits: number;
  is_enabled: boolean;
  active_semesters?: ActiveSemester[]; 
}

@Component({
  selector: 'app-faculty-pref',
  standalone: true,
  imports: [
    CommonModule,
    TableHeaderComponent,
    LoadingComponent,
    DialogPrefComponent,
    DialogExportComponent,
    FormsModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatSlideToggleModule,
    MatPaginatorModule,
    MatTooltipModule,
    MatSnackBarModule,
    MatSymbolDirective,
  ],
  templateUrl: './faculty-pref.component.html',
  styleUrls: ['./faculty-pref.component.scss'],
  animations: [fadeAnimation],
})
export class FacultyPrefComponent implements OnInit, AfterViewInit {
  inputFields: InputField[] = [
    {
      type: 'text',
      label: 'Search Faculty',
      key: 'searchFaculty',
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

  dataSource = new MatTableDataSource<Faculty>([]);
  allData: Faculty[] = [];
  filteredData: Faculty[] = [];
  isToggleAllChecked = false;
  isLoading = true;
  currentFilter = '';

  @ViewChild(MatPaginator) paginator?: MatPaginator;

  constructor(
    private preferencesService: PreferencesService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadFacultyPreferences();
    this.dataSource.filterPredicate = (data: Faculty, filter: string) => {
      return (
        data.facultyName.toLowerCase().includes(filter) ||
        data.facultyCode.toLowerCase().includes(filter) ||
        data.facultyType.toLowerCase().includes(filter)
      );
    };
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator ?? null;
    this.applyFilter(this.currentFilter);
  }

  loadFacultyPreferences(): void {
    this.isLoading = true;
    this.preferencesService.getPreferences().subscribe(
      (response) => {
        const faculties = response.preferences.map((faculty: any) => ({
          faculty_id: faculty.faculty_id,
          facultyName: faculty.faculty_name,
          facultyCode: faculty.faculty_code,
          facultyType: faculty.faculty_type,
          facultyUnits: faculty.faculty_units,
          is_enabled: faculty.is_enabled === 1,
          active_semesters: faculty.active_semesters,
        }));

        console.log('Processed Faculty Data:', faculties);

        this.allData = faculties;
        this.filteredData = faculties;
        this.applyFilter(this.currentFilter);
        this.checkToggleAllState();
        this.isLoading = false;
      },
      (error) => {
        console.error('Error loading faculty preferences:', error);
        this.snackBar.open(
          'Error loading faculty preferences. Please try again.',
          'Close',
          { duration: 3000 }
        );
        this.isLoading = false;
      }
    );
  }

  applyFilter(filterValue: string): void {
    this.currentFilter = filterValue.trim().toLowerCase();

    if (this.currentFilter === '') {
      this.filteredData = [...this.allData];
    } else {
      this.filteredData = this.allData.filter((faculty) =>
        this.filterPredicate(faculty, this.currentFilter)
      );
    }

    if (this.paginator) {
      this.paginator.firstPage();
    }

    this.updateDisplayedData();
  }

  filterPredicate(data: Faculty, filter: string): boolean {
    return (
      data.facultyName.toLowerCase().includes(filter) ||
      data.facultyCode.toLowerCase().includes(filter) ||
      data.facultyType.toLowerCase().includes(filter)
    );
  }

  updateDisplayedData(): void {
    if (this.paginator) {
      const startIndex = this.paginator.pageIndex * this.paginator.pageSize;
      const endIndex = startIndex + this.paginator.pageSize;
      this.dataSource.data = this.filteredData.slice(startIndex, endIndex);
    } else {
      this.dataSource.data = [...this.filteredData];
    }
  }

  checkToggleAllState(): void {
    const allEnabled = this.filteredData.every((faculty) => faculty.is_enabled);
    this.isToggleAllChecked = allEnabled;
  }

  onToggleChange(faculty: Faculty): void {
    const status = faculty.is_enabled;

    this.preferencesService
      .toggleFacultyPreferences(faculty.faculty_id, status)
      .subscribe(
        (response) => {
          this.snackBar.open(
            `Preferences submission ${
              status ? 'enabled' : 'disabled'
            } for Prof. ${faculty.facultyName}.`,
            'Close',
            { duration: 3000 }
          );
          this.checkToggleAllState();
        },
        (error) => {
          this.snackBar.open(
            `Failed to update preference for ${faculty.facultyName}`,
            'Close',
            { duration: 3000 }
          );
          console.error('Error updating faculty preference:', error);
        }
      );
  }

  onToggleAllChange(event: MatSlideToggleChange): void {
    const status = event.checked;

    const loadingSnackBarRef = this.snackBar.open(
      'Loading, please wait...',
      'Close',
      {
        duration: undefined,
      }
    );

    this.preferencesService.toggleAllFacultyPreferences(status).subscribe(
      (response) => {
        this.filteredData.forEach((faculty) => (faculty.is_enabled = status));
        this.updateDisplayedData();
        loadingSnackBarRef.dismiss();

        this.snackBar.open(
          `Preferences submission for all faculty is ${
            status ? 'enabled' : 'disabled'
          }.`,
          'Close',
          { duration: 3000 }
        );

        this.isToggleAllChecked = status;
      },
      (error) => {
        loadingSnackBarRef.dismiss();

        this.snackBar.open(
          'Failed to update preferences for all faculty',
          'Close',
          { duration: 3000 }
        );
        console.error('Error updating all preferences:', error);
      }
    );
  }

  onInputChange(inputValues: { [key: string]: any }): void {
    const searchValue = inputValues['searchFaculty'] || '';
    this.applyFilter(searchValue);
  }
  
  onView(faculty: Faculty): void {
    const dialogRef = this.dialog.open(DialogPrefComponent, {
      maxWidth: '70rem',
      width: '100%',
      data: faculty,
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((result) => {
      console.log('Dialog closed', result);
    });
  }

  onExportAll(): void {
    if (!this.allData.length) {
      this.snackBar.open(
        'No faculty preferences available for export.',
        'Close',
        { duration: 3000 }
      );
      return;
    }

    const firstActiveSemesterFaculty = this.allData.find(
      (faculty) =>
        faculty.active_semesters && faculty.active_semesters.length > 0
    );

    if (!firstActiveSemesterFaculty) {
      this.snackBar.open(
        'No active semester data available for export.',
        'Close',
        { duration: 3000 }
      );
      return;
    }

    const { academic_year, semester_label } =
      firstActiveSemesterFaculty.active_semesters![0];

    const dialogRef = this.dialog.open(DialogExportComponent, {
      maxWidth: '70rem',
      width: '100%',
      data: {
        exportType: 'all',
        entity: 'faculty',
        entityData: {
          name: 'Export All Faculty Preferences',
          academic_year,
          semester_label,
        },
        generatePdfFunction: () =>
          this.generateFacultyPDF(true, this.allData, true),
      },
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((result) => {
      console.log('Export All dialog closed', result);
    });
  }

  onExportSingle(faculty: Faculty): void {
    const activeSemester = faculty.active_semesters?.[0];
    if (!activeSemester || !activeSemester.courses?.length) {
      const message = !activeSemester
        ? `No active semesters available for ${faculty.facultyName}.`
        : `No courses available for ${faculty.facultyName}.`;
      this.snackBar.open(message, 'Close', { duration: 3000 });
      return;
    }

    const dialogRef = this.dialog.open(DialogExportComponent, {
      maxWidth: '70rem',
      width: '100%',
      data: {
        exportType: 'single',
        entity: 'faculty',
        entityData: {
          name: faculty.facultyName,
          academic_year: activeSemester.academic_year,
          semester_label: activeSemester.semester_label,
        },
        generatePdfFunction: () =>
          this.generateFacultyPDF(false, [faculty], true),
      },
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((result) => {
      console.log('Export Single dialog closed', result);
    });
  }

  generateFacultyPDF(
    isAll: boolean,
    faculties: Faculty[],
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

    faculties.forEach((faculty, facultyIndex) => {
      const activeSemester = faculty.active_semesters?.[0];

      if (!activeSemester || !activeSemester.courses?.length) return;

      // Faculty Info Section
      doc.setFontSize(normalFont.size);
      doc.setFont(normalFont.font, normalFont.style);
      const facultyInfo = [
        `Faculty Name: ${faculty.facultyName}`,
        `Faculty Code: ${faculty.facultyCode}`,
        `Academic Year: ${activeSemester.academic_year}`,
        `Semester: ${activeSemester.semester_label}`,
      ];

      facultyInfo.forEach((info) => {
        doc.text(info, margin, currentY);
        currentY += 5;
      });
      currentY += 5;

      const courseData = activeSemester.courses.map(
        (course: any, index: number) => [
          (index + 1).toString(),
          course.course_details?.course_code || 'N/A',
          course.course_details?.course_title || 'N/A',
          course.lec_hours.toString(),
          course.lab_hours.toString(),
          course.units.toString(),
          course.preferred_day,
          `${this.formatTimeTo12Hour(
            course.preferred_start_time
          )} - ${this.formatTimeTo12Hour(course.preferred_end_time)}`,
        ]
      );

      // Constants for table styling
      const tableHead = [
        [
          '#',
          'Course Code',
          'Course Title',
          'Lec',
          'Lab',
          'Units',
          'Preferred Day',
          'Preferred Time',
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
          6: { cellWidth: 25 },
          7: { cellWidth: 35 },
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
      doc.save(
        isAll
          ? 'all_faculty_preferences_report.pdf'
          : 'faculty_preferences_report.pdf'
      );
    }
  }

  formatTimeTo12Hour(time: string): string {
    const [hour, minute] = time.split(':');
    const hours = parseInt(hour, 10);
    const minutesFormatted = minute.length === 2 ? minute : `0${minute}`;
    const period = hours >= 12 ? 'PM' : 'AM';
    const formattedHour = hours % 12 || 12;
    return `${formattedHour}:${minutesFormatted} ${period}`;
  }
}
