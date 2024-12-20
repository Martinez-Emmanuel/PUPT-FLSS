import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ViewChild, ElementRef, signal, computed, effect } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { finalize, of, Subscription, switchMap, tap, Subject, debounceTime, distinctUntilChanged } from 'rxjs';

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
import { DialogPrefComponent } from '../../../../shared/dialog-pref/dialog-pref.component';
import { DialogRequestAccessComponent } from '../../../../shared/dialog-request-access/dialog-request-access.component';
import { LoadingComponent } from '../../../../shared/loading/loading.component';

import { ThemeService } from '../../../services/theme/theme.service';
import { PreferencesService } from '../../../services/faculty/preference/preferences.service';
import { CookieService } from 'ngx-cookie-service';
import { Program, Course, PreferredDay } from '../../../models/preferences.model';

import { fadeAnimation, cardEntranceAnimation, rowAdditionAnimation } from '../../../animations/animations';

interface TableData extends Course {
  preferredDays: PreferredDay[];
  isSubmitted: boolean;
}

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
export class PreferencesComponent implements OnInit, OnDestroy {
  // UI State
  isLoading = signal(true);
  searchState = signal<
    'programSelection' | 'courseList' | 'searchResults' | 'noResults'
  >('programSelection');
  showProgramSelection = computed(
    () => this.searchState() === 'programSelection'
  );

  // Data
  academicYear = signal('');
  semesterLabel = signal('');
  programs = signal<Program[]>([]);
  selectedProgram = signal<Program | undefined>(undefined);
  selectedYearLevel = signal<number | null>(null);
  dynamicYearLevels = computed(() =>
    this.selectedProgram()
      ? this.selectedProgram()!.year_levels.map((yl) => yl.year_level)
      : []
  );

  // Faculty Info
  facultyId = signal<string>('');
  facultyName = signal<string>('');

  // Preferences Status
  isPreferencesEnabled = signal(true);
  hasRequest = signal(false);
  activeSemesterId = signal<number | null>(null);
  submissionDeadline = signal<Date | null>(null);
  daysLeft = computed(() => {
    const deadline = this.submissionDeadline();
    return this.calculateDaysLeft(deadline);
  });

  // Search
  private searchQuerySubject = new Subject<string>();
  searchQuery = signal('');
  uniqueCourses = signal(new Map<string, Course>());
  courses = computed(() => Array.from(this.uniqueCourses().values()));
  filteredSearchResults = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    return query
      ? this.courses().filter(
          (course) =>
            course.course_code.toLowerCase().includes(query) ||
            course.course_title.toLowerCase().includes(query)
        )
      : [];
  });
  @ViewChild('searchInput') searchInput!: ElementRef;

  // Table Data
  allSelectedCourses = signal<TableData[]>([]);
  dataSource = computed(
    () => new MatTableDataSource(this.allSelectedCourses())
  );
  isRemoving = signal<{ [course_code: string]: boolean }>({});
  displayedColumns: string[] = [
    'action',
    'course_code',
    'course_title',
    'lec_hours',
    'lab_hours',
    'units',
    'preferredDayTime',
  ];
  totalUnits = computed(() =>
    this.dataSource().data.reduce((total, course) => total + course.units, 0)
  );
  totalHours = computed(() =>
    this.dataSource().data.reduce(
      (total, course) =>
        total + (course.lec_hours || 0) + (course.lab_hours || 0),
      0
    )
  );

  private subscriptions = new Subscription();
  readonly daysOfWeek = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday',
  ];
  private isDarkTheme = signal<boolean>(false);

  constructor(
    private readonly themeService: ThemeService,
    private readonly dialog: MatDialog,
    private readonly preferencesService: PreferencesService,
    private readonly snackBar: MatSnackBar,
    private readonly cookieService: CookieService
  ) {
    effect(() => {
      this.dataSource().data;
    });

    this.searchQuerySubject
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe((query) => {
        this.searchQuery.set(query);
        this.updateSearchState(query);
      });
  }

  ngOnInit() {
    this.subscribeToThemeChanges();
    this.loadInitialData();
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
    this.searchQuerySubject.complete();
  }

  /**
   * Theme Subscription
   */
  private subscribeToThemeChanges() {
    this.subscriptions.add(
      this.themeService.isDarkTheme$.subscribe((isDark) =>
        this.isDarkTheme.set(isDark)
      )
    );
  }

  /**
   * Data Loading and Initialization
   */
  private loadInitialData() {
    this.isLoading.set(true);
    const facultyId = this.cookieService.get('faculty_id');

    this.subscriptions.add(
      this.preferencesService
        .getPreferencesByFacultyId(facultyId)
        .pipe(
          tap((preferencesResponse) =>
            this.processPreferencesResponse(preferencesResponse)
          ),
          switchMap((preferencesResponse) =>
            preferencesResponse.preferences.is_enabled === 1
              ? this.preferencesService.getPrograms()
              : of(null)
          ),
          finalize(() => this.isLoading.set(false))
        )
        .subscribe({
          next: (programsResponse) => {
            if (programsResponse) {
              this.programs.set(programsResponse.programs);
              this.activeSemesterId.set(programsResponse.active_semester_id);
              this.uniqueCourses.set(new Map<string, Course>());
              programsResponse.programs.forEach((program) => {
                this.populateUniqueCourses(program);
              });
            }
          },
          error: (error) => this.handleDataLoadingError(error),
        })
    );
  }

  private processPreferencesResponse(preferencesResponse: any) {
    const facultyPreference = preferencesResponse.preferences;
    if (facultyPreference) {
      this.facultyId.set(facultyPreference.faculty_id.toString());
      this.facultyName.set(facultyPreference.faculty_name);
      this.isPreferencesEnabled.set(facultyPreference.is_enabled === 1);
      this.hasRequest.set(facultyPreference.has_request === 1);

      const activeSemester = facultyPreference.active_semesters[0];
      this.academicYear.set(activeSemester.academic_year);
      this.semesterLabel.set(activeSemester.semester_label);
      this.submissionDeadline.set(this.getSubmissionDeadline(activeSemester));

      this.allSelectedCourses.set(
        this.mapPreferencesToTableData(activeSemester.courses)
      );
    } else {
      this.isPreferencesEnabled.set(true);
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
    const errorMessage = error.url.includes('/offered-courses-sem')
      ? 'Error loading programs.'
      : error.url.includes(`/get-preferences/`)
      ? 'Error loading preferences.'
      : 'An unexpected error occurred.';
    this.showSnackBar(errorMessage);
    this.isLoading.set(false);
  }

  /**
   * Program and Course Selection
   */
  public selectProgram(program: Program): void {
    this.selectedProgram.set(program);
    this.searchState.set('courseList');
    this.selectedYearLevel.set(null);
    this.uniqueCourses.set(new Map<string, Course>());
    this.populateUniqueCourses(program);
  }

  private populateUniqueCourses(program: Program): void {
    program.year_levels.forEach((yearLevel) => {
      yearLevel.semester.courses.forEach((course) => {
        this.uniqueCourses().set(course.course_code, course);
      });
    });
    this.uniqueCourses.set(new Map(this.uniqueCourses().entries()));
  }

  public backToProgramSelection(): void {
    this.searchState.set('programSelection');
    this.selectedProgram.set(undefined);
    this.selectedYearLevel.set(null);
  }

  public filteredCourses = computed(() => {
    const yearLevel = this.selectedYearLevel();
    const program = this.selectedProgram();

    if (!program) {
      return [];
    }

    if (yearLevel === null) {
      return Array.from(this.uniqueCourses().values());
    } else {
      const yearLevelData = program.year_levels.find(
        (yl) => yl.year_level === yearLevel
      );
      return yearLevelData
        ? yearLevelData.semester.courses.filter((course) =>
            this.uniqueCourses().has(course.course_code)
          )
        : [];
    }
  });

  /**
   * Search Functionality
   */
  public onSearchInput(query: string): void {
    this.searchQuerySubject.next(query);
  }

  private updateSearchState(query: string): void {
    if (query) {
      this.searchState.set(
        this.filteredSearchResults().length > 0 ? 'searchResults' : 'noResults'
      );
    } else {
      this.searchState.set(
        this.selectedProgram() ? 'courseList' : 'programSelection'
      );
    }
  }

  public clearSearch(): void {
    this.searchQuery.set('');
    this.filteredSearchResults();
    this.searchState.set(
      this.selectedProgram() ? 'courseList' : 'programSelection'
    );
    this.searchInput.nativeElement.focus();
  }

  /**
   * Course Management
   */
  public addCourseToTable(course: Course): void {
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

    this.allSelectedCourses.update((courses) => [...courses, newCourse]);
  }

  public removeCourse(course: TableData): void {
    if (course.isSubmitted) {
      this.removeSubmittedCourse(course);
    } else {
      this.removeUnsubmittedCourse(course);
    }
  }

  private removeSubmittedCourse(course: TableData) {
    const { course_assignment_id } = course;
    if (!this.facultyId() || !this.activeSemesterId()) {
      this.showSnackBar('Error: Missing faculty or semester information.');
      return;
    }

    this.isRemoving.update((value) => ({
      ...value,
      [course.course_code]: true,
    }));

    this.preferencesService
      .deletePreference(
        course_assignment_id,
        this.facultyId()!,
        this.activeSemesterId()!
      )
      .subscribe({
        next: () => {
          this.allSelectedCourses.update((courses) =>
            courses.filter((c) => c.course_code !== course.course_code)
          );
          this.isRemoving.update((value) => {
            const updatedValue = { ...value };
            delete updatedValue[course.course_code];
            return updatedValue;
          });
          this.showSnackBar('Course preference removed successfully.');
        },
        error: (error) => {
          const message =
            error.status === 403
              ? 'Submission is now closed. You cannot modify your preferences anymore.'
              : 'Error removing course preference.';
          this.showSnackBar(message);
          this.isRemoving.update((value) => ({
            ...value,
            [course.course_code]: false,
          }));
        },
      });
  }

  private removeUnsubmittedCourse(course: TableData) {
    this.allSelectedCourses.update((courses) =>
      courses.filter((c) => c.course_code !== course.course_code)
    );
    this.showSnackBar('Course preference removed successfully.');
  }

  private isCourseAlreadyAdded(course: Course): boolean {
    const isAdded = this.allSelectedCourses().some(
      (subject) => subject.course_code === course.course_code
    );
    if (isAdded) this.showSnackBar('This course has already been selected.');
    return isAdded;
  }

  /**
   * Dialog Management
   */
  public openDayTimeDialog(element: TableData): void {
    this.dialog
      .open(DialogDayTimeComponent, {
        data: {
          selectedDays: element.preferredDays,
          courseCode: element.course_code,
          courseTitle: element.course_title,
          facultyId: this.facultyId(),
          activeSemesterId: this.activeSemesterId(),
          courseAssignmentId: element.course_assignment_id,
          allSelectedCourses: this.allSelectedCourses(),
        },
        disableClose: true,
        autoFocus: false,
      })
      .afterClosed()
      .subscribe((result) => {
        if (result) {
          const courseIndex = this.allSelectedCourses().findIndex(
            (c) => c.course_code === element.course_code
          );

          if (courseIndex !== -1) {
            this.allSelectedCourses.set(
              this.allSelectedCourses().map((course, index) =>
                index === courseIndex
                  ? {
                      ...course,
                      preferredDays: result.days,
                      isSubmitted: true,
                    }
                  : course
              )
            );
          }
        }
      });
  }

  public openViewPreferencesDialog(): void {
    this.dialog.open(DialogPrefComponent, {
      maxWidth: '70rem',
      width: '100%',
      data: {
        facultyName: this.facultyName(),
        faculty_id: parseInt(this.facultyId()!, 10),
        viewOnlyTable: true,
      },
      disableClose: true,
    });
  }

  public openRequestAccessDialog(): void {
    this.dialog
      .open(DialogRequestAccessComponent, {
        width: '25rem',
        disableClose: true,
        data: {
          has_request: this.hasRequest(),
          facultyId: this.facultyId(),
        },
      })
      .afterClosed()
      .subscribe(() => this.loadInitialData());
  }

  /**
   * Utility Functions
   */
  public formatTimeForPayload(time: string | undefined | null): string {
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

      return `${hours.toString().padStart(2, '0')}:${minutes
        .toString()
        .padStart(2, '0')}:00`;
    } else {
      return time;
    }
  }

  public formatSelectedDaysAndTime(element: TableData): string {
    const selectedDays = element.preferredDays
      .filter((pd) => pd.start_time && pd.end_time)
      .map((pd) => pd.day);
    return selectedDays.length > 0
      ? selectedDays.join(', ')
      : 'Click to select day and time';
  }

  private showSnackBar(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
    });
  }
}