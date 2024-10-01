import { Component, OnInit, AfterViewInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef, ViewChild, ElementRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';

import { MatTableModule } from '@angular/material/table';
import { MatTableDataSource } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatMenuModule } from '@angular/material/menu';
import { MatRippleModule } from '@angular/material/core';

import { TimeFormatPipe } from '../../../pipes/time-format/time-format.pipe';
import { MatSymbolDirective } from '../../../imports/mat-symbol.directive';

import { TableDialogComponent } from '../../../../shared/table-dialog/table-dialog.component';
import { DialogTimeComponent } from '../../../../shared/dialog-time/dialog-time.component';
import { DialogGenericComponent, DialogData } from '../../../../shared/dialog-generic/dialog-generic.component';

import { ThemeService } from '../../../services/theme/theme.service';
import { PreferencesService, Program, Course, YearLevel } from '../../../services/faculty/preference/preferences.service';
import { CookieService } from 'ngx-cookie-service';

import { fadeAnimation, cardEntranceAnimation } from '../../../animations/animations';

interface TableData extends Course {
  preferredDay: string;
  preferredTime: string;
}

@Component({
  selector: 'app-preferences',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableDialogComponent,
    DialogTimeComponent,
    TimeFormatPipe,
    MatSymbolDirective,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatOptionModule,
    MatFormFieldModule,
    MatInputModule,
    MatTooltipModule,
    MatSnackBarModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    MatMenuModule,
    MatRippleModule,
  ],
  templateUrl: './preferences.component.html',
  styleUrls: ['./preferences.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [PreferencesService],
  animations: [fadeAnimation, cardEntranceAnimation],
})
export class PreferencesComponent implements OnInit, AfterViewInit, OnDestroy {
  showSidenav = false;
  showProgramSelection = true;
  isDarkMode = false;

  programs: Program[] = [];
  courses: Course[] = [];
  filteredCourses: Course[] = [];
  selectedProgram?: Program;
  selectedYearLevel: number | null = null;
  dynamicYearLevels: number[] = [];
  allSelectedCourses: TableData[] = [];
  dataSource = new MatTableDataSource<TableData>([]);
  subscriptions = new Subscription();

  programsLoading = false;
  loading = true;

  units = 0;
  readonly maxUnits = 25;
  readonly displayedColumns: string[] = [
    'action',
    'num',
    'course_code',
    'course_title',
    'lec_hours',
    'lab_hours',
    'units',
    'preferredDay',
    'preferredTime',
  ];
  readonly daysOfWeek = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday',
  ];

  searchQuery = '';
  filteredSearchResults: Course[] = [];
  @ViewChild('searchInput') searchInput!: ElementRef;

  constructor(
    private readonly themeService: ThemeService,
    private readonly cdr: ChangeDetectorRef,
    private readonly dialog: MatDialog,
    private readonly preferencesService: PreferencesService,
    private readonly snackBar: MatSnackBar,
    private readonly cookieService: CookieService
  ) {}

  ngOnInit() {
    this.subscribeToThemeChanges();
    this.loadPrograms();
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.showSidenav = true;
      this.cdr.markForCheck();
    }, 0);
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  // ======================
  // Initialization Methods
  // ======================

  private loadPrograms() {
    this.programsLoading = true;

    this.preferencesService.getPrograms().subscribe({
      next: (programs) => {
        this.programs = programs;
        this.programsLoading = false;
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('Error loading programs:', error);
        this.programsLoading = false;
        this.showSnackBar('Error loading programs.');
        this.cdr.markForCheck();
      },
    });
  }

  private subscribeToThemeChanges() {
    this.subscriptions.add(
      this.themeService.isDarkTheme$.subscribe((isDark) => {
        this.isDarkMode = isDark;
        this.cdr.markForCheck();
      })
    );
  }

  // =========================
  // Program Selection Methods
  // =========================

  selectProgram(program: Program): void {
    this.selectedProgram = program;
    this.loading = true;
    this.showProgramSelection = false;

    this.dynamicYearLevels = program.year_levels.map(
      (yearLevel) => yearLevel.year_level
    );

    const uniqueCourses = new Set<string>();
    this.courses = program.year_levels
      .flatMap((yearLevel) => yearLevel.semester.courses)
      .filter((course) => {
        if (uniqueCourses.has(course.course_code)) {
          return false;
        }
        uniqueCourses.add(course.course_code);
        return true;
      });

    this.filteredCourses = this.courses;
    this.loading = false;
    this.selectedYearLevel = null;
    this.updateDataSource();
    this.cdr.markForCheck();
  }

  filterByYear(year: number | null): void {
    this.selectedYearLevel = year;
    this.applyYearLevelFilter();
    this.cdr.markForCheck();
  }

  backToProgramSelection(): void {
    this.showProgramSelection = true;
    this.selectedProgram = undefined;
    this.courses = [];
    this.filteredCourses = [];
    this.selectedYearLevel = null;
    this.updateDataSource();
    this.cdr.markForCheck();
  }

  // ====================
  // Search Methods
  // ====================

  onSearchInput(): void {
    const query = this.searchQuery.toLowerCase().trim();
    if (query.length > 0) {
      const uniqueCourses = new Set<string>();
      this.filteredSearchResults = this.showProgramSelection
        ? this.programs
            .flatMap((program) =>
              program.year_levels.flatMap((yl) => yl.semester.courses)
            )
            .filter(
              (course) =>
                (course.course_code.toLowerCase().includes(query) ||
                  course.course_title.toLowerCase().includes(query)) &&
                !uniqueCourses.has(course.course_code) &&
                uniqueCourses.add(course.course_code)
            )
        : this.filteredCourses.filter(
            (course) =>
              (course.course_code.toLowerCase().includes(query) ||
                course.course_title.toLowerCase().includes(query)) &&
              !uniqueCourses.has(course.course_code) &&
              uniqueCourses.add(course.course_code)
          );
    } else {
      this.filteredSearchResults = [];
    }
    this.cdr.markForCheck();
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.filteredSearchResults = [];
    this.searchInput.nativeElement.focus();
    this.cdr.markForCheck();
  }

  // =========================
  // Course Management Methods
  // =========================

  addCourseToTable(course: Course): void {
    if (this.isCourseAlreadyAdded(course) || this.isMaxUnitsExceeded(course)) {
      return;
    }

    const newCourse: TableData = {
      ...course,
      preferredDay: '',
      preferredTime: '',
    };
    this.allSelectedCourses.push(newCourse);
    this.updateDataSource();
    this.updateTotalUnits();
  }

  removeCourse(course_code: string): void {
    this.allSelectedCourses = this.allSelectedCourses.filter(
      (course) => course.course_code !== course_code
    );
    this.updateDataSource();
    this.updateTotalUnits();
  }

  removeAllCourses(): void {
    const dialogData: DialogData = {
      title: 'Remove All Courses',
      content: 'Are you sure you want to remove all your selected courses?',
      actionText: 'Remove All',
      cancelText: 'Cancel',
      action: 'remove',
    };

    this.dialog
      .open(DialogGenericComponent, {
        data: dialogData,
        disableClose: true,
        panelClass: 'dialog-base',
      })
      .afterClosed()
      .subscribe((result) => {
        if (result === 'remove') {
          this.allSelectedCourses = [];
          this.updateDataSource();
          this.updateTotalUnits();
          this.showSnackBar('All selected courses have been removed.');
        }
      });
  }

  // ====================
  // Preference Submission Methods
  // ====================

  submitPreferences(): void {
    const facultyId = this.cookieService.get('faculty_id');
    if (!facultyId) {
      this.showSnackBar('Error: Faculty ID not found.');
      return;
    }
    const submittedData = this.prepareSubmissionData(facultyId);

    this.preferencesService.submitPreferences(submittedData).subscribe({
      next: () => this.showSuccessModal('Preferences submitted successfully.'),
      error: (error) => {
        console.error('Error submitting preferences:', error);
        this.showSnackBar('Error submitting preferences.');
      },
    });
  }

  private prepareSubmissionData(facultyId: string) {
    return {
      faculty_id: facultyId,
      preferences: this.dataSource.data.map(
        ({ course_id, preferredDay, preferredTime }) => ({
          course_id,
          preferred_day: preferredDay,
          preferred_time: preferredTime,
        })
      ),
    };
  }

  // ====================
  // Dialog Methods
  // ====================

  private showSuccessModal(message: string): void {
    const dialogData: DialogData = {
      title: 'Success',
      content: message,
      actionText: 'OK',
      cancelText: '',
      action: 'confirm',
    };

    this.dialog.open(DialogGenericComponent, {
      data: dialogData,
      disableClose: true,
    });
  }

  openTimeDialog(element: TableData): void {
    const [startTime, endTime] = element.preferredTime?.split(' - ') || [
      '',
      '',
    ];
    const isWholeDay = element.preferredTime === 'Whole Day';

    this.dialog
      .open(DialogTimeComponent, {
        width: '300px',
        data: { startTime, endTime, isWholeDay },
      })
      .afterClosed()
      .subscribe((result) => {
        if (result) {
          element.preferredTime = result;
          this.updateTotalUnits();
          this.cdr.markForCheck();
        }
      });
  }

  openDayDialog(element: TableData): void {
    const dialogRef = this.dialog.open(TableDialogComponent, {
      data: {
        title: 'Select Day',
        fields: [
          {
            label: 'Preferred Day',
            formControlName: 'preferredDay',
            type: 'select',
            options: this.daysOfWeek,
            required: true,
          },
        ],
        isEdit: false,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result && result.preferredDay) {
        element.preferredDay = result.preferredDay;
        this.showSnackBar('Preferred day successfully added.');
        this.updateTotalUnits();
        this.cdr.markForCheck();
      }
    });
  }

  // ====================
  // Utility Methods
  // ====================

  private applyYearLevelFilter(): void {
    if (this.selectedYearLevel === null || !this.selectedProgram) {
      this.filteredCourses = this.courses;
    } else {
      const yearLevel = this.selectedProgram.year_levels.find(
        (yl: YearLevel) => yl.year_level === this.selectedYearLevel
      );

      this.filteredCourses = yearLevel ? yearLevel.semester.courses : [];
    }
    this.cdr.markForCheck();
  }

  private isCourseAlreadyAdded(course: Course): boolean {
    if (
      this.dataSource.data.some(
        (subject) => subject.course_code === course.course_code
      )
    ) {
      this.showSnackBar('This course has already been selected.');
      return true;
    }
    return false;
  }

  private isMaxUnitsExceeded(course: Course): boolean {
    if (this.units + course.units > this.maxUnits) {
      this.showSnackBar('Maximum units have been reached.');
      return true;
    }
    return false;
  }

  private updateDataSource(): void {
    this.dataSource.data = [...this.allSelectedCourses];
  }

  private updateTotalUnits(): void {
    this.units = this.dataSource.data.reduce(
      (total, course) => total + course.units,
      0
    );
    this.cdr.markForCheck();
  }

  private showSnackBar(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
    });
  }

  trackByProgramId(index: number, program: Program): number {
    return program.program_id;
  }

  trackByCourseId(index: number, course: Course): number {
    return course.course_assignment_id;
  }

  get isRemoveDisabled(): boolean {
    return this.dataSource.data.length === 0;
  }

  get isSubmitDisabled(): boolean {
    return (
      this.isRemoveDisabled ||
      this.dataSource.data.some(
        (course) => !course.preferredDay || !course.preferredTime
      )
    );
  }
}
