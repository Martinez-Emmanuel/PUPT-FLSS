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
import { CourseService, Course } from '../../../services/course/courses.service';
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
  providers: [CourseService],
  animations: [fadeAnimation, cardEntranceAnimation],
})
export class PreferencesComponent implements OnInit, OnDestroy, AfterViewInit {
  subjects: Course[] = [];
  totalUnits = 0;
  readonly maxUnits = 25;
  loading = true;
  isDarkMode = false;
  showSidenav = false;

  readonly displayedColumns: string[] = [
    'action',
    'num',
    'subject_code',
    'subject_title',
    'lec_hours',
    'lab_hours',
    'total_units',
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
    private readonly courseService: CourseService,
    private readonly snackBar: MatSnackBar,
    private readonly cookieService: CookieService
  ) {}

  ngOnInit() {
    this.subscribeToThemeChanges();
    this.loadCourses();
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

  get isRemoveDisabled(): boolean {
    return this.dataSource.data.length === 0;
  }

  get isSubmitDisabled(): boolean {
    return (
      this.isRemoveDisabled ||
      this.dataSource.data.some(
        (subject) => !subject.preferredDay || !subject.preferredTime
      )
    );
  }

  addSubjectToTable(course: Course) {
    if (this.isCourseAlreadyAdded(course) || this.isMaxUnitsExceeded(course))
      return;

    this.dataSource.data = [
      ...this.dataSource.data,
      { ...course, preferredDay: '', preferredTime: '' },
    ];
    this.updateTotalUnits();
  }

  removeSubject(subject_code: string) {
    this.dataSource.data = this.dataSource.data.filter(
      (subject) => subject.subject_code !== subject_code
    );
    this.updateTotalUnits();
  }

  onDayChange(element: TableData, event: Event) {
    element.preferredDay = (event.target as HTMLSelectElement).value;
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

    this.courseService.submitPreferences(submittedData).subscribe({
      next: () => this.showSnackBar('Preferences submitted successfully.'),
      error: (error) => {
        console.error('Error submitting preferences:', error);
        this.showSnackBar('Error submitting preferences.');
      },
    });
  }

  removeAllSubjects() {
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

  private loadCourses() {
    this.loading = true;
    this.subscriptions.add(
      this.courseService.getCourses().subscribe({
        next: (courses) => {
          this.subjects = courses;
          this.loading = false;
          this.cdr.markForCheck();
        },
        error: (error) => {
          console.error('Error loading courses:', error);
          this.loading = false;
          this.cdr.markForCheck();
        },
      })
    );
  }

  private isCourseAlreadyAdded(course: Course): boolean {
    if (
      this.dataSource.data.some(
        (subject) => subject.subject_code === course.subject_code
      )
    ) {
      this.showSnackBar('This course has already been selected.');
      return true;
    }
    return false;
  }

  private isMaxUnitsExceeded(course: Course): boolean {
    if (this.totalUnits + course.total_units > this.maxUnits) {
      this.showSnackBar('Maximum units have been reached.');
      return true;
    }
    return false;
  }

  private updateTotalUnits() {
    this.totalUnits = this.dataSource.data.reduce(
      (total, subject) => total + subject.total_units,
      0
    );
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

  private showSnackBar(message: string) {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
    });
  }
}