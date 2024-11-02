import { Component, OnInit, AfterViewInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef, ViewChild, ElementRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';

import { MatTableModule } from '@angular/material/table';
import { MatTableDataSource } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
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
import { DialogPrefSuccessComponent } from '../../../../shared/dialog-pref-success/dialog-pref-success.component';
import { LoadingComponent } from '../../../../shared/loading/loading.component';

import { ThemeService } from '../../../services/theme/theme.service';
import { PreferencesService, Program, Course, YearLevel } from '../../../services/faculty/preference/preferences.service';
import { CookieService } from 'ngx-cookie-service';

import { fadeAnimation, cardEntranceAnimation, rowAdditionAnimation } from '../../../animations/animations';

interface TableData extends Course {
  preferredDay: string;
  preferredTime: string;
  isSubmitted: boolean;
}

@Component({
  selector: 'app-preferences',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableDialogComponent,
    DialogTimeComponent,
    DialogPrefSuccessComponent,
    LoadingComponent,
    TimeFormatPipe,
    MatSymbolDirective,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
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
  animations: [fadeAnimation, cardEntranceAnimation, rowAdditionAnimation],
})
export class PreferencesComponent implements OnInit, AfterViewInit, OnDestroy {
  showSidenav = false;
  showProgramSelection = true;
  isDarkMode = false;
  isLoading = true;
  isSubmitting = false;

  academicYear: string = '';
  semesterLabel: string = '';
  programs: Program[] = [];
  courses: Course[] = [];
  filteredCourses: Course[] = [];
  selectedProgram?: Program;
  selectedYearLevel: number | null = null;
  dynamicYearLevels: number[] = [];
  allSelectedCourses: TableData[] = [];
  dataSource = new MatTableDataSource<TableData>([]);
  subscriptions = new Subscription();

  units = 0;
  maxUnits = 0;
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

  isPreferencesEnabled: boolean = true;
  activeSemesterId: number | null = null;
  deadline: string | null = null;

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

    const facultyUnits = parseInt(
      this.cookieService.get('faculty_units') || '',
      10
    );

    if (!isNaN(facultyUnits)) {
      this.maxUnits = facultyUnits;
    } else {
      console.warn('No valid faculty units found in cookies.');
    }

    this.loadAllData();
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

  private loadAllData() {
    this.isLoading = true;

    const programs$ = this.preferencesService.getPrograms();
    const facultyId = this.cookieService.get('faculty_id');
    const preferences$ =
      this.preferencesService.getPreferencesByFacultyId(facultyId);

    this.subscriptions.add(
      programs$.subscribe({
        next: (programsResponse) => {
          this.programs = programsResponse.programs;
          this.activeSemesterId = programsResponse.active_semester_id;
          this.cdr.markForCheck();
        },
        error: (error) => {
          console.error('Error loading programs:', error);
          this.showSnackBar('Error loading programs.');
          this.isLoading = false;
          this.cdr.markForCheck();
        },
      })
    );

    this.subscriptions.add(
      preferences$.subscribe({
        next: (preferencesResponse) => {
          const facultyPreference = preferencesResponse.preferences;

          if (facultyPreference) {
            this.isPreferencesEnabled = facultyPreference.is_enabled === 1;

            const activeSemester = facultyPreference.active_semesters[0];
            this.academicYear = activeSemester.academic_year;
            this.semesterLabel = activeSemester.semester_label;
            this.deadline =
              activeSemester.individual_deadline ||
              activeSemester.global_deadline;

            const preferences = activeSemester.courses.map((course: any) => ({
              course_id: course.course_details.course_id,
              course_assignment_id: course.course_assignment_id,
              course_code: course.course_details.course_code,
              course_title: course.course_details.course_title,
              lec_hours: course.lec_hours,
              lab_hours: course.lab_hours,
              units: course.units,
              preferredDay: course.preferred_day,
              preferredTime:
                course.preferred_start_time === '00:00:00' &&
                course.preferred_end_time === '23:59:59'
                  ? 'Whole Day'
                  : course.preferred_start_time && course.preferred_end_time
                  ? `${this.convertTo12HourFormat(course.preferred_start_time)} 
                    - ${this.convertTo12HourFormat(course.preferred_end_time)}`
                  : '',
              isSubmitted: true,
            }));

            this.allSelectedCourses = preferences;
            this.updateDataSource();
            this.updateTotalUnits();
          } else {
            this.isPreferencesEnabled = true;
          }

          this.isLoading = false;
          this.cdr.markForCheck();
        },
        error: (error) => {
          console.error('Error loading preferences:', error);
          this.showSnackBar('Error loading preferences.');
          this.isLoading = false;
          this.cdr.markForCheck();
        },
      })
    );
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
    if (!this.isPreferencesEnabled) {
      this.showSnackBar('You have already submitted your preferences.');
      return;
    }

    this.selectedProgram = program;
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
    this.selectedYearLevel = null;
    this.updateDataSource();
    this.updateTotalUnits();
    this.cdr.markForCheck();
  }

  filterByYear(year: number | null): void {
    if (!this.isPreferencesEnabled) {
      this.showSnackBar('You have already submitted your preferences.');
      return;
    }

    this.selectedYearLevel = year;
    this.applyYearLevelFilter();
    this.cdr.markForCheck();
  }

  backToProgramSelection(): void {
    if (!this.isPreferencesEnabled) {
      this.showSnackBar('You have already submitted your preferences.');
      return;
    }

    this.showProgramSelection = true;
    this.selectedProgram = undefined;
    this.courses = [];
    this.filteredCourses = [];
    this.selectedYearLevel = null;
    this.updateDataSource();
    this.updateTotalUnits();
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
    if (!this.isPreferencesEnabled) {
      this.showSnackBar('You have already submitted your preferences.');
      return;
    }

    // if (this.isCourseAlreadyAdded(course) || this.isMaxUnitsExceeded(course)) {
    //   return;
    // }

    const newCourse: TableData = {
      ...course,
      preferredDay: '',
      preferredTime: '',
      isSubmitted: false,
    };
    this.allSelectedCourses.push(newCourse);
    this.updateDataSource();
    this.updateTotalUnits();
  }

  removeCourse(course: TableData): void {
    if (!this.isPreferencesEnabled) {
      this.showSnackBar('You have already submitted your preferences.');
      return;
    }

    if (course.isSubmitted) {
      const facultyId = this.cookieService.get('faculty_id');
      const activeSemesterId = this.activeSemesterId;

      if (!facultyId || !activeSemesterId) {
        this.showSnackBar('Error: Missing faculty or semester information.');
        return;
      }

      this.preferencesService
        .deletePreference(
          course.course_assignment_id,
          facultyId,
          activeSemesterId
        )
        .subscribe({
          next: () => {
            this.allSelectedCourses = this.allSelectedCourses.filter(
              (c) => c.course_code !== course.course_code
            );
            this.updateDataSource();
            this.updateTotalUnits();
            this.showSnackBar('Course preference removed successfully.');
          },
          error: (error) => {
            console.error('Error deleting preference:', error);
            this.showSnackBar('Error removing course preference.');
          },
        });
    } else {
      this.allSelectedCourses = this.allSelectedCourses.filter(
        (c) => c.course_code !== course.course_code
      );
      this.updateDataSource();
      this.updateTotalUnits();
    }
  }

  removeAllCourses(): void {
    if (!this.isPreferencesEnabled) {
      this.showSnackBar('You have already submitted your preferences.');
      return;
    }

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
          const facultyId = this.cookieService.get('faculty_id');
          const activeSemesterId = this.activeSemesterId;

          if (!facultyId || !activeSemesterId) {
            this.showSnackBar(
              'Error: Missing faculty or semester information.'
            );
            return;
          }

          const submittedCourses = this.allSelectedCourses.filter(
            (c) => c.isSubmitted
          );
          const nonSubmittedCourses = this.allSelectedCourses.filter(
            (c) => !c.isSubmitted
          );

          if (submittedCourses.length > 0) {
            this.preferencesService
              .deleteAllPreferences(facultyId, activeSemesterId)
              .subscribe({
                next: () => {
                  this.allSelectedCourses = nonSubmittedCourses;
                  this.updateDataSource();
                  this.updateTotalUnits();
                  this.showSnackBar(
                    'All submitted course preferences removed successfully.'
                  );
                },
                error: (error) => {
                  console.error('Error deleting preferences:', error);
                  this.showSnackBar('Error removing course preferences.');
                },
              });
          } else {
            this.allSelectedCourses = [];
            this.updateDataSource();
            this.updateTotalUnits();
            this.showSnackBar('All course preferences removed successfully.');
          }
        }
      });
  }

  // ====================
  // Preference Submission Methods
  // ====================

  submitPreferences(): void {
    if (!this.isPreferencesEnabled || this.isSubmitting) {
      this.showSnackBar('You have already submitted your preferences.');
      return;
    }

    const facultyId = this.cookieService.get('faculty_id');
    if (!facultyId) {
      this.showSnackBar('Error: Faculty ID not found.');
      return;
    }

    if (!this.activeSemesterId) {
      this.showSnackBar('Error: Active semester not found.');
      return;
    }

    for (const course of this.dataSource.data) {
      if (!course.preferredDay || !course.preferredTime) {
        this.showSnackBar(
          'Please select preferred day and time for all courses.'
        );
        return;
      }
    }

    this.isSubmitting = true;
    this.cdr.markForCheck();

    const submittedData = this.prepareSubmissionData(
      facultyId,
      this.activeSemesterId
    );

    this.preferencesService.submitPreferences(submittedData).subscribe({
      next: () => {
        this.allSelectedCourses = this.allSelectedCourses.map((course) => ({
          ...course,
          isSubmitted: true,
        }));

        this.isPreferencesEnabled = true;
        this.updateTotalUnits();
        this.isSubmitting = false;

        this.dialog.open(DialogPrefSuccessComponent, {
          width: '30rem',
          disableClose: true,
          panelClass: ['dialog-base', 'success-dialog'],
          data: { deadline: this.deadline },
        });

        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('Error submitting preferences:', error);
        this.showSnackBar('Error submitting preferences.');
        this.isSubmitting = false;
        this.cdr.markForCheck();
      },
    });
  }

  private prepareSubmissionData(facultyId: string, activeSemesterId: number) {
    return {
      faculty_id: parseInt(facultyId),
      active_semester_id: activeSemesterId,
      preferences: this.dataSource.data.map(
        ({ course_assignment_id, preferredDay, preferredTime }) => {
          let preferred_start_time = '00:00:00';
          let preferred_end_time = '23:59:59';

          if (preferredTime && preferredTime !== 'Whole Day') {
            const times = preferredTime.split(' - ');
            if (times.length === 2) {
              preferred_start_time = this.convertTo24HourFormat(times[0]);
              preferred_end_time = this.convertTo24HourFormat(times[1]);
            }
          }

          return {
            course_assignment_id,
            preferred_day: preferredDay,
            preferred_start_time,
            preferred_end_time,
          };
        }
      ),
    };
  }

  private convertTo24HourFormat(time: string): string {
    // Assuming time is in 'HH:MM AM/PM' format
    const [timeStr, modifier] = time.split(' ');
    let [hours, minutes] = timeStr.split(':').map(Number);

    if (modifier === 'PM' && hours !== 12) {
      hours += 12;
    }
    if (modifier === 'AM' && hours === 12) {
      hours = 0;
    }

    const formattedHours = hours.toString().padStart(2, '0');
    const formattedMinutes = minutes.toString().padStart(2, '0');

    return `${formattedHours}:${formattedMinutes}:00`;
  }

  // ====================
  // Dialog Methods
  // ====================

  openTimeDialog(element: TableData): void {
    if (!this.isPreferencesEnabled) {
      this.showSnackBar('You have already submitted your preferences.');
      return;
    }

    let startTime = '';
    let endTime = '';
    let isWholeDay = false;

    if (element.preferredTime === 'Whole Day') {
      isWholeDay = true;
    } else if (element.preferredTime) {
      const [start, end] = element.preferredTime.split(' - ');
      startTime = start.trim();
      endTime = end.trim();
    }

    this.dialog
      .open(DialogTimeComponent, {
        data: { startTime, endTime, isWholeDay },
      })
      .afterClosed()
      .subscribe((result) => {
        if (result) {
          element.preferredTime = result;
          this.showSnackBar('Preferred time successfully updated.');
          this.updateTotalUnits();
          this.cdr.markForCheck();
        }
      });
  }

  openDayDialog(element: TableData): void {
    if (!this.isPreferencesEnabled) {
      this.showSnackBar('You have already submitted your preferences.');
      return;
    }

    const dialogRef = this.dialog.open(TableDialogComponent, {
      width: '20rem',
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
        initialValue: { preferredDay: element.preferredDay },
      },
      disableClose: true,
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

  onDisabledSectionClick(event: Event): void {
    if (!this.isPreferencesEnabled) {
      event.stopPropagation();

      const dialogData: DialogData = {
        title: 'Action Not Allowed',
        content: `You cannot edit your preferences at this time. 
          Please contact the administrator if you need assistance.`,
        actionText: 'Close',
        cancelText: '',
        action: 'close',
      };

      this.dialog.open(DialogGenericComponent, {
        data: dialogData,
        disableClose: true,
        panelClass: 'dialog-base',
      });
    }
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

  // private isMaxUnitsExceeded(course: Course): boolean {
  //   if (this.units + course.units > this.maxUnits) {
  //     this.showSnackBar('Maximum units have been reached.');
  //     return true;
  //   }
  //   return false;
  // }

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
      this.isSubmitting ||
      this.dataSource.data.some(
        (course) => !course.preferredDay || !course.preferredTime
      )
    );
  }

  private convertTo12HourFormat(time: string): string {
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
}
