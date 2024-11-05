import {
  Component,
  OnInit,
  AfterViewInit,
  OnDestroy,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { of, Subscription, switchMap, tap } from 'rxjs';

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
import { DialogDayTimeComponent } from '../../../../shared/dialog-day-time/dialog-day-time.component';
import {
  DialogGenericComponent,
  DialogData,
} from '../../../../shared/dialog-generic/dialog-generic.component';
import { DialogPrefSuccessComponent } from '../../../../shared/dialog-pref-success/dialog-pref-success.component';
import { DialogPrefComponent } from '../../../../shared/dialog-pref/dialog-pref.component';
import { LoadingComponent } from '../../../../shared/loading/loading.component';

import { ThemeService } from '../../../services/theme/theme.service';
import {
  PreferencesService,
  Program,
  Course,
  YearLevel,
} from '../../../services/faculty/preference/preferences.service';
import { CookieService } from 'ngx-cookie-service';

import {
  fadeAnimation,
  cardEntranceAnimation,
  rowAdditionAnimation,
} from '../../../animations/animations';

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
    DialogDayTimeComponent,
    DialogPrefSuccessComponent,
    LoadingComponent,
    DialogPrefComponent,
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
  isRemovingAll = false;

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
    // 'num',
    'course_code',
    'course_title',
    'lec_hours',
    'lab_hours',
    'units',
    'availableDayTime',
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

  facultyId: string = '';
  facultyName: string = '';

  submissionDeadline: Date | null = null;
  daysLeft: string | number = 0;

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

    const facultyId = this.cookieService.get('faculty_id');

    this.subscriptions.add(
      this.preferencesService
        .getPreferencesByFacultyId(facultyId)
        .pipe(
          tap((preferencesResponse) => {
            const facultyPreference = preferencesResponse.preferences;

            if (facultyPreference) {
              this.facultyId = facultyPreference.faculty_id.toString();
              this.facultyName = facultyPreference.faculty_name;

              this.isPreferencesEnabled = facultyPreference.is_enabled === 1;

              const activeSemester = facultyPreference.active_semesters[0];
              this.academicYear = activeSemester.academic_year;
              this.semesterLabel = activeSemester.semester_label;
              this.deadline =
                activeSemester.individual_deadline ||
                activeSemester.global_deadline;

              if (this.deadline) {
                this.submissionDeadline = new Date(this.deadline);
                const today = new Date();
                const deadlineDate = new Date(this.deadline);

                deadlineDate.setHours(0, 0, 0, 0);
                today.setHours(0, 0, 0, 0);

                const diffTime = deadlineDate.getTime() - today.getTime();
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                this.daysLeft =
                  diffDays < 1 ? 'Today' : `${diffDays} days left`;
              } else {
                this.submissionDeadline = null;
                this.daysLeft = 'N/A';
              }

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
                  course.preferred_start_time === '07:00:00' &&
                  course.preferred_end_time === '21:00:00'
                    ? '07:00 AM - 09:00 PM'
                    : course.preferred_start_time && course.preferred_end_time
                    ? `${this.convertTo12HourFormat(
                        course.preferred_start_time
                      )} - ${this.convertTo12HourFormat(
                        course.preferred_end_time
                      )}`
                    : '',
                isSubmitted: true,
              }));

              this.allSelectedCourses = preferences;
              this.updateDataSource();
              this.updateTotalUnits();
            } else {
              this.isPreferencesEnabled = true;
            }
          }),
          switchMap((preferencesResponse) => {
            if (preferencesResponse.preferences.is_enabled === 1) {
              return this.preferencesService.getPrograms();
            } else {
              return of(null);
            }
          })
        )
        .subscribe({
          next: (programsResponse) => {
            if (programsResponse) {
              this.programs = programsResponse.programs;
              this.activeSemesterId = programsResponse.active_semester_id;
            }
            this.isLoading = false;
            this.cdr.markForCheck();
          },
          error: (error) => {
            console.error('Error loading data:', error);
            if (error.url.includes('/offered-courses-sem')) {
              this.showSnackBar('Error loading programs.');
            } else if (error.url.includes(`/get-preferences/${facultyId}`)) {
              this.showSnackBar('Error loading preferences.');
            } else {
              this.showSnackBar('An unexpected error occurred.');
            }
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
    if (this.isCourseAlreadyAdded(course)) {
      return;
    }

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
    const facultyId = this.cookieService.get('faculty_id');
    const activeSemesterId = this.activeSemesterId;

    if (!facultyId || !activeSemesterId) {
      this.showSnackBar('Error: Missing faculty or semester information.');
      return;
    }

    if (course.isSubmitted) {
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
            if (error.status === 403) {
              this.showSnackBar(
                'Preferences submission is now closed. You cannot modify your preferences anymore.'
              );
            } else {
              this.showSnackBar('Error removing course preference.');
            }
          },
        });
    } else {
      this.allSelectedCourses = this.allSelectedCourses.filter(
        (c) => c.course_code !== course.course_code
      );

      this.updateDataSource();
      this.updateTotalUnits();
      this.showSnackBar('Course preference removed successfully.');
    }
  }

  removeAllCourses(): void {
    const facultyId = this.cookieService.get('faculty_id');
    const activeSemesterId = this.activeSemesterId;

    if (!facultyId || !activeSemesterId) {
      this.showSnackBar('Error: Missing faculty or semester information.');
      return;
    }

    const dialogData: DialogData = {
      title: 'Remove All Courses',
      content: 'Are you sure you want to remove all your selected courses?',
      actionText: 'Confirm',
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
          this.isRemovingAll = true;
          this.cdr.markForCheck();

          this.preferencesService
            .deleteAllPreferences(facultyId, activeSemesterId)
            .subscribe({
              next: () => {
                this.allSelectedCourses = [];
                this.updateDataSource();
                this.updateTotalUnits();
                this.showSnackBar(
                  'All course preferences removed successfully.'
                );
                this.isRemovingAll = false;
                this.cdr.markForCheck();
              },
              error: (error) => {
                if (error.status === 403) {
                  this.showSnackBar(
                    'Preferences submission is now closed. You cannot modify your preferences anymore.'
                  );
                } else {
                  this.showSnackBar('Error removing all course preferences.');
                }
                this.isRemovingAll = false;
                this.cdr.markForCheck();
              },
            });
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
        this.allSelectedCourses.forEach((course) => {
          if (
            this.dataSource.data.some(
              (c) => c.course_code === course.course_code
            )
          ) {
            course.isSubmitted = true;
          }
        });

        this.isSubmitting = false;

        this.dialog.open(DialogPrefSuccessComponent, {
          width: '30rem',
          disableClose: true,
          data: { deadline: this.deadline },
        });

        this.cdr.markForCheck();
      },
      error: (error) => {
        if (error.status === 403) {
          this.showSnackBar(
            'Preferences submission is now closed. You cannot modify your preferences anymore.'
          );
        } else {
          this.showSnackBar('Error submitting preferences.');
        }
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
          let preferred_start_time = '07:00:00';
          let preferred_end_time = '21:00:00';

          if (preferredTime && preferredTime !== '07:00 AM - 09:00 PM') {
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

  openDayTimeDialog(element: TableData): void {
    this.dialog
      .open(DialogDayTimeComponent, {
        data: {
          selectedDay: element.preferredDay,
          selectedTime: element.preferredTime,
          daysOfWeek: this.daysOfWeek,
        },
        disableClose: true,
        autoFocus: false,
      })
      .afterClosed()
      .subscribe((result) => {
        if (result) {
          const { day, time } = result;
          element.preferredDay = day;
          element.preferredTime = time;
          this.showSnackBar('Available day and time successfully updated.');
          this.updateTotalUnits();
          this.cdr.markForCheck();
        }
      });
  }

  openViewPreferencesDialog(): void {
    this.dialog.open(DialogPrefComponent, {
      maxWidth: '70rem',
      width: '100%',
      data: {
        facultyName: this.facultyName,
        faculty_id: parseInt(this.facultyId, 10),
        viewOnlyTable: true,
      },
      disableClose: true,
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
