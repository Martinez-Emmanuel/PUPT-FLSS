import { 
  Component, 
  OnInit, 
  OnDestroy, 
  ChangeDetectionStrategy, 
  ChangeDetectorRef,
 } from '@angular/core';
import { MaterialComponents } from '../../../imports/material.component';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

import { ThemeService } from '../../../services/theme/theme.service';
import { TimeFormatPipe } from '../../../pipes/time-format/time-format.pipe';
import { TimeSelectionDialogComponent } from '../../../../shared/time-selection-dialog/time-selection-dialog.component';
import { HttpClientModule } from '@angular/common/http';
import { 
  CourseService, 
  Course 
} from '../../../services/course/courses.service';
import { MatSymbolDirective } from '../../../imports/mat-symbol.directive';

interface TableData {
  course_id: number;
  subject_code: string;
  subject_title: string;
  lec_hours: number;
  lab_hours: number;
  total_units: number;
  preferredDay: string;
  preferredTime: string;
}

@Component({
  selector: 'app-preferences',
  standalone: true,
  imports: [
    MaterialComponents,
    CommonModule,
    TimeSelectionDialogComponent,
    TimeFormatPipe,
    MatSymbolDirective,
    HttpClientModule,
  ],
  templateUrl: './preferences.component.html',
  styleUrls: ['./preferences.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [CourseService],
})
export class PreferencesComponent implements OnInit, OnDestroy {
  subjects: Course[] = [];
  totalUnits: number = 0;
  maxUnits: number = 25;

  tableData: TableData[] = [];
  loading = true;

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

  daysOfWeek: string[] = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday',
  ];

  isDarkMode: boolean = false;
  private themeSubscription!: Subscription;
  dataSource = new MatTableDataSource<TableData>([]);

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
    // Unsubscribes from the theme subscription
    this.themeSubscription.unsubscribe();
  }

  // Loads subjects from service
  loadCourses() {
    this.loading = true; // Set loading to true before starting the request
    this.courseService.getCourses().subscribe(
      (courses) => {
        console.log('Received courses:', courses); // Log received data for testing
        this.subjects = courses;
        this.loading = false; // Set loading to false when the request completes
        this.cdr.markForCheck();
      },
      (error) => {
        console.error('Error loading courses:', error);
        this.loading = false; // Set loading to false if there's an error
      }
    );
  }

  // Adds a subject to the table if max units are not exceeded 
  addSubjectToTable(course: Course) {
    if (this.totalUnits + course.total_units > this.maxUnits) {
      this.snackBar.open('Maximum units have been reached.', 'Close', {
        duration: 3000,
        horizontalPosition: 'center',
        verticalPosition: 'bottom',
      });
      return;
    }

    const newTableData: TableData = {
      course_id: course.course_id,
      subject_code: course.subject_code,
      subject_title: course.subject_title,
      lec_hours: course.lec_hours,
      lab_hours: course.lab_hours,
      total_units: course.total_units,
      preferredDay: '',
      preferredTime: '',
    };
    this.dataSource.data = [...this.dataSource.data, newTableData];
    this.updateTotalUnits();
  }

  // Removes a subject from the table based on its code
  removeSubject(subject_code: string) {
    this.dataSource.data = this.dataSource.data.filter(
      (subject) => subject.subject_code !== subject_code
    );
    this.updateTotalUnits();
  }

 // Updates the preferred day for a subject
  onDayChange(element: TableData, event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    const newDay = selectElement.value;

    const updatedData = this.dataSource.data.map((item) =>
      item.subject_code === element.subject_code
        ? { ...item, preferredDay: newDay }
        : item
    );
    this.dataSource.data = updatedData;
    this.cdr.markForCheck();
  }

  // Updates the total units based on subjects in the table
  updateTotalUnits() {
    this.totalUnits = this.dataSource.data.reduce(
      (total, subject) => total + subject.total_units,
      0
    );
    this.cdr.markForCheck();
  }

  // Opens a mat dialog for selecting time for a subject
  openTimeDialog(element: TableData): void {
    const [startTime, endTime] = element.preferredTime
      ? element.preferredTime.split(' - ')
      : ['', ''];

    const dialogRef = this.dialog.open(TimeSelectionDialogComponent, {
      width: '250px',
      data: { startTime, endTime },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        element.preferredTime = result;
        this.cdr.markForCheck();
      }
    });
  }

  // Returns a formatted time string or a placeholder
  getFormattedTime(time: string): string {
    return time ? time : 'Select time';
  }

  // Submit preferences and log to console
  submitPreferences() {
    const facultyId = sessionStorage.getItem('faculty_id');
    const submittedData = {
      faculty_id: facultyId,
      preferences: this.dataSource.data.map((item) => ({
        course_id: item.course_id,
        preferred_day: item.preferredDay,
        preferred_time: item.preferredTime,
      })),
    };

    console.log('Submitting preferences:', JSON.stringify(submittedData)); //for testing 

    this.courseService.submitPreferences(submittedData).subscribe(
      (response) => {
        this.snackBar.open('Preferences submitted successfully.', 'Close', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'bottom',
        });
        console.log('Preferences submitted successfully:', response); //for testing 
      },
      (error) => {
        this.snackBar.open('Error submitting preferences.', 'Close', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'bottom',
        });
        console.error('Error submitting preferences:', error); //for testing 
      }
    );
  }
}
