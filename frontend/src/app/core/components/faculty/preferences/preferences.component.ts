import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

import { MaterialComponents } from '../../../imports/material.component';
import { ThemeService } from '../../../services/theme/theme.service';
import { TimeFormatPipe } from '../../../pipes/time-format/time-format.pipe';
import { TimeSelectionDialogComponent } from '../../../../shared/time-selection-dialog/time-selection-dialog.component';
import { CourseService, Course } from '../../../services/course/courses.service';
import { MatSymbolDirective } from '../../../imports/mat-symbol.directive';
import { CustomDialogComponent, DialogData } from '../../../../shared/custom-dialog/custom-dialog.component';

interface TableData extends Course {
  preferredDay: string;
  preferredTime: string;
}

@Component({
  selector: 'app-preferences',
  standalone: true,
  imports: [MaterialComponents, CommonModule, TimeSelectionDialogComponent, TimeFormatPipe, MatSymbolDirective],
  templateUrl: './preferences.component.html',
  styleUrls: ['./preferences.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [CourseService],
})
export class PreferencesComponent implements OnInit, OnDestroy {
  subjects: Course[] = [];
  totalUnits = 0;
  maxUnits = 25;
  loading = true;
  isDarkMode = false;

  displayedColumns: string[] = [
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

  daysOfWeek = [
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
    private themeService: ThemeService,
    private cdr: ChangeDetectorRef,
    private dialog: MatDialog,
    private courseService: CourseService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.themeSubscription = this.themeService.isDarkTheme$.subscribe(
      (isDark) => {
        this.isDarkMode = isDark;
        this.cdr.markForCheck();
      }
    );

    this.loadCourses();
  }

  ngOnDestroy() {
    this.themeSubscription.unsubscribe();
  }

  loadCourses() {
    this.loading = true;
    this.courseService.getCourses().subscribe(
      (courses) => {
        this.subjects = courses;
        this.loading = false;
        this.cdr.markForCheck();
      },
      (error) => {
        console.error('Error loading courses:', error);
        this.loading = false;
        this.cdr.markForCheck();
      }
    );
  }

  addSubjectToTable(course: Course) {
    if (this.totalUnits + course.total_units > this.maxUnits) {
      this.showSnackBar('Maximum units have been reached.');
      return;
    }

    const newTableData: TableData = {
      ...course,
      preferredDay: '',
      preferredTime: '',
    };
    this.dataSource.data = [...this.dataSource.data, newTableData];
    this.updateTotalUnits();
  }

  removeSubject(subject_code: string) {
    this.dataSource.data = this.dataSource.data.filter(
      (subject) => subject.subject_code !== subject_code
    );
    this.updateTotalUnits();
  }

  onDayChange(element: TableData, event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    const newDay = selectElement.value;

    this.dataSource.data = this.dataSource.data.map((item) =>
      item.subject_code === element.subject_code
        ? { ...item, preferredDay: newDay }
        : item
    );
    this.cdr.markForCheck();
  }

  updateTotalUnits() {
    this.totalUnits = this.dataSource.data.reduce(
      (total, subject) => total + subject.total_units,
      0
    );
    this.cdr.markForCheck();
  }

  openTimeDialog(element: TableData): void {
    const [startTime, endTime] = element.preferredTime
      ? element.preferredTime.split(' - ')
      : ['', ''];

    this.dialog
      .open(TimeSelectionDialogComponent, {
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
    const submittedData = {
      faculty_id: facultyId,
      preferences: this.dataSource.data.map(
        ({ course_id, preferredDay, preferredTime }) => ({
          course_id,
          preferred_day: preferredDay,
          preferred_time: preferredTime,
        })
      ),
    };

    this.courseService.submitPreferences(submittedData).subscribe(
      () => this.showSnackBar('Preferences submitted successfully.'),
      (error) => {
        console.error('Error submitting preferences:', error);
        this.showSnackBar('Error submitting preferences.');
      }
    );
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
      .open(CustomDialogComponent, {
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

  showSnackBar(message: string) {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
    });
  }
}
