import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';

import { CommonModule } from '@angular/common';

import { Subscription } from 'rxjs';

import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

import { MaterialComponents } from '../../../imports/material.component';
import { ThemeService } from '../../../services/theme/theme.service';
import { TimeFormatPipe } from '../../../pipes/time-format/time-format.pipe';
import { MatSymbolDirective } from '../../../imports/mat-symbol.directive';

import { DialogTimeComponent } from '../../../../shared/dialog-time/dialog-time.component';
import { DialogGenericComponent, DialogData } from '../../../../shared/dialog-generic/dialog-generic.component';
import { CourseService, Course } from '../../../services/course/courses.service';

interface TableData extends Course {
  preferredDay: string;
  preferredTime: string;
}

@Component({
  selector: 'app-preferences',
  standalone: true,
  imports: [
    MaterialComponents,
    CommonModule,
    DialogTimeComponent,
    TimeFormatPipe,
    MatSymbolDirective,
  ],
  templateUrl: './preferences.component.html',
  styleUrl: './preferences.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [CourseService],
})
export class PreferencesComponent implements OnInit, OnDestroy {
  subjects: Course[] = [];
  totalUnits = 0;
  maxUnits = 25;
  loading = true;
  isDarkMode = false;

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

  private themeSubscription!: Subscription;

  constructor(
    private readonly themeService: ThemeService,
    private readonly cdr: ChangeDetectorRef,
    private readonly dialog: MatDialog,
    private readonly courseService: CourseService,
    private readonly snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.subscribeToThemeChanges();
    this.loadCourses();
  }

  ngOnDestroy() {
    this.themeSubscription?.unsubscribe();
  }

  private subscribeToThemeChanges() {
    this.themeSubscription = this.themeService.isDarkTheme$.subscribe(
      (isDark) => {
        this.isDarkMode = isDark;
        this.cdr.markForCheck();
      }
    );
  }

  private loadCourses() {
    this.loading = true;
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
    });
  }

  get isRemoveDisabled(): boolean {
    return !this.dataSource.data.length;
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

  removeSubject(subject_code: string) {
    this.dataSource.data = this.dataSource.data.filter(
      (subject) => subject.subject_code !== subject_code
    );
    this.updateTotalUnits();
  }

  onDayChange(element: TableData, event: Event) {
    const newDay = (event.target as HTMLSelectElement).value;
    element.preferredDay = newDay;
    this.cdr.markForCheck();
  }

  private updateTotalUnits() {
    this.totalUnits = this.dataSource.data.reduce(
      (total, subject) => total + subject.total_units,
      0
    );
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
    const facultyId = sessionStorage.getItem('faculty_id');
    const submittedData = this.prepareSubmissionData(facultyId);

    this.courseService.submitPreferences(submittedData).subscribe({
      next: () => this.showSnackBar('Preferences submitted successfully.'),
      error: (error) => {
        console.error('Error submitting preferences:', error);
        this.showSnackBar('Error submitting preferences.');
      },
    });
  }

  private prepareSubmissionData(facultyId: string | null) {
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

  private showSnackBar(message: string) {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
    });
  }
}
