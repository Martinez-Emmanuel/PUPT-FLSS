import {
  Component,
  OnInit,
  AfterViewInit,
  ViewChild,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { BehaviorSubject } from 'rxjs';
import { filter } from 'rxjs/operators';

import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import {
  MatSlideToggleModule,
  MatSlideToggleChange,
} from '@angular/material/slide-toggle';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { MatSymbolDirective } from '../../../imports/mat-symbol.directive';

import {
  TableHeaderComponent,
  InputField,
} from '../../../../shared/table-header/table-header.component';
import { LoadingComponent } from '../../../../shared/loading/loading.component';
import { DialogPrefComponent } from '../../../../shared/dialog-pref/dialog-pref.component';
import { DialogExportComponent } from '../../../../shared/dialog-export/dialog-export.component';
import {
  DialogActionComponent,
  DialogActionData,
} from '../../../../shared/dialog-action/dialog-action.component';

import {
  PreferencesService,
  ActiveSemester,
} from '../../../services/faculty/preference/preferences.service';

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
  has_request: number;
  active_semesters?: ActiveSemester[];
}

@Component({
  selector: 'app-faculty-pref',
  standalone: true,
  imports: [
    CommonModule,
    TableHeaderComponent,
    LoadingComponent,
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
    // 'facultyUnits',
    'action',
    'requests',
    'toggle',
  ];

  // ===========================
  // Data Properties
  // ===========================

  // Data source for the material table
  dataSource = new MatTableDataSource<Faculty>([]);
  allData: Faculty[] = [];
  filteredData: Faculty[] = [];
  currentFilter = '';

  // Toggle states
  isToggleAllChecked = false;
  isAnyIndividualToggleOn = false;

  // Loading state
  isLoading = new BehaviorSubject<boolean>(true);

  // Preferences state
  hasAnyPreferences = false;
  hasIndividualDeadlines = false;

  @ViewChild(MatPaginator) paginator?: MatPaginator;

  constructor(
    private preferencesService: PreferencesService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.preferencesService.clearPreferencesCache();
    this.loadFacultyPreferences();
    this.setupFilterPredicate();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator ?? null;
    this.applyFilter(this.currentFilter);
  }

  // ===========================
  // Data Loading and Handling
  // ===========================

  /**
   * Sets up the filter predicate for the data source.
   */
  private setupFilterPredicate(): void {
    this.dataSource.filterPredicate = (data: Faculty, filter: string) => {
      return (
        data.facultyName.toLowerCase().includes(filter) ||
        data.facultyCode.toLowerCase().includes(filter) ||
        data.facultyType.toLowerCase().includes(filter)
      );
    };
  }

  /**
   * Loads faculty preferences from the service.
   */
  loadFacultyPreferences(): void {
    this.isLoading.next(true);
    this.preferencesService
      .getPreferences()
      .pipe(filter((response) => !!response))
      .subscribe(
        (response) => {
          const faculties = response.preferences.map((faculty: any) => ({
            faculty_id: faculty.faculty_id,
            facultyName: faculty.faculty_name,
            facultyCode: faculty.faculty_code,
            facultyType: faculty.faculty_type,
            facultyUnits: faculty.faculty_units,
            has_request: faculty.has_request,
            is_enabled: faculty.is_enabled === 1,
            active_semesters: faculty.active_semesters,
          }));

          this.allData = faculties;
          this.filteredData = faculties;
          this.applyFilter(this.currentFilter);
          this.checkToggleAllState();
          this.updateHasAnyPreferences();
          this.updateIndividualDeadlinesState();
          this.isLoading.next(false);
        },
        (error) => {
          console.error('Error loading faculty preferences:', error);
          this.snackBar.open(
            'Error loading faculty preferences. Please try again.',
            'Close',
            { duration: 3000 }
          );
          this.isLoading.next(false);
        }
      );
  }

  /**
   * Applies the filter to the data source.
   * @param filterValue The filter string.
   */
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

  /**
   * Custom filter predicate for the data source.
   * @param data The faculty data.
   * @param filter The filter string.
   * @returns Whether the data matches the filter.
   */
  filterPredicate(data: Faculty, filter: string): boolean {
    return (
      data.facultyName.toLowerCase().includes(filter) ||
      data.facultyCode.toLowerCase().includes(filter) ||
      data.facultyType.toLowerCase().includes(filter)
    );
  }

  /**
   * Updates the data displayed in the table based on pagination.
   */
  updateDisplayedData(): void {
    if (this.paginator) {
      const startIndex = this.paginator.pageIndex * this.paginator.pageSize;
      const endIndex = startIndex + this.paginator.pageSize;
      this.dataSource.data = this.filteredData.slice(startIndex, endIndex);
    } else {
      this.dataSource.data = [...this.filteredData];
    }
  }

  /**
   * Handles changes in input fields.
   * @param inputValues The current input values.
   */
  onInputChange(inputValues: { [key: string]: any }): void {
    const searchValue = inputValues['searchFaculty'] || '';
    this.applyFilter(searchValue);
  }

  // ===========================
  // Toggle Management
  // ===========================

  /**
   * Checks and updates the state of the "Toggle All" checkbox.
   */
  checkToggleAllState(): void {
    const allEnabled = this.filteredData.every((faculty) => faculty.is_enabled);
    this.isToggleAllChecked = allEnabled;

    this.isAnyIndividualToggleOn = this.filteredData.some(
      (faculty) => faculty.is_enabled
    );
  }

  /**
   * Updates the state indicating if any faculty has submitted preferences.
   */
  updateHasAnyPreferences(): void {
    this.hasAnyPreferences = this.allData.some((faculty) =>
      this.hasSubmittedPreferences(faculty)
    );
  }

  /**
   * Checks if a faculty has submitted preferences.
   */
  hasSubmittedPreferences(faculty: Faculty): boolean {
    return !!(
      faculty.active_semesters &&
      faculty.active_semesters.length > 0 &&
      faculty.active_semesters.some(
        (semester) => semester.courses && semester.courses.length > 0
      )
    );
  }

  /**
   * Updates the state indicating if any faculty has individual deadlines.
   */
  updateIndividualDeadlinesState(): void {
    this.hasIndividualDeadlines = this.allData.some((faculty) =>
      faculty.active_semesters?.some(
        (semester) =>
          semester.individual_deadline &&
          (!semester.global_deadline ||
            new Date(semester.individual_deadline) !==
              new Date(semester.global_deadline))
      )
    );
  }

  /**
   * Handles the toggle action for all preferences.
   * @param event The slide toggle change event.
   */
  onToggleAllPreferences(event: MatSlideToggleChange): void {
    event.source.checked = this.isToggleAllChecked;

    const existingDeadline = this.allData[0]?.active_semesters?.[0]
      ?.global_deadline
      ? new Date(this.allData[0].active_semesters[0].global_deadline)
      : null;

    const hasIndividualDeadlines = this.hasIndividualDeadlines;

    const dialogData: DialogActionData = {
      type: 'all_preferences',
      academicYear: this.allData[0]?.active_semesters?.[0]?.academic_year || '',
      semester: this.allData[0]?.active_semesters?.[0]?.semester_label || '',
      currentState: this.isToggleAllChecked,
      hasSecondaryText: false,
      global_deadline: existingDeadline,
      hasIndividualDeadlines: hasIndividualDeadlines,
    };

    const dialogRef = this.dialog.open(DialogActionComponent, {
      data: dialogData,
      disableClose: true,
      autoFocus: false,
    });

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        const newStatus = this.isToggleAllChecked;
        this.filteredData.forEach(
          (faculty) => (faculty.is_enabled = newStatus)
        );
        this.isToggleAllChecked = newStatus;
        this.updateDisplayedData();
        this.cdr.markForCheck();
      }
    });
  }

  /**
   * Handles the toggle action for a single faculty's preferences.
   * @param faculty The faculty being toggled.
   * @param event The slide toggle change event.
   */
  onToggleSinglePreferences(
    faculty: Faculty,
    event: MatSlideToggleChange
  ): void {
    event.source.checked = faculty.is_enabled;

    const dialogData: DialogActionData = {
      type: 'single_preferences',
      academicYear: faculty.active_semesters?.[0]?.academic_year || '',
      semester: faculty.active_semesters?.[0]?.semester_label || '',
      currentState: faculty.is_enabled,
      hasSecondaryText: false,
      facultyName: faculty.facultyName,
      faculty_id: faculty.faculty_id,
      individual_deadline:
        faculty.active_semesters?.[0]?.individual_deadline || null,
    };

    const dialogRef = this.dialog.open(DialogActionComponent, {
      data: dialogData,
      disableClose: true,
      autoFocus: false,
    });

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        faculty.is_enabled = !faculty.is_enabled;

        this.preferencesService.getPreferences().subscribe((response) => {
          const updatedFaculty = response?.preferences?.find(
            (item: any) => item.faculty_id === faculty.faculty_id
          );
          if (updatedFaculty) {
            faculty.active_semesters = updatedFaculty.active_semesters;
          }

          this.updateDisplayedData();
          this.checkToggleAllState();
          this.cdr.markForCheck();
        });
      }
    });
  }

  // ===========================
  // View & Export Functionality
  // ===========================

  /**
   * Opens the view dialog for a specific faculty.
   */
  onView(faculty: Faculty): void {
    const generatePdfFunction = (preview: boolean): Blob | void => {
      return this.generateFacultyPDF(false, [faculty], preview);
    };

    this.dialog.open(DialogPrefComponent, {
      maxWidth: '70rem',
      width: '100%',
      data: {
        facultyName: faculty.facultyName,
        faculty_id: faculty.faculty_id,
        generatePdfFunction: generatePdfFunction,
      },
      disableClose: true,
    });
  }

  /**
   * Exports all faculty preferences as a PDF.
   */
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
        generateFileNameFunction: () =>
          `${academic_year.replace(
            '/',
            '_'
          )}_${semester_label.toLowerCase()}_faculty_preferences_report.pdf`,
      },
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((result) => {
      // console.log('Export All dialog closed', result);
    });
  }

  /**
   * Exports a single faculty's preferences as a PDF.
   */
  onExportSingle(faculty: Faculty): void {
    const activeSemester = faculty.active_semesters?.[0];
    if (!activeSemester || !activeSemester.courses?.length) {
      const message = !activeSemester
        ? `No active semesters available for ${faculty.facultyName}.`
        : `No preferences available for ${faculty.facultyName}.`;
      this.snackBar.open(message, 'Close', { duration: 3000 });
      return;
    }

    this.generateFacultyPDF(false, [faculty], false);

    this.snackBar.open(
      `Downloading PDF for ${faculty.facultyName}...`,
      'Close',
      { duration: 3000 }
    );
  }

  /**
   * Generates a PDF for faculty preferences.
   */
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

      // Table Configuration
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
      let fileName = 'faculty_preferences_report.pdf';

      if (isAll) {
        const firstFaculty = faculties[0];
        const activeSemester = firstFaculty.active_semesters?.[0];
        if (activeSemester) {
          const academicYear = activeSemester.academic_year.replace('/', '_');
          const semester = activeSemester.semester_label.toLowerCase();
          fileName = `${academicYear}_${semester}_faculty_preferences.pdf`;
        }
      } else {
        fileName = `${this.sanitizeFileName(
          faculties[0].facultyName
        )}_preferences_report.pdf`;
      }

      doc.save(fileName);
    }
  }

  /**
   * Generates a sanitized file name.
   */
  sanitizeFileName(fileName: string): string {
    return fileName.toLowerCase().replace(/[^a-z0-9]/g, '_');
  }

  /**
   * Formats time from 24-hour to 12-hour format.
   */
  formatTimeTo12Hour(time: string): string {
    const [hour, minute] = time.split(':');
    const hours = parseInt(hour, 10);
    const minutesFormatted = minute.length === 2 ? minute : `0${minute}`;
    const period = hours >= 12 ? 'PM' : 'AM';
    const formattedHour = hours % 12 || 12;
    return `${formattedHour}:${minutesFormatted} ${period}`;
  }

  // ===========================
  // Utility Methods
  // ===========================

  /**
   * Gets the tooltip text for a single faculty toggle.
   */
  getSingleToggleTooltip(faculty: Faculty): string {
    if (this.isToggleAllChecked) {
      return `Global preferences submission is active 
      – individual changes disabled`;
    }
    return `${
      faculty.is_enabled ? 'Disable' : 'Enable'
    } preferences submission for ${faculty.facultyName}`;
  }

  /**
   * Gets the tooltip text for the "Toggle All" checkbox.
   */
  getAllToggleTooltip(isEnabled: boolean): string {
    if (this.hasIndividualDeadlines && !this.isToggleAllChecked) {
      return `Global preferences toggle is disabled 
        because individual deadlines are set`;
    }
    return `${
      isEnabled ? 'Disable' : 'Enable'
    } preferences submission for all faculty`;
  }
}
