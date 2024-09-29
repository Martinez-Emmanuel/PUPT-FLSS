import { Component, OnInit, AfterViewInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
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
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSortModule } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatMenuModule } from '@angular/material/menu';
import { MatRippleModule } from '@angular/material/core';

import { TimeFormatPipe } from '../../../pipes/time-format/time-format.pipe';
import { MatSymbolDirective } from '../../../imports/mat-symbol.directive';

import { TableDialogComponent } from '../../../../shared/table-dialog/table-dialog.component';
import { DialogTimeComponent } from '../../../../shared/dialog-time/dialog-time.component';
import { DialogGenericComponent, DialogData } from '../../../../shared/dialog-generic/dialog-generic.component';

import { ThemeService } from '../../../services/theme/theme.service';
import { PreferencesService, Program, Course, YearLevel, Semester } from '../../../services/faculty/preference/preferences.service';
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
    MatSortModule,
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
  // Component Properties
  programs: Program[] = [];
  courses: Course[] = [];
  filteredCourses: Course[] = [];
  selectedProgram: Program | undefined;
  selectedYearLevel: number | null = null;
  allSelectedCourses: TableData[] = [];
  dataSource = new MatTableDataSource<TableData>([]);
  subscriptions = new Subscription();

  // UI Control Properties
  programsLoading = false;
  loadingPrograms = true;
  loading = true;
  showSidenav = false;
  showProgramSelection = true;
  isDarkMode = false;

  // Constants
  readonly maxUnits = 25;
  readonly displayedColumns: string[] = ['action', 'num', 'course_code', 'course_title', 'lec_hours', 'lab_hours', 'units', 'preferredDay', 'preferredTime'];
  readonly daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  readonly yearLevels: number[] = [1, 2, 3, 4];

  // State Management Properties
  units = 0;

  constructor(
    private readonly themeService: ThemeService,
    private readonly cdr: ChangeDetectorRef,
    private readonly dialog: MatDialog,
    private readonly preferencesService: PreferencesService,
    private readonly snackBar: MatSnackBar,
    private readonly cookieService: CookieService
  ) {}

  // Angular Lifecycle Hooks
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

  // Initialization and Configuration Methods
  private loadPrograms() {
    this.loadingPrograms = true;
    this.programsLoading = true;

    this.preferencesService.getPrograms().subscribe({
      next: (programs) => {
        setTimeout(() => {
          this.programs = programs;
          this.loadingPrograms = false;
          this.programsLoading = false;
          this.cdr.markForCheck();
        }, 0);
      },
      error: (error) => {
        console.error('Error loading programs:', error);
        this.loadingPrograms = false;
        this.programsLoading = false;
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

  // Main Functionality Methods
  selectProgram(program: Program): void {
    this.selectedProgram = program;
    this.loading = true;
    this.showProgramSelection = false;
    this.courses = program.year_levels
      .flatMap((yearLevel) => yearLevel.semesters)
      .flatMap((semester) => semester.courses);
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

  addCourseToTable(course: Course) {
    if (this.isCourseAlreadyAdded(course) || this.isMaxUnitsExceeded(course)) {
      return;
    }

    const newCourse: TableData = { ...course, preferredDay: '', preferredTime: ''};
    this.allSelectedCourses.push(newCourse);
    this.updateDataSource();
    this.updateTotalUnits();
  }

  removeCourse(course_code: string) {
    this.allSelectedCourses = this.allSelectedCourses.filter(
      (course) => course.course_code !== course_code
    );
    this.updateDataSource();
    this.updateTotalUnits();
  }

  removeAllCourses() {
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
      })
      .afterClosed()
      .subscribe((result) => {
        if (result === 'remove') {
          this.dataSource.data = [];
          this.updateTotalUnits();
          this.showSnackBar('All courses removed.');
        }
      });
  }

  submitPreferences() {
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

  // Helper Methods
  private applyYearLevelFilter(): void {
    if (this.selectedYearLevel === null || this.selectedProgram === undefined) {
      this.filteredCourses = this.courses;
    } else {
      const program = this.programs.find(
        (prog: Program) => prog.program_id === this.selectedProgram?.program_id
      );

      if (program) {
        const yearLevel = program.year_levels.find(
          (yl: YearLevel) => yl.year === this.selectedYearLevel
        );

        if (yearLevel) {
          this.filteredCourses = yearLevel.semesters.flatMap(
            (semester: Semester) => semester.courses
          );
        } else {
          this.filteredCourses = [];
        }
      } else {
        this.filteredCourses = [];
      }
    }

    this.cdr.markForCheck();
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

  private showSuccessModal(message: string) {
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

  // Private Utility Methods
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

  private updateDataSource() {
    this.dataSource.data = this.allSelectedCourses;
  }

  private updateTotalUnits() {
    this.units = this.dataSource.data.reduce(
      (total, course) => total + course.units,
      0
    );
    this.cdr.markForCheck();
  }

  private showSnackBar(message: string) {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
    });
  }

  // Event Handlers
  onDayChange(element: TableData, event: Event) {
    const newDay = (event.target as HTMLSelectElement).value;
    element.preferredDay = newDay;
    this.cdr.markForCheck();
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
        this.cdr.markForCheck();
        this.showSnackBar('Preferred day successfully added');
      }
    });
  }

  // Computed Properties
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
