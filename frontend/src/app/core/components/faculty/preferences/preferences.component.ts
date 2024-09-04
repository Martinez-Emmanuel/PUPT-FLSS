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

import { TimeFormatPipe } from '../../../pipes/time-format/time-format.pipe';
import { MatSymbolDirective } from '../../../imports/mat-symbol.directive';
import { DialogTimeComponent } from '../../../../shared/dialog-time/dialog-time.component';
import { DialogGenericComponent, DialogData } from '../../../../shared/dialog-generic/dialog-generic.component';
import { ThemeService } from '../../../services/theme/theme.service';
import { PreferencesService, Program, Course } from '../../../services/faculty/preference/preferences.service';
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
    MatSortModule, // Optional
  ],
  templateUrl: './preferences.component.html',
  styleUrls: ['./preferences.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [PreferencesService],
  animations: [fadeAnimation, cardEntranceAnimation],
})
export class PreferencesComponent implements OnInit, OnDestroy {
  programs: Program[] = [];
  courses: Course[] = [];
  selectedProgram: Program | undefined;
  loadingPrograms = true;
  units = 0;  // Renamed from totalUnits to units
  readonly maxUnits = 25;
  loading = true;
  isDarkMode = false;
  showSidenav = false;
  showProgramSelection = true; // New property to control visibility of program selection

  readonly displayedColumns: string[] = [
    'action',
    'num',
    'course_code',
    'course_title',
    'lec_hours',
    'lab_hours',
    'units',  // Make sure this matches with the HTML
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
  dataSource = new MatTableDataSource<TableData>([]);

  private subscriptions = new Subscription();

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

  private loadPrograms() {
    this.loadingPrograms = true;
    this.preferencesService.getPrograms().subscribe({
      next: (programs) => {
        console.log('Programs:', this.programs);
        this.programs = programs;
        this.loadingPrograms = false;
        this.cdr.markForCheck();

      },
      error: (error) => {
        console.error('Error loading programs:', error);
        this.loadingPrograms = false;
        this.cdr.markForCheck();
      },
    });
  }

  selectProgram(program: Program): void {
    this.selectedProgram = program;
    this.loading = true;
    this.showProgramSelection = false; // hide program selection
    this.courses = program.year_levels
      .flatMap((yearLevel) => yearLevel.semesters)
      .flatMap((semester) => semester.courses);
    this.loading = false;
    this.dataSource.data = []; // Clear current table data when program changes
    this.updateTotalUnits();
    this.cdr.markForCheck();
  }

  // Add a method to go back to program selection
  backToProgramSelection(): void {
    this.showProgramSelection = true;
    this.selectedProgram = undefined;
    this.courses = [];
    this.dataSource.data = [];
    this.updateTotalUnits();
    this.cdr.markForCheck();
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

  addCourseToTable(course: Course) {
    if (this.isCourseAlreadyAdded(course) || this.isMaxUnitsExceeded(course)) {
      return;
    }

    this.dataSource.data = [
      ...this.dataSource.data,
      { ...course, preferredDay: '', preferredTime: '' },
    ];
    this.updateTotalUnits();
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
    if (this.units + course.units > this.maxUnits) {  // Updated from this.totalUnits to this.units
      this.showSnackBar('Maximum units have been reached.');
      return true;
    }
    return false;
  }

  removeCourse(course_code: string) {
    this.dataSource.data = this.dataSource.data.filter(
      (course) => course.course_code !== course_code
    );
    this.updateTotalUnits();
  }

  onDayChange(element: TableData, event: Event) {
    const newDay = (event.target as HTMLSelectElement).value;
    element.preferredDay = newDay;
    this.cdr.markForCheck();
  }

  private updateTotalUnits() {
    this.units = this.dataSource.data.reduce(
      (total, course) => total + course.units,
      0
    );  // Updated from this.totalUnits to this.units
    this.cdr.markForCheck();
  }

  openTimeDialog(element: TableData): void {
    const [startTime, endTime] = element.preferredTime?.split(' - ') || [
      '',
      '',
    ];
    this.dialog
      .open(DialogTimeComponent, {
        width: '300px',
        data: { startTime, endTime },
      })
      .afterClosed()
      .subscribe((result) => {
        if (result) {
          element.preferredTime = result;
          this.cdr.markForCheck();
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
      next: () => this.showSnackBar('Preferences submitted successfully.'),
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

  private subscribeToThemeChanges() {
    this.subscriptions.add(
      this.themeService.isDarkTheme$.subscribe((isDark) => {
        this.isDarkMode = isDark;
        this.cdr.markForCheck();
      })
    );
  }

  private showSnackBar(message: string) {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
    });
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}
