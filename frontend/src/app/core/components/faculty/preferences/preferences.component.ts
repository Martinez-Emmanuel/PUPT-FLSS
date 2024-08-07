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
import {
  MockSubjectService,
  Subject,
} from '../../../mocks/mock-subject.service';

interface TableData {
  subjectCode: string;
  subjectTitle: string;
  lec: number;
  lab: number;
  units: number;
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
  ],
  templateUrl: './preferences.component.html',
  styleUrls: ['./preferences.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PreferencesComponent implements OnInit, OnDestroy {
  subjects: Subject[] = [];
  totalUnits: number = 0;
  maxUnits: number = 25;

  tableData: TableData[] = [];

  displayedColumns: string[] = [
    'action',
    'num',
    'subjectCode',
    'subjectTitle',
    'lec',
    'lab',
    'units',
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
    private mockSubjectService: MockSubjectService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    // Subscribe to theme service
    this.themeSubscription = this.themeService.isDarkTheme$.subscribe(
      (isDark) => {
        this.isDarkMode = isDark;
        this.cdr.markForCheck();
      }
    );

    // Load subjects on initialization
    this.loadSubjects();
  }

  ngOnDestroy() {
    // Unsubscribes from the theme subscription
    this.themeSubscription.unsubscribe();
  }

  // Loads subjects from the *MOCK* service
  loadSubjects() {
    this.mockSubjectService.getSubjects().subscribe(
      (subjects) => {
        this.subjects = subjects;
        this.cdr.markForCheck();
      },
      (error) => console.error('Error loading subjects:', error)
    );
  }

  // Adds a subject to the table if max units are not exceeded
  addSubjectToTable(subject: Subject) {
    if (this.totalUnits + subject.units > this.maxUnits) {
      this.snackBar.open('Maximum units have been reached.', 'Close', {
        duration: 3000,
        horizontalPosition: 'center',
        verticalPosition: 'bottom',
      });
      return;
    }

    const newTableData: TableData = {
      subjectCode: subject.code,
      subjectTitle: subject.title,
      lec: subject.lec,
      lab: subject.lab,
      units: subject.units,
      preferredDay: '',
      preferredTime: '',
    };
    this.dataSource.data = [...this.dataSource.data, newTableData];
    this.updateTotalUnits();
  }

  // Removes a subject from the table based on its code
  removeSubject(subjectCode: string) {
    this.dataSource.data = this.dataSource.data.filter(
      (subject) => subject.subjectCode !== subjectCode
    );
    this.updateTotalUnits();
  }

  // Updates the preferred day for a subject
  onDayChange(element: TableData, event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    const newDay = selectElement.value;

    const updatedData = this.dataSource.data.map((item) =>
      item.subjectCode === element.subjectCode
        ? { ...item, preferredDay: newDay }
        : item
    );
    this.dataSource.data = updatedData;
    this.cdr.markForCheck();
  }

  // Updates the total units based on subjects in the table
  updateTotalUnits() {
    this.totalUnits = this.dataSource.data.reduce(
      (total, subject) => total + subject.units,
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
      facultyId,
      preferences: this.dataSource.data,
    };
    console.log('Submitted Preferences:', submittedData);
  }
}
