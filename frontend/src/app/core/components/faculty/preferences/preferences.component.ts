import { Component, OnInit, AfterViewInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef, ViewChild, ElementRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { finalize, of, Subscription, switchMap, tap } from 'rxjs';

import { MatTableDataSource, MatTableModule } from '@angular/material/table';
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

import { MatSymbolDirective } from '../../../imports/mat-symbol.directive';

import { DialogDayTimeComponent } from '../../../../shared/dialog-day-time/dialog-day-time.component';
import { DialogGenericComponent, DialogData } from '../../../../shared/dialog-generic/dialog-generic.component';
import { DialogPrefSuccessComponent } from '../../../../shared/dialog-pref-success/dialog-pref-success.component';
import { DialogPrefComponent } from '../../../../shared/dialog-pref/dialog-pref.component';
import { DialogRequestAccessComponent } from '../../../../shared/dialog-request-access/dialog-request-access.component';
import { LoadingComponent } from '../../../../shared/loading/loading.component';

import { ThemeService } from '../../../services/theme/theme.service';
import { PreferencesService, Program, Course, YearLevel } from '../../../services/faculty/preference/preferences.service';
import { CookieService } from 'ngx-cookie-service';

import { fadeAnimation, cardEntranceAnimation, rowAdditionAnimation } from '../../../animations/animations';

interface PreferredDay {
  day: string;
  start_time: string;
  end_time: string;
}

interface TableData extends Course {
  preferredDays: PreferredDay[];
  isSubmitted: boolean;
}

type SearchState =
  | 'noResults'
  | 'searchResults'
  | 'programSelection'
  | 'courseList';

@Component({
  selector: 'app-preferences',
  imports: [
    CommonModule,
    FormsModule,
    LoadingComponent,
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
  // UI State
  isLoading = true;
  searchState: SearchState = 'programSelection';

  // Data
  academicYear = '';
  semesterLabel = '';
  programs: Program[] = [];
  courses: Course[] = [];
  filteredCourses: Course[] = [];
  selectedProgram?: Program;
  selectedYearLevel: number | null = null;
  dynamicYearLevels: number[] = [];
  allSelectedCourses: TableData[] = [];
  dataSource = new MatTableDataSource<TableData>([]);

  // Faculty Info
  facultyId = '';
  facultyName = '';

  // Preferences Status
  isPreferencesEnabled = true;
  hasRequest = false;
  activeSemesterId: number | null = null;
  submissionDeadline: Date | null = null;
  daysLeft: string | number = 0;

  // Search
  searchQuery = '';
  filteredSearchResults: Course[] = [];
  @ViewChild('searchInput') searchInput!: ElementRef;

  // Subscriptions
  private subscriptions = new Subscription();

  // Constants
  readonly displayedColumns: string[] = [
    'action',
    'course_code',
    'course_title',
    'lec_hours',
    'lab_hours',
    'units',
    'preferredDayTime',
  ];
  readonly columnLabels: { [key: string]: string } = {
    action: '',
    course_code: 'Course Code',
    course_title: 'Course Title',
    lec_hours: 'Lec',
    lab_hours: 'Lab',
    units: 'Units',
    preferredDayTime: 'Preferred Day & Time',
  };
  readonly daysOfWeek = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday',
  ];

  // ===========================
  // Computed Properties
  // ===========================

  get totalUnits(): number {
    return this.dataSource.data.reduce(
      (total, course) => total + course.units,
      0
    );
  }

  get totalHours(): number {
    return this.dataSource.data.reduce(
      (total, course) =>
        total + (course.lec_hours || 0) + (course.lab_hours || 0),
      0
    );
  }

  get showProgramSelection(): boolean {
    return this.searchState === 'programSelection';
  }

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
    this.loadAllData();
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.cdr.markForCheck();
    }, 0);
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  // ===========================
  // Initialization Methods
  // ===========================

  private loadAllData() {
    this.isLoading = true;
    const facultyId = this.cookieService.get('faculty_id');

    this.subscriptions.add(
      this.preferencesService
        .getPreferencesByFacultyId(facultyId)
        .pipe(
          tap((preferencesResponse) =>
            this.processPreferencesResponse(preferencesResponse)
          ),
          switchMap((preferencesResponse) => {
            if (preferencesResponse.preferences.is_enabled === 1) {
              return this.preferencesService.getPrograms();
            } else {
              return of(null);
            }
          }),
          finalize(() => {
            this.isLoading = false;
            this.cdr.markForCheck();
          })
        )
        .subscribe({
          next: (programsResponse) => {
            if (programsResponse) {
              this.programs = programsResponse.programs;
              this.activeSemesterId = programsResponse.active_semester_id;
            }
          },
          error: (error) => this.handleDataLoadingError(error),
        })
    );
  }

  private processPreferencesResponse(preferencesResponse: any) {
    const facultyPreference = preferencesResponse.preferences;
    if (facultyPreference) {
      this.facultyId = facultyPreference.faculty_id.toString();
      this.facultyName = facultyPreference.faculty_name;
      this.isPreferencesEnabled = facultyPreference.is_enabled === 1;
      this.hasRequest = facultyPreference.has_request === 1;

      const activeSemester = facultyPreference.active_semesters[0];
      this.academicYear = activeSemester.academic_year;
      this.semesterLabel = activeSemester.semester_label;
      this.submissionDeadline = this.getSubmissionDeadline(activeSemester);
      this.daysLeft = this.calculateDaysLeft(this.submissionDeadline);

      this.allSelectedCourses = this.mapPreferencesToTableData(
        activeSemester.courses
      );
      this.updateDataSource();
    } else {
      this.isPreferencesEnabled = true;
    }
  }

  private getSubmissionDeadline(activeSemester: any): Date | null {
    const deadline =
      activeSemester.individual_deadline || activeSemester.global_deadline;
    return deadline ? new Date(deadline) : null;
  }

  private calculateDaysLeft(deadline: Date | null): string | number {
    if (!deadline) return 'N/A';

    const today = new Date();
    deadline.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    const diffTime = deadline.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays < 1 ? 'Today' : `${diffDays} days left`;
  }

  private mapPreferencesToTableData(courses: any[]): TableData[] {
    return courses.map((course) => ({
      course_id: course.course_details.course_id,
      course_assignment_id: course.course_assignment_id,
      course_code: course.course_details.course_code,
      course_title: course.course_details.course_title,
      lec_hours: course.lec_hours,
      lab_hours: course.lab_hours,
      units: course.units,
      preferredDays: course.preferred_days.map((prefDay: any) => ({
        day: prefDay.day,
        start_time: this.formatTimeForPayload(prefDay.start_time),
        end_time: this.formatTimeForPayload(prefDay.end_time),
      })),
      isSubmitted: true,
      pre_req: course.course_details.pre_req ?? null,
      co_req: course.course_details.co_req ?? null,
      tuition_hours: course.course_details.tuition_hours ?? 0,
    }));
  }

  private handleDataLoadingError(error: any) {
    console.error('Error loading data:', error);
    const errorMessage = error.url.includes('/offered-courses-sem')
      ? 'Error loading programs.'
      : error.url.includes(`/get-preferences/${this.facultyId}`)
      ? 'Error loading preferences.'
      : 'An unexpected error occurred.';
    this.showSnackBar(errorMessage);
    this.isLoading = false;
    this.cdr.markForCheck();
  }

  private subscribeToThemeChanges() {
    this.subscriptions.add(
      this.themeService.isDarkTheme$.subscribe((isDark) => {
        this.cdr.markForCheck();
      })
    );
  }

  // ============================
  // Program and Course Selection
  // ============================

  selectProgram(program: Program): void {
    this.selectedProgram = program;
    this.searchState = 'courseList';
    this.dynamicYearLevels = program.year_levels.map(
      (yearLevel) => yearLevel.year_level
    );
    this.courses = this.getCoursesFromProgram(program);
    this.filteredCourses = this.courses;
    this.selectedYearLevel = null;
    this.updateDataSource();
    this.cdr.markForCheck();
  }

  private getCoursesFromProgram(program: Program): Course[] {
    const uniqueCourses = new Set<string>();
    return program.year_levels
      .flatMap((yearLevel) => yearLevel.semester.courses)
      .filter((course) => {
        if (uniqueCourses.has(course.course_code)) return false;
        uniqueCourses.add(course.course_code);
        return true;
      });
  }

  filterByYear(year: number | null): void {
    this.selectedYearLevel = year;
    this.applyYearLevelFilter();
    this.cdr.markForCheck();
  }

  backToProgramSelection(): void {
    this.searchState = 'programSelection';
    this.selectedProgram = undefined;
    this.courses = [];
    this.filteredCourses = [];
    this.selectedYearLevel = null;
    this.updateDataSource();
    this.cdr.markForCheck();
  }

  // ===========================
  // Search Methods
  // ===========================

  onSearchInput(): void {
    const query = this.searchQuery.toLowerCase().trim();
    if (query) {
      this.filteredSearchResults = this.searchCourses(query);
      this.searchState =
        this.filteredSearchResults.length > 0 ? 'searchResults' : 'noResults';
    } else {
      this.filteredSearchResults = [];
      this.searchState = this.selectedProgram
        ? 'courseList'
        : 'programSelection';
    }
    this.cdr.markForCheck();
  }

  private searchCourses(query: string): Course[] {
    const uniqueCourses = new Set<string>();
    return this.programs
      .flatMap((program) =>
        program.year_levels.flatMap((yl) => yl.semester.courses)
      )
      .filter(
        (course) =>
          (course.course_code.toLowerCase().includes(query) ||
            course.course_title.toLowerCase().includes(query)) &&
          !uniqueCourses.has(course.course_code) &&
          uniqueCourses.add(course.course_code)
      );
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.filteredSearchResults = [];
    this.searchState = this.selectedProgram ? 'courseList' : 'programSelection';
    this.searchInput.nativeElement.focus();
    this.cdr.markForCheck();
  }

  // ===========================
  // Course Management
  // ===========================
  addCourseToTable(course: Course): void {
    if (this.isCourseAlreadyAdded(course)) return;

    const newCourse: TableData = {
      ...course,
      preferredDays: this.daysOfWeek.map((day) => ({
        day,
        start_time: '',
        end_time: '',
      })),
      isSubmitted: false,
    };
    this.allSelectedCourses.push(newCourse);
    this.updateDataSource();
  }

  removeCourse(course: TableData): void {
    if (course.isSubmitted) {
      this.removeSubmittedCourse(course);
    } else {
      this.removeUnsubmittedCourse(course);
    }
  }

  private removeSubmittedCourse(course: TableData) {
    const { course_assignment_id } = course;
    if (!this.facultyId || !this.activeSemesterId) {
      this.showSnackBar('Error: Missing faculty or semester information.');
      return;
    }

    this.preferencesService
      .deletePreference(
        course_assignment_id,
        this.facultyId,
        this.activeSemesterId
      )
      .subscribe({
        next: () => {
          this.allSelectedCourses = this.allSelectedCourses.filter(
            (c) => c.course_code !== course.course_code
          );
          this.updateDataSource();
          this.showSnackBar('Course preference removed successfully.');
        },
        error: (error) => {
          const message =
            error.status === 403
              ? 'Submission is now closed. You cannot modify your preferences anymore.'
              : 'Error removing course preference.';
          this.showSnackBar(message);
        },
      });
  }

  private removeUnsubmittedCourse(course: TableData) {
    this.allSelectedCourses = this.allSelectedCourses.filter(
      (c) => c.course_code !== course.course_code
    );
    this.updateDataSource();
    this.showSnackBar('Course preference removed successfully.');
  }

  // ===========================
  // Dialog Methods
  // ===========================

  openDayTimeDialog(element: TableData): void {
    this.dialog
      .open(DialogDayTimeComponent, {
        data: {
          selectedDays: element.preferredDays,
          courseCode: element.course_code,
          courseTitle: element.course_title,
          facultyId: this.facultyId,
          activeSemesterId: this.activeSemesterId,
          courseAssignmentId: element.course_assignment_id,
          allSelectedCourses: this.allSelectedCourses
        },
        disableClose: true,
        autoFocus: false,
      })
      .afterClosed()
      .subscribe((result) => {
        if (result) {
          const courseIndex = this.allSelectedCourses.findIndex(
            (c) => c.course_code === element.course_code
          );
          if (courseIndex !== -1) {
            this.allSelectedCourses[courseIndex].preferredDays = result.days;
            this.allSelectedCourses[courseIndex].isSubmitted = true;
          }
          this.updateDataSource();
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

  openRequestAccessDialog(): void {
    this.dialog
      .open(DialogRequestAccessComponent, {
        width: '25rem',
        disableClose: true,
        data: {
          has_request: this.hasRequest,
          facultyId: this.facultyId,
        },
      })
      .afterClosed()
      .subscribe(() => this.loadAllData());
  }

  // ===========================
  // Utility Methods
  // ===========================

  private applyYearLevelFilter(): void {
    this.filteredCourses =
      this.selectedYearLevel === null || !this.selectedProgram
        ? this.courses
        : this.selectedProgram.year_levels.find(
            (yl: YearLevel) => yl.year_level === this.selectedYearLevel
          )?.semester.courses || [];
    this.cdr.markForCheck();
  }

  private isCourseAlreadyAdded(course: Course): boolean {
    const isAdded = this.dataSource.data.some(
      (subject) => subject.course_code === course.course_code
    );
    if (isAdded) this.showSnackBar('This course has already been selected.');
    return isAdded;
  }

  private updateDataSource(): void {
    this.dataSource.data = [...this.allSelectedCourses];
  }

  private showSnackBar(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
    });
  }

  formatTimeForPayload(time: string | undefined | null): string {
    if (!time) return '';
    if (time.includes('AM') || time.includes('PM')) {
        const [timePart, modifier] = time.split(' ');
        let [hours, minutes] = timePart.split(':').map(Number);

        if (hours === 12) {
            hours = 0;
        }

        if (modifier === 'PM') {
            hours += 12;
        }

        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:00`;
    } else {
        return time;
    }
  }

  formatSelectedDaysAndTime(element: TableData): string {
    const selectedDays = element.preferredDays
      .filter((pd) => pd.start_time && pd.end_time)
      .map((pd) => pd.day);
    return selectedDays.length > 0
      ? selectedDays.join(', ')
      : 'Click to select day';
  }

  getCellClass(column: string): string {
    return `table-cell ${column}-cell`;
  }
}